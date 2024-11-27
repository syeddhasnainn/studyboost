import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { YoutubeTranscript } from "youtube-transcript";
import Together from "together-ai";

const app = new Hono().basePath("/api");

// Initialize Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// Helper function for streaming
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

// Helper function for chat streaming
async function* makeIterator(messages: any) {
  const stream = await together.chat.completions.create({
    model: "meta-llama/Llama-3-8b-chat-hf",
    messages: messages,
    stream: true,
  });

  const encoder = new TextEncoder();
  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content;
    if (content) {
      yield encoder.encode(content);
    }
  }
}

// Chat routes
app.post("/chat", async (c) => {
  const { env } = await getCloudflareContext();
  const { message, resourceId, chatId } = await c.req.json();

  const existingMessages = await env.DB.prepare(`
    SELECT role, content 
    FROM chat_messages 
    WHERE chat_id = ? 
    ORDER BY created_at ASC
  `)
    .bind(chatId)
    .all();

  if (message.role === "user") {
    await env.DB.prepare(
      `INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)`
    )
      .bind(chatId, message.role, message.content)
      .run();
  }

  const embeddingResponse = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: message.content,
  });

  const embeddings = embeddingResponse.data[0];
  const queryEmbeddings = await env.VECTORIZE.query(embeddings, {
    topK: 2,
    filter: { resourceId },
    returnMetadata: "all",
  });

  const context = queryEmbeddings.matches
    .map((m) => m.metadata?.text)
    .join(" ");

  const messagesForAI = [
    {
      role: "system",
      content: `You are a helpful assistant. You have to answer the question based on the following context: ${context}`,
    },
    ...existingMessages.results,
    message,
  ];

  const iterator = makeIterator(messagesForAI);
  const streamer = iteratorToStream(iterator);

  return new Response(streamer, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
});

app.put("/chat", async (c) => {
  const { env } = await getCloudflareContext();
  const { chatId, content } = await c.req.json();

  await env.DB.prepare(
    `INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)`
  )
    .bind(chatId, "assistant", content)
    .run();

  return c.json({ success: true });
});

// Vector routes
app.post("/vectors", async (c) => {
  try {
    const { chunks, resourceId } = await c.req.json();

    if (!chunks?.length || !resourceId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { env } = await getCloudflareContext();
    if (!env?.AI || !env?.VECTORIZE) {
      return c.json({ error: "Vector service unavailable" }, 503);
    }

    const { data: embeddings } = await env.AI.run(
      "@cf/baai/bge-small-en-v1.5",
      { text: chunks }
    );

    const payload = chunks.map((text: string, index: number) => ({
      id: `${resourceId}_${index}`,
      values: embeddings[index],
      metadata: { text, resourceId },
    }));

    const inserted = await env.VECTORIZE.upsert(payload);

    return c.json({
      success: true,
      message: "Vectors inserted successfully",
      data: { inserted },
    });
  } catch (error) {
    console.error("Vector insertion error:", error);
    return c.json({
      success: false,
      error: "Failed to process vector insertion",
      details: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

// Database routes
app.post("/db", async (c) => {
  const { env } = await getCloudflareContext();
  const { resourceId, chatId, resourceUrl } = await c.req.json();

  const upload = await env.DB.prepare(
    'INSERT INTO chats (resource_id, chat_id, resource_link) VALUES (?, ?, ?)'
  )
    .bind(resourceId, chatId, resourceUrl)
    .run();

  return c.json({ message: "success" });
});

app.get("/db/check", async (c) => {
  try {
    const resourceId = c.req.query("resourceId");

    if (!resourceId) {
      return c.json({ error: "Resource ID is required" }, 400);
    }

    const { env } = await getCloudflareContext();
    const result = await env.DB.prepare(
      "SELECT * FROM chats WHERE resource_id = ? LIMIT 1"
    )
      .bind(resourceId)
      .first();

    return c.json({ chat: result });
  } catch (error) {
    return c.json({ error: "Failed to check database" }, 500);
  }
});

app.get("/db/getMessages", async (c) => {
  try {
    const chatId = c.req.query("chatId");

    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }

    const { env } = await getCloudflareContext();
    const messages = await env.DB.prepare(`
      SELECT role, content 
      FROM chat_messages 
      WHERE chat_id = ? 
      ORDER BY created_at ASC
    `)
      .bind(chatId)
      .all();

    return c.json({ messages: messages.results });
  } catch (error) {
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.get("/db/getChats", async (c) => {
  const { env } = await getCloudflareContext();
  const { results } = await env.DB.prepare("SELECT * FROM chats").all();
  return c.json({ results });
});

// YouTube transcript route
app.get("/youtube/transcript", async (c) => {
  const videoId = c.req.query("videoId");

  if (!videoId) {
    return c.json({ error: "Video ID is required" }, 400);
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return c.json({ transcript });
  } catch (error) {
    return c.json({ error: "Failed to fetch transcript" }, 500);
  }
});

// File upload route
app.post("/upload", async (c) => {
  try {
    const { env } = await getCloudflareContext();
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const upload = await env.MY_BUCKET.put(file.name, file, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const objectUrl = `https://pub-89064af8ffde4fb9b9df3498ccd7b80a.r2.dev/${file.name}`;

    return c.json({
      success: true,
      objectUrl,
      upload,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    return c.json({ error: "Upload failed" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);