import { useStore } from "@/hooks/use-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";

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
    parts.push(hours.toString().padStart(2, '0'));
  }
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
}

export function VideoTranscript() {
  const { transcript, summary } = useStore();

  const handleTimestampClick = (timestamp: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      // Use YouTube Player API to seek to the timestamp
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [parseInt(timestamp), true]
        }),
        '*'
      );
    }
  };

  return (
      <div className="flex flex-col gap-6 p-4">
        <div>
          {/* <h3 className="text-lg font-semibold mb-4">Chapter Summaries</h3> */}
          <div className="space-y-4">
            {summary.map((chapter, index) => (
              <Card key={index} className="p-4 hover:bg-gray-100 hover:cursor-pointer" onClick={() => handleTimestampClick(chapter.timestamp)}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{chapter.title}</h4>
                  <button
                    className="text-sm hover:text-blue-800 hover:underline"
                  >
                    {formatTime(chapter.timestamp)}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{chapter.summary}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
  );
}
