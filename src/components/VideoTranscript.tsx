import { useStore } from "@/hooks/use-store";
import { useEffect } from "react";
import useSWR from "swr";

interface TranscriptEntry {
  offset: string;
  text: string;
}

interface TranscriptResponse {
  transcript: TranscriptEntry[];
}

interface VideoTranscriptProps {
  videoId: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<TranscriptResponse>;

export function VideoTranscript({ videoId }: VideoTranscriptProps) {
  const { data, error, isLoading } = useSWR(
    videoId ? `/api/youtube/transcript?videoId=${videoId}` : null,
    fetcher,
  );

  useEffect(() => {
    if (!data?.transcript) return;

    async function uploadTranscript(transcript: TranscriptEntry[]) {
      const CHUNK_SIZE = 100;
      const chunks = [];

      for (let i = 0; i < transcript.length; i += CHUNK_SIZE) {
        const mergedText = transcript
          .slice(i, i + CHUNK_SIZE)
          .map((entry) => entry.text)
          .join(" ");
        chunks.push(mergedText);
      }


      try {
        const vectorUploadResponse = await fetch(`/api/vectors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({chunks}),
        });

        const result = await vectorUploadResponse.json();
        console.log("vectorUploadResponse", result);
      } catch (error) {
        console.error("Failed to upload transcript:", error);
      }
    }

    uploadTranscript(data.transcript).catch(console.error);
  }, [data?.transcript]);

  if (error)
    return <div className="text-red-500">Failed to load transcript</div>;
  if (isLoading)
    return <div className="animate-pulse">Loading transcript...</div>;
  if (!data?.transcript) return null;

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted rounded-lg overflow-y-auto">
      {data.transcript.map((entry, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{entry.offset}</span>
          <p className="text-sm">{entry.text}</p>
        </div>
      ))}
    </div>
  );
}
