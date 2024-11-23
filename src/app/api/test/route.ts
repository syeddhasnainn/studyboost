import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext();

  const all = await env.VECTORIZE.describe();
  console.log("all", all);

  //   const embeddingResponse = await env.AI.run("@cf/baai/bge-small-en-v1.5", {
//     text: "what has taken the world by storm?",
//   });

//   const embeddings = embeddingResponse.data[0];
//   //   try {
//   //     await env.VECTORIZE.insert([
//   //       {
//   //         id,
//   //         values: embeddings,
//   //       },
//   //     ]);
//   //     return NextResponse.json({ msg: "vectors inserted" });
//   //   } catch (error) {
//   //     return NextResponse.json({ error: error }, { status: 500 });
//   //   }

//   const queryVector = await env.VECTORIZE.query(embeddings, {
//     topK: 10,
//     returnMetadata: "all",
//   });

  return NextResponse.json({ all });
}
