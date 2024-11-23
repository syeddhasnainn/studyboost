import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { messages } = (await request.json()) as {
    messages: { role: string; content: string }[];
  };
  const singleMessage = messages[messages.length - 1].content;
  console.log("singleMessage", singleMessage);

  const embeddingResponse = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: singleMessage,
  });

  const embeddings = embeddingResponse.data[0];

  const queryEmbeddings = await env.VECTORIZE.query(embeddings);
  console.log("queryEmbeddings", queryEmbeddings);

  const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
    messages,
  });

  return NextResponse.json({ response });
}
