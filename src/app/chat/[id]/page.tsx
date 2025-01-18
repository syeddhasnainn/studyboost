import { ChatUI } from "@/components/chat/ChatUI";
// import Loading from "@/components/loading";
import { IMessage } from "@/types/api";
import { Suspense } from "react";

interface PageProps {
  params: {
    id: string;
  };
}

async function getMessages(chatId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/db/getMessages?chatId=${chatId}`
  );
  const data = (await response.json()) as any;
  return data.messages;
}

async function getChatInfo(chatId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/db/getChat?chatId=${chatId}`
  );
  const data = await response.json();
  return data;
}

export default async function ChatPage({ params }: PageProps) {
  const chatId = params.id;

  const [messages, chatInfo] = await Promise.allSettled([
    getMessages(chatId),
    getChatInfo(chatId),
  ]);

  return <ChatUI chatInfo={chatInfo} messagesResponse={messages} />;
}
