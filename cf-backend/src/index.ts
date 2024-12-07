import { Hono } from "hono";
import Together from "together-ai";
import { YoutubeTranscript } from "youtube-transcript";
import { cors } from "hono/cors";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface Bindings {
  MY_BUCKET: R2Bucket;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  TOGETHER_API_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>();

let together: Together;

app.use("*", async (c, next) => {
  if (!together) {
    together = new Together({
      apiKey: c.env.TOGETHER_API_KEY,
    });
  }
  await next();
});

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

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

app.post("/chat", async (c) => {
  const { message, resourceId, chatId } = await c.req.json();
  console.log("resource id received", resourceId);
  console.log("chat id received", chatId);
  console.log("message received", message);

  const existingMessages = await c.env.DB.prepare(
    `
    SELECT role, content 
    FROM chat_messages 
    WHERE chat_id = ? 
    ORDER BY created_at ASC
  `
  )
    .bind(chatId)
    .all();

  console.log("existingMessages", existingMessages);

  if (message.role === "user") {
    await c.env.DB.prepare(
      `INSERT INTO chat_messages (chat_id, role, content, created_at) 
       VALUES (?, ?, ?, datetime('now'))`
    )
      .bind(chatId, message.role, message.content)
      .run();
  }

  const embeddingResponse = await c.env.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: message.content,
  });

  const embeddings = embeddingResponse.data[0];
  console.log("embeddings", embeddings);
  const queryEmbeddings = await c.env.VECTORIZE.query(embeddings, {
    filter: { resourceId: resourceId },
    topK: 5,
    returnMetadata: "all",
  });
  console.log("embeddings with filter", embeddings);

  console.log("queryEmbeddings", queryEmbeddings);

  const context = queryEmbeddings.matches
    .map((m) => m.metadata?.text)
    .join(" ");

  console.log("context", context);

  const messagesForAI = [
    {
      role: "system",
      content: `<instructions>
      You are a helpful assistant. You will be given a context from a video or a document. Your job is to answer the user's question based on the context. Do not mention the context in your response. And do not use the word "context" in your response.
      </instructions>
      
      <context>
      ${context}
      </context>
      `,
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
  const { chatId, content } = await c.req.json();

  await c.env.DB.prepare(
    `INSERT INTO chat_messages (chat_id, role, content, created_at) 
     VALUES (?, ?, ?, datetime('now'))`
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
    if (!c.env?.AI || !c.env?.VECTORIZE) {
      return c.json({ error: "Vector service unavailable" }, 503);
    }

    const { data: embeddings } = await c.env.AI.run(
      "@cf/baai/bge-small-en-v1.5",
      { text: chunks }
    );

    const payload = chunks.map((text: string, index: number) => ({
      id: `${resourceId}_${index}`,
      values: embeddings[index],
      metadata: { text, resourceId },
    }));

    const inserted = await c.env.VECTORIZE.upsert(payload);

    return c.json({
      success: true,
      message: "Vectors inserted successfully",
      data: { inserted },
    });
  } catch (error) {
    console.error("Vector insertion error:", error);
    return c.json(
      {
        success: false,
        error: "Failed to process vector insertion",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Database routes
app.post("/db", async (c) => {
  const { resourceId, chatId, resourceUrl } = await c.req.json();

  const upload = await c.env.DB.prepare(
    "INSERT INTO chats (resource_id, chat_id, resource_link) VALUES (?, ?, ?)"
  )
    .bind(resourceId, chatId, resourceUrl)
    .run();

  return c.json({ message: "success" });
});

app.get("/db/check", async (c) => {
  try {
    const chatId = c.req.query("chatId");

    if (!chatId) {
      return c.json({ error: "Resource ID is required" }, 400);
    }

    const result = await c.env.DB.prepare(
      "SELECT * FROM chats WHERE chat_id = ? LIMIT 1"
    )
      .bind(chatId)
      .first();

    return c.json({ chat: result });
  } catch (error) {
    return c.json({ error: "Failed to check database" }, 500);
  }

  // const resourceId = c.req.query("resourceId");
});

app.get("/db/getMessages", async (c) => {
  try {
    const chatId = c.req.query("chatId");

    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }

    const messages = await c.env.DB.prepare(
      `
      SELECT role, content 
      FROM chat_messages 
      WHERE chat_id = ? 
      ORDER BY created_at ASC
    `
    )
      .bind(chatId)
      .all();

    return c.json({ messages: messages.results });
  } catch (error) {
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.get("/db/getChats", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM chats").all();
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
    if (!transcript.length || transcript[0].lang !== "en") {
      return c.json({ error: "No transcript found" }, 400);
    }
    const textForSummary = transcript
      .map((entry) => `${entry.text} - ${entry.offset}`)
      .join(" | ");

    console.log("textForSummary", textForSummary);

    const summarySchema = z.array(
      z.object({
        title: z.string().describe("title of the chapter"),
        summary: z.string().describe("summary of the chapter"),
        timestamp: z.number().describe("timestamp of the chapter"),
      })
    );


    const jsonSchema = zodToJsonSchema(summarySchema, "summarySchema");

    const processedSummary = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "The following is a youtube transcript with timestamps. Analyze the text and make multiple chapters with title, summary and the starting timestamp only that is in the transcript. The chapters should always be in the same order as the transcript. The summaries should be atleast 50-100 words. Only answer in JSON.",
        },
        {
          role: "user",
          content: textForSummary,
        },
      ],
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      // @ts-ignore
      response_format: { type: "json_object", schema: jsonSchema },
    });

    if (processedSummary?.choices?.[0]?.message?.content) {
      const summary = JSON.parse(
        processedSummary?.choices?.[0]?.message?.content
      );
      console.log(summary);
      return c.json({ summary, transcript });
    }

  } catch (error) {
    return c.json({ error: "Failed to fetch transcript" }, 500);
  }
});

// File upload route
app.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    const upload = await c.env.MY_BUCKET.put(file.name, file, {
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

export default app;
