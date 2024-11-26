import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});
const encoder = new TextEncoder();

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

  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content;
    if (content) {
      yield encoder.encode(content);
    }
  }
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { message, resourceId, chatId } = await request.json() as {
    message: { role: string; content: string };
    resourceId: string;
    chatId: string;
  };

  const existingMessages = await env.DB.prepare(`
    SELECT role, content 
    FROM chat_messages 
    WHERE chat_id = ? 
    ORDER BY created_at ASC
  `)
    .bind(chatId)
    .all();

  if (message.role === "user") {
    await env.DB.prepare(`
      INSERT INTO chat_messages (chat_id, role, content)
      VALUES (?, ?, ?)
    `)
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


  //merging system + previous messages + user message
  const messagesForAI = [
    {
      role: "system",
      content: `You are a helpful assistant. You have to answer the question based on the following context: ${context}`,
    },
    ...existingMessages.results,
    message
  ];

  const iterator = makeIterator(messagesForAI);
  const streamer = iteratorToStream(iterator);

  return new NextResponse(streamer, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

export async function PUT(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { chatId, content } = await request.json() as { chatId: string; content: string };

  await env.DB.prepare(`
    INSERT INTO chat_messages (chat_id, role, content)
    VALUES (?, ?, ?)
  `)
    .bind(chatId, "assistant", content)
    .run();

  return NextResponse.json({ success: true });
}