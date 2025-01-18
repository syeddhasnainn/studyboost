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

export async function VideoTranscript({ chat_id }: any) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/db/getSummary?chatId=${chat_id}`
  );
  // const data = await response.json();
  const data = [
    {
      summary: [
        {
          chapter: "Introduction",
          title: "Welcome to the Course",
          content: "Overview of what will be covered in this video",
          timestmp: "0",
        },
        {
          chapter: "Chapter 1",
          title: "Getting Started",
          content: "Basic concepts and setup instructions",
          timestmp: "120",
        },
        {
          chapter: "Chapter 2",
          title: "Core Concepts",
          content: "Deep dive into the main topics",
          timestmp: "300",
        },
        {
          chapter: "Conclusion",
          title: "Wrap Up",
          content: "Summary and next steps",
          timestmp: "600",
        },
      ],
    },
  ];
  return (
    <div className="flex flex-col gap-6 mt-4">
      <div>
        {
          <div className="space-y-4">
            {data[0].summary.map((chapter: any, index: number): any => (
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
        }
      </div>
    </div>
  );
}
