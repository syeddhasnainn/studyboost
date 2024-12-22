import { ChatUI } from "@/components/chat/ChatUI";

interface PageProps {
  params: {
    id: string;
  };
}

async function getMessages(chatId: string) {
  console.log("chat id from the id page", chatId)
  const response = await fetch(
    `http://localhost:8787/db/getMessages?chatId=${chatId}`,
    {
      cache: 'no-store' // Disable caching to always get fresh messages
    }
  );
  const data = await response.json();
  return data.messages;
}

async function getChatInfo(chatId: string) {
  const response = await fetch(
    `http://localhost:8787/db/check?chatId=${chatId}`,
    {
      cache: 'no-store'
    }
  );
  const data = await response.json();
  return data.chat;
}

export default async function ChatPage({ params }: PageProps) {
  const chatId = params.id;
  
  const [messages, chatInfo] = await Promise.all([
    getMessages(chatId),
    getChatInfo(chatId)
  ]);

  return (
    <ChatUI 
      chatInfo={{ chat: chatInfo }} 
      messages={messages} 
    />
  );
}
