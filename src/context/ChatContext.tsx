"use client"

import { createContext, useContext, ReactNode, useState } from "react";

interface ChatContextType {
  resourceId: string;
  chatId: string;
  transcript: any[];
  resourceUrl: string;
  summary: string;
  setResourceId: (id: string) => void;
  setChatId: (id: string) => void;
  setTranscript: (transcript: any[]) => void;
  setResourceUrl: (url: string) => void;
  setSummary: (summary: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [resourceId, setResourceId] = useState("");
  const [chatId, setChatId] = useState("");
  const [transcript, setTranscript] = useState<any[]>([]);
  const [resourceUrl, setResourceUrl] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <ChatContext.Provider
      value={{
        resourceId,
        chatId,
        transcript,
        resourceUrl,
        summary,
        setResourceId,
        setChatId,
        setTranscript,
        setResourceUrl,
        setSummary,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
} 