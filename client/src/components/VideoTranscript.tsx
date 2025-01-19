import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/loading";

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

export function VideoTranscript({ chat_id, summary }: any) {
  console.log(summary);
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/db/getSummary?chatId=${chat_id}`
  // );

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div>
        {summary && (
          <div className="space-y-4">
            {summary.map((chapter: any, index: number): any => (
              <Card
                key={index}
                className="p-4 hover:bg-gray-100 hover:cursor-pointer"
                onClick={() => handleTimestampClick(chapter.timestamp)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{chapter.title}</h4>
                  <button className="text-sm hover:text-blue-800 hover:underline">
                    {formatTime(chapter.timestamp)}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {chapter.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
