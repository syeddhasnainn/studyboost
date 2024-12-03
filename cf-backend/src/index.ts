import { Hono } from "hono";
import Together from "together-ai";
import { YoutubeTranscript } from "youtube-transcript";
import { cors } from "hono/cors";

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
      `INSERT INTO chat_messages (chat_id, role, content) VALUES (?, ?, ?)`
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
      content: `<rag-prompt>
    <instructions>
        You are an advanced AI assistant designed to provide comprehensive, accurate, and contextually relevant information through a retrieval-augmented generation approach.

        Core Responsibilities:
        - Retrieve and synthesize relevant information from available knowledge sources
        - Generate clear, well-structured responses
        - Maintain high standards of accuracy and clarity
        - Provide contextual and nuanced explanations
        - Cite sources and be transparent about information origins
    </instructions>

    <context>
        ${context}
    </context>

    <retrieval-guidelines>
        1. Information Prioritization:
        - Prioritize most recent and relevant sources
        - Cross-reference multiple knowledge bases
        - Verify source credibility and accuracy

        2. Relevance Criteria:
        - Semantic match with original query
        - Contextual significance
        - Comprehensiveness of information
        - Source reliability and expertise

        3. Response Generation Principles:
        - Synthesize information coherently
        - Maintain logical flow
        - Provide clear explanations
        - Include relevant examples or analogies
    </retrieval-guidelines>

    <output-requirements>
        Response Structure:
        1. Clear, concise introduction
        2. Structured main explanation
        3. Supporting evidence or examples
        4. Contextual insights
        5. Summary or key takeaways

        Additional Guidelines:
        - Use precise, professional language
        - Break down complex concepts
        - Highlight important points
        - Address potential follow-up questions
    </output-requirements>

    <error-handling>
        Scenarios to Manage:
        - Insufficient information
        - Conflicting sources
        - Ambiguous queries

        Strategies:
        - Clearly communicate information limitations
        - Provide partial, most relevant information
        - Suggest additional research directions
        - Highlight source conflicts
        - Offer balanced perspectives
    </error-handling>

    <citation-protocol>
        - Always attribute retrieved information to sources
        - Provide context about source credibility
        - Distinguish between direct quotes and synthesized information
        - Acknowledge knowledge limitations
    </citation-protocol>
</rag-prompt>`,
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
    return c.json({ transcript });
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
