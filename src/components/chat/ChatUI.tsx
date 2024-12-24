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
import React, { useEffect, useRef, useState } from "react";
import { VideoTranscript } from "@/components/VideoTranscript";
import { useStore } from "@/hooks/use-store";
import * as ResizablePrimitive from "react-resizable-panels";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ChatMessagesProps } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
export interface ChatInfoProps {
  chat: {
    chat_id: string;
    resource_id: string;
    resource_link: string;
  };
}

export function ChatUI({
  chatInfo,
  messages,
}: {
  chatInfo: ChatInfoProps;
  messages: ChatMessagesProps[];
}) {
  const resourceUrl = chatInfo.chat.resource_link;
  const resourceId = chatInfo.chat.resource_id;

  const [chatMessages, setChatMessages] =
    useState<ChatMessagesProps[]>(messages);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  const { addMessage, chatId, setChatId, setMessages } = useStore();


  const [isLoading, setIsLoading] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = questionRef.current?.value;

      if (query?.trim()) {
        setIsLoading(true);
        const newMessage = { role: "user", content: query };
        setChatMessages([...chatMessages, newMessage]);

        if (questionRef.current) {
          questionRef.current.value = "";
        }

        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
          method: "POST",
          body: JSON.stringify({
            message: newMessage,
            resourceId,
            chatId: chatInfo.chat.chat_id,
          }),
        });

        if (!resp.body) return;

        const reader = resp.body.getReader();
        let assistantMessage = { role: "assistant", content: "" };
        const decoder = new TextDecoder();
        let done = false;

        const { value: firstChunk } = await reader.read();
        const initialContent = decoder.decode(firstChunk);
        assistantMessage.content = initialContent;
        setChatMessages([...chatMessages, newMessage, assistantMessage]);
        setIsLoading(false);

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const content = decoder.decode(value);
            assistantMessage.content += content;
            setChatMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1].content = assistantMessage.content;
              return updated;
            });
          }
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
          method: "PUT",
          body: JSON.stringify({
            chatId: chatInfo.chat.chat_id,
            content: assistantMessage.content,
          }),
        });
      }
    }
  }

  const {toast} = useToast()


  return (
    <div className="flex flex-1 p-4 my-14 pt-0 ">
      <ResizablePrimitive.PanelGroup direction="horizontal" className="gap-4">
        <ResizablePanel defaultSize={40} minSize={20}>
          {!resourceUrl?.includes("youtube") ? (
            <div className="h-[calc(100vh-6rem)] rounded-lg flex flex-col gap-4">
              {resourceUrl && <PDFViewer url={resourceUrl} />}
            </div>
          ) : (
            <div className="h-[calc(100vh-6rem)] rounded-lg flex flex-col gap-4">
              <div>
                <iframe
                  src={`https://www.youtube.com/embed/${resourceId}?enablejsapi=1`}
                  className="w-full aspect-video rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <VideoTranscript chat_id={chatInfo.chat.chat_id}/>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex gap-4 mb-4">
              {/* <Button variant="secondary">Chat</Button>
              <Button variant="secondary">Summary</Button> */}
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-4 pb-4">
                <ul className="flex flex-col gap-2">
                  {chatMessages.map((message: any, index: any) => (
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
                    <li className="flex items-center gap-2 p-3">
                      <div className="animate-spin">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="pt-4">
              <Textarea
                autoFocus
                onKeyDown={handleSubmit}
                placeholder="Ask a question"
                className="min-h-[80px] resize-none"
                ref={questionRef}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePrimitive.PanelGroup>
    </div>
  );
}
