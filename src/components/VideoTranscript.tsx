import useSWR from 'swr';

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

  if (error) return <div className="text-red-500">Failed to load transcript</div>;
  if (isLoading) return <div className="animate-pulse">Loading transcript...</div>;
  if (!data) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-muted rounded-lg overflow-y-auto max-h-[500px]">
      {data.transcript.map((entry, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{entry.offset}</span>
          <p className="text-sm">{entry.text}</p>
        </div>
      ))}
    </div>
  );
} 