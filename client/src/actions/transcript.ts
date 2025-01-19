"use server";

import { YoutubeTranscript } from "youtube-transcript";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Together } from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export async function getSummary(videoId: string) {
  const transcript = await fetchTranscript(videoId);
  const summary = await getAISummary(transcript);
  return summary;
}

export async function fetchTranscript(videoId: string) {
  if (!videoId) {
    return { error: "Video ID is required" };
  }

  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  if (!transcript.length || transcript[0].lang !== "en")
    return { error: "No transcript found" };

  var transcriptText = transcript
    .map((entry) => `${entry.text} - ${entry.offset}`)
    .join(" | ");

  return transcriptText;
}

export async function getAISummary(text: any) {
  if (!text) {
    return { error: "Text for summary is required" };
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
          content: text,
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
      return summary;
    }
  } catch {
    return { error: "Error processing summaries" };
  }
}
