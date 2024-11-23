import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface IPayload {
  id: string;
  values: number[];
  metadata: { text: string };
}
export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { chunks } = (await request.json()) as { chunks: string[] };
  console.log("chunks type", typeof chunks);
  const embeddingResponse = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
    text: chunks,
  });

  const embeddings = embeddingResponse.data;
  const payload = chunks.map((text, index) => ({
    id: index.toString(),
    values: embeddings[index],
    metadata: {
      text: text,
    },
  }));

  try {
    await env.VECTORIZE.insert(payload);
    return NextResponse.json({ payload });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
