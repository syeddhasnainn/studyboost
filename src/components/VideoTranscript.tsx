import { useStore } from "@/hooks/use-store";

export function VideoTranscript() {
  const { transcript } = useStore();

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted rounded-lg overflow-y-auto">
      {transcript.map((entry, index) => (
        <div key={index} className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{entry.offset}</span>
          <p className="text-sm">{entry.text}</p>
        </div>
      ))}
    </div>
  );
}
