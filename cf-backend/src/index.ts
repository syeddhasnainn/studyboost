import { Hono } from "hono";
import Together from "together-ai";
import {
  YoutubeTranscript,
  YoutubeTranscriptTooManyRequestError,
} from "youtube-transcript";
import { cors } from "hono/cors";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

interface Bindings {
  MY_BUCKET: R2Bucket;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
  TOGETHER_API_KEY: string;
  R2_URL: string;
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
    origin: [
      "*",
      "https://studyboost.vercel.app",
      "http://localhost:3000",
      "https://studyboost.org",
      "https://www.studyboost.org",
      "https://studyboost.org",
    ],
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

app.get("/", async (c) => {
  return c.json({ message: "how did you get here?" });
});

app.post("/chat", async (c) => {
  const { message, resourceId, chatId } = await c.req.json();

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
  const queryEmbeddings = await c.env.VECTORIZE.query(embeddings, {
    filter: { resourceId: resourceId },
    topK: 5,
    returnMetadata: "all",
  });

  const context = queryEmbeddings.matches
    .map((m) => m.metadata?.text)
    .join(" ");

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
app.post("/saveChat", async (c) => {
  const { resourceId, chatId, resourceUrl, userId } = await c.req.json();

  const upload = await c.env.DB.prepare(
    "INSERT INTO chats (resource_id, chat_id, resource_link, user_id) VALUES (?, ?, ?, ?)"
  )
    .bind(resourceId, chatId, resourceUrl, userId)
    .run();

  return c.json({ message: "success" });
});

app.get("/db/getChat", async (c) => {
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

app.post("/db/saveSummary", async (c) => {
  try {
    const { chat_id, summary } = await c.req.json();

    const stmt = c.env.DB.prepare(
      `INSERT INTO chapter_summaries (chat_id, title, content, timestmp) VALUES (?, ?, ?, ?);`
    );
    const batchSummary = summary.map((s: any) =>
      stmt.bind(chat_id, s.title, s.content, s.timestamp)
    );
    const batchResults = await c.env.DB.batch(batchSummary);

    return c.json({ msg: "Saved Chapter Summaries to the DB" });
  } catch {
    return c.json({ error: "Failed to store summary" }, 400);
  }
});

app.get("/db/getSummary", async (c) => {
  try {
    const chatId = c.req.query("chatId");

    if (!chatId) {
      return c.json({ error: "Chat ID is required" }, 400);
    }

    const { results } = await c.env.DB.prepare(
      `
      SELECT * from chapter_summaries WHERE CHAT_ID = ?;
    `
    )
      .bind(chatId)
      .all();

    return c.json({ summary: results });
  } catch (error) {
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

app.get("/db/getAllChats", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM chats ORDER BY created_at DESC;"
  ).all();
  return c.json({ results });
});

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

    return c.json({ transcript });
  } catch (error) {
    return c.json({ error: "Failed to fetch transcript" }, 500);
  }
});

// New route for AI summary
app.post("/getAISummary", async (c) => {
  const { textForSummary } = await c.req.json();

  if (!textForSummary) {
    return c.json({ error: "Text for summary is required" }, 400);
  }

  const summarySchema = z.array(
    z.object({
      title: z.string().describe("title of the chapter"),
      content: z.string().describe("summary of the chapter"),
      timestamp: z.number().describe("timestamp of the chapter"),
    })
  );

  const jsonSchema = zodToJsonSchema(summarySchema, "summarySchema");

  try {
    const processedSummary = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "The following is a youtube transcript with timestamps. Analyze the text and make multiple chapters with title, summary and the starting timestamp only that is in the transcript. The chapters should always be in the same order as the transcript. The summaries should be at least 50-100 words. Only answer in JSON.",
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

      return c.json({ summary });
    }
  } catch {
    return c.json({ error: "Error processing summaries" }, 400);
  }
});

// File upload route
app.post("/uploadFile", async (c) => {
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

    const objectUrl = `${c.env.R2_URL}${file.name}`;

    return c.json({
      success: true,
      objectUrl,
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

//USERS

app.post("getUser", async (c) => {
  const { user_id } = await c.req.json();
  const userData = await c.env.DB.prepare(
    "SELECT * FROM users WHERE user_id = ?"
  )
    .bind(user_id)
    .first();
  return c.json({ userData });
});

app.post("/addUser", async (c) => {
  const { user_id, first_name, last_name, avatar, email } = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO users (user_id, first_name, last_name, avatar, email) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(user_id, first_name, last_name, avatar, email)
    .run();
  return c.json({ success: "user added" });
});

export default app;
