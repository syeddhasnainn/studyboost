"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { PDFViewer } from "@/components/PDFViewer";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { VideoTranscript } from "@/components/VideoTranscript";
import { useStore } from "@/hooks/use-store";
import * as ResizablePrimitive from "react-resizable-panels";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";

export default function Page() {
  const { messages, addMessage, videoId, setVideoId, transcript } = useStore();
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const questionRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = questionRef.current?.value;

      if (query?.trim()) {
        const newMessage = { role: "user", content: query };
        addMessage(newMessage);
        console.log("messages", messages);
        const resp = await fetch(`/api/chat`, {
          method: "POST",
          body: JSON.stringify({
            messages: [...messages, newMessage],
          }),
        });

        const data = await resp.json();
        addMessage({ role: "assistant", content: data.response.response });
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>PDF Viewer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 p-4 pt-0 ">
          <ResizablePrimitive.PanelGroup
            direction="horizontal"
            className="gap-4"
          >
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-[calc(100vh-6rem)] rounded-lg flex flex-col gap-4">
                <div>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full aspect-video rounded-lg"
                    allowFullScreen
                  />
                </div>

                <Button variant="secondary">Get transcript</Button>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <VideoTranscript videoId={videoId} />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={80} minSize={30}>
              <div className="h-[calc(100vh-6rem)] flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Button variant="secondary">Chat</Button>
                    <Button variant="secondary">Summary</Button>
                  </div>

                  <div className="messages flex-1 overflow-y-auto">
                    <ul className="flex flex-col gap-2">
                      {messages.map((message, index) => (
                        <li className="bg-gray-100 p-2 rounded-xl" key={index}>
                          {message.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Textarea
                  onKeyDown={handleSubmit}
                  placeholder="Ask a question"
                  className="min-h-[80px] resize-none"
                  ref={questionRef}
                />
              </div>
            </ResizablePanel>
          </ResizablePrimitive.PanelGroup>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
