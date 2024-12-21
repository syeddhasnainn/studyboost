import { useStore } from "@/hooks/use-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import React from "react";
interface ChapterSummary {
  title: string;
  timestamp: string;
  summary: string;
}

// Helper function to format seconds to HH:MM:SS
function formatTime(seconds: string): string {
  const sec = parseInt(seconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = sec % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(hours.toString().padStart(2, "0"));
  }
  parts.push(minutes.toString().padStart(2, "0"));
  parts.push(remainingSeconds.toString().padStart(2, "0"));

  return parts.join(":");
}

export function VideoTranscript({chat_id}:any) {
  const { transcript, summary, setSummary } = useStore();

  const handleTimestampClick = (timestamp: string) => {
    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      // Use YouTube Player API to seek to the timestamp
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: "seekTo",
          args: [parseInt(timestamp), true],
        }),
        "*"
      );
    }
  };

  React.useEffect(() => {
    const getSummaries = async () => {
      const resp = await fetch(`http://localhost:8787/db/getSummary?chatId=${chat_id}`);
      const { summary } = await resp.json();

      console.log(summary);
      setSummary(summary);
    };

    if(summary.length == 0) getSummaries()

  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        {/* <h3 className="text-lg font-semibold mb-4">Chapter Summaries</h3> */}
        {summary.length>0 ? (
          <div className="space-y-4">
            {summary.map((chapter, index) => (
              <Card
                key={index}
                className="p-4 hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => handleTimestampClick(chapter.timestmp)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{chapter.title}</h4>
                  <button className="text-sm hover:text-blue-800 hover:underline">
                    {formatTime(chapter.timestmp)}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {chapter.content}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">loading...</div>
        )}
      </div>
    </div>
  );
}
