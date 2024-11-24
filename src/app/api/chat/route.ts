import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { messages, resourceId } = (await request.json()) as {
    messages: { role: string; content: string }[];
    resourceId: string;
  };

  const singleMessage = messages[messages.length - 1].content;

  const embeddingResponse = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: singleMessage,
  });

  const embeddings = embeddingResponse.data[0];

  const queryEmbeddings = await env.VECTORIZE.query(embeddings, {
    topK: 2,
    filter: {
      resourceId: resourceId,
    },
    returnMetadata: "all",
  });


  const context = queryEmbeddings.matches
    .map((m) => m.metadata?.text)
    .join(" ");
  const systemPrompt = {
    role: "system",
    content: `You are a helpful assistant. You have to answer the question based on the following context: ${context}`,
  };

  messages.unshift(systemPrompt);

  const response = await env.AI.run(
    "@hf/nousresearch/hermes-2-pro-mistral-7b",
    {
      messages,
    } as BaseAiTextGeneration["inputs"]
  );

  return NextResponse.json({ response });
}
