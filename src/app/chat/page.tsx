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
import { VideoTranscript } from '@/components/VideoTranscript';

interface WorkerAIResponse {
    response: string;
}

export default function Page() {

  const fetcher = (url: string) => 
    fetch(url).then((res) => res.json()) 

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<WorkerAIResponse[]>([
    { response: "Hello! How can I help you today?" }
  ]);
  const [videoId, setVideoId] = useState('kCc8FmEb1nY');
  


  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const questionRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
    
      e.preventDefault();
      const query = questionRef.current?.value;
      console.log(query);
      if (query?.trim()) {

        setMessages((prev) => [...prev, { response: query }]);
        setQuestion(query);

        const resp = await fetch(`/api/hello`, {
          method: 'POST',
          body: JSON.stringify({ query }),
        });

        const data = await resp.json() as WorkerAIResponse;
        setMessages((prev) => [...prev, data.response]);
      }
    }
  };

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

        <div className="flex flex-1 gap-4 p-4 pt-0">
          <div className="max-w-2xl w-full overflow-hidden flex flex-col gap-4">
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
            <Button variant="secondary">Get transcript</Button>
            <VideoTranscript videoId={videoId} />
          </div>

          <div className="w-full flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Button variant="secondary">Chat</Button>
                <Button variant="secondary">Summary</Button>
              </div>

              <div className="messages">
                <ul className="flex flex-col gap-2">
                  {messages.map((message, index) => (
                    <li className="bg-gray-100 p-2 rounded-xl" key={index}>
                      {message.response}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
