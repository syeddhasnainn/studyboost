import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { LoadingSpinner } from "./ui/loading-spinner";

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

export function VideoTranscript({ chat_id }: any) {

  const handleTimestampClick = (timestamp: string) => {
    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
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

  const { data, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/db/getSummary?chatId=${chat_id}`,
    fetcher, {fallbackData: []}
  ) as any;


  return (
    <div className="flex flex-col gap-6 mt-4">
      <div>
        {isLoading ? <div className="flex items-center justify-center">
            <LoadingSpinner />

          </div>: <div className="space-y-4">
            {data.summary.map((chapter: any, index: number) : any => (
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
          </div> }
      </div>
    </div>
  );
}
