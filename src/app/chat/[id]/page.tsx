"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { PDFViewer } from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { VideoTranscript } from "@/components/VideoTranscript";
import { useStore } from "@/hooks/use-store";
import * as ResizablePrimitive from "react-resizable-panels";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";

export default function Page({ params }: { params: { id: string } }) {
  const {
    messages,
    addMessage,
    resourceId,
    setResourceId,
    transcript,
    resourceUrl,
    setResourceUrl,
    setMessages,
    chatId,
    setChatId,
  } = useStore();

  useEffect(() => {
    if (params.id) {
      const checkMessages = async () => {
        const messages = await fetch(`http://localhost:8787/db/getMessages?chatId=${params.id}`);
        const data = (await messages.json()) as { messages: any[] };
        console.log(data);
        setMessages(data.messages);
      };
      checkMessages();
    }
  }, [params.id, setMessages]);

  const [isLoading, setIsLoading] = useState(false);

  const questionRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = questionRef.current?.value;

      if (query?.trim()) {
        setIsLoading(true);
        const newMessage = { role: "user", content: query };
        addMessage(newMessage);

        const resp = await fetch(`http://localhost:8787/chat`, {
          method: "POST",
          body: JSON.stringify({
            message: newMessage,
            resourceId,
            chatId,
          }),
        });

        if (!resp.body) return;

        const reader = resp.body.getReader();
        addMessage({ role: "assistant", content: "" });
        setIsLoading(false);

        const decoder = new TextDecoder();
        let done = false;
        let assistantResponse = "";

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const content = decoder.decode(value);
          assistantResponse += content;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = assistantResponse;
            return updated;
          });
        }

        await fetch(`http://localhost:8787/chat`, {
          method: "PUT",
          body: JSON.stringify({
            chatId,
            content: assistantResponse,
          }),
        });

        if (questionRef.current) {
          questionRef.current.value = "";
        }
      }
    }
  }

  useEffect(() => {
    const checkDb = async () => {
      const existingChats = await fetch(`http://localhost:8787/db/getChats`);
      const { results } = (await existingChats.json()) as { results: any[] };
      console.log(results);
    };
    checkDb();
  }, [params.id]);

  useEffect(() => {
    const checkDb = async () => {
      const existingChat = await fetch(`http://localhost:8787/db/check?resourceId=${params.id}`);
      const { chat } = (await existingChat.json()) as { chat: any };
      if (chat) {
        console.log("chat already exists");
        setResourceId(chat.resource_id);
        setChatId(chat.chat_id);
        setResourceUrl(chat.resource_link);
      }
    };
    checkDb();
  }, [params.id, setResourceId, setResourceUrl, setChatId]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" /> */}
            {/* <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>PDF Viewer</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
          </div>
        </header>

        <div className="flex flex-1 p-4 pt-0 ">
          <ResizablePrimitive.PanelGroup
            direction="horizontal"
            className="gap-4"
          >
            <ResizablePanel defaultSize={60} minSize={50}>
              {!resourceUrl?.includes("youtube") ? (
                <div className="h-[calc(100vh-6rem)] rounded-lg flex flex-col gap-4">
                  <PDFViewer url={resourceUrl} />
                </div>
              ) : (
                <div className="h-[calc(100vh-6rem)] rounded-lg flex flex-col gap-4">
                  <div>
                    <iframe
                      src={`https://www.youtube.com/embed/${resourceId}`}
                      className="w-full aspect-video rounded-lg"
                      allowFullScreen
                    />
                  </div>

                  <Button variant="secondary">Get transcript</Button>
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <VideoTranscript />
                  </div>
                </div>
              )}
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-[calc(100vh-6rem)] flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Button variant="secondary">Chat</Button>
                    <Button variant="secondary">Summary</Button>
                  </div>

                  <div className="messages flex-1 overflow-y-auto">
                    <ul className="flex flex-col gap-2 px-4">
                      {messages.map((message, index) => (
                        <li
                          className={`p-3 rounded-xl max-w-[85%] ${
                            message.role === "user"
                              ? "bg-gray-200 ml-auto"
                              : "bg-gray-100"
                          }`}
                          key={index}
                        >
                          {message.content}
                        </li>
                      ))}
                      {isLoading && (
                        <li className="animate-pulse">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <Textarea
                autoFocus
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
