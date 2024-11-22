import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext();
  const { query } = (await request.json()) as { query: string };
  const response = await env.AI.run("@hf/thebloke/llama-2-13b-chat-awq", {
    prompt: query,
  });


  return NextResponse.json({ response });
}