"use client";
import { PDFViewer } from "@/components/PDFViewer";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { VideoTranscript } from "@/components/VideoTranscript";
import React, { useRef, useState } from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import { Button } from "../ui/button";
import { Spinner } from "../loading";
import { fetchTranscript, getSummary } from "@/actions/transcript";

export interface ChatInfoProps {
  chat: {
    chat_id: string;
    resource_id: string;
    resource_link: string;
  };
}

interface Message {
  role: string;
  content: string;
}

interface IMessage {
  messages: Message[];
}

export function ChatUI({
  chatInfo,
  messagesResponse,
}: {
  chatInfo: any;
  messagesResponse: any;
}) {
  const {
    value: { chat },
  } = chatInfo;

  const { value: messages } = messagesResponse;
  const {
    resource_id: resourceId,
    resource_link: resourceUrl,
    chat_id: chatId,
  } = chat;

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [summary, setSummary] = useState<any>([]);
  async function handleSubmit(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = questionRef.current?.value;

      if (query?.trim()) {
        setIsChatLoading(true);
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
            chatId,
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
        setIsChatLoading(false);

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
            chatId,
            content: assistantMessage.content,
          }),
        });
      }
    }
  }

  const summarize = async () => {
    setIsSummaryLoading(true);
    try {
      const response = await getSummary(resourceId);
      setSummary(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummaryLoading(false);
    }
  };

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
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <div className="flex gap-4">
                  <Button onClick={summarize} variant="secondary">
                    Extract Summary
                  </Button>
                </div>
                <div className="mt-4 flex justify-center">
                  {isSummaryLoading ? (
                    <Spinner size="xs" />
                  ) : (
                    <VideoTranscript chatId={chatId} summary={summary} />
                  )}
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-4 pb-4">
                <ul className="flex flex-col gap-2">
                  {chatMessages.map((message: Message, index: number) => (
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
                  {isChatLoading && (
                    <li className="flex items-center gap-2 p-3">
                      <Spinner size="xs" />
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
