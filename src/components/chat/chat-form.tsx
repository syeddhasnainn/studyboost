"use client";

import { Input } from "@/components/ui/input";
import { PaperclipIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { nanoid } from "nanoid";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function isValidYoutubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function ChatForm() {
  const {toast} = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { setResourceId, setChatId, setTranscript, setResourceUrl, setSummary } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const youtubeUrl = inputRef.current?.value.trim();

    setError(null);

    if (!youtubeUrl) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYoutubeUrl(youtubeUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    try {
      setIsLoading(true);
      setProgress(10);

      const youtubeId = youtubeUrl.split("v=")[1];
      const chats = await fetch("http://localhost:8787/db/getAllChats");
      const {results} = await chats.json();
      const filteredChats = results.filter(c => c.resource_id === youtubeId);
      const chatId = nanoid(10);

      setResourceId(youtubeId);
      setChatId(chatId);
      setResourceUrl(youtubeUrl);

      if (filteredChats[0]) {
        router.push(`/chat/${chatId}`);
        return;
      }

      setProgress(30);
      const chunks = [];
      const CHUNK_SIZE = 50;

      try {
        const transcriptResponse = await fetch(
          `http://localhost:8787/youtube/transcript?videoId=${youtubeId}`
        );
        const data = await transcriptResponse.json();
        
        setTranscript(data.transcript);
        setSummary(data.summary);

        setProgress(50);

        for (let i = 0; i < data?.transcript.length; i += CHUNK_SIZE) {
          const mergedText = data?.transcript
            .slice(i, i + CHUNK_SIZE)
            .map((entry) => entry.text)
            .join(" ");
          chunks.push(mergedText);
        }
      } catch (error) {
        toast({
          variant: 'destructive', 
          title: "Uh oh! Something went wrong.",
          description: "There was a problem fetching video",
          action: <Button className="border" onClick={handleSubmit} variant={"destructive"}>Try Again</Button>
        });
        return;
      }
      
      try {
        setProgress(70);
        const vectorUploadResponse = await fetch(
          `http://localhost:8787/vectors`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ chunks, resourceId: youtubeId }),
          }
        );
  
        await vectorUploadResponse.json();
      } catch (error) {
        toast({
          variant: 'destructive', 
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with vector db",
          action: <Button className="border" onClick={handleSubmit} variant={"destructive"}>Try Again</Button>
        });
        return;
      }

      setProgress(90);

      await fetch("http://localhost:8787/saveChat", {
        method: "POST",
        body: JSON.stringify({
          resourceId: youtubeId,
          chatId,
          resourceUrl: inputRef.current?.value,
        }),
      });

      await fetch("http://localhost:8787/db/saveSummary", {
        method: "POST",
        body: JSON.stringify({
          chat_id: chatId,
          summary: data.summary
        })
      });

      setProgress(100);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Failed to process:", error);
      setError("Failed to process the video. Please try again.");
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8787/uploadFile", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        const id = nanoid(10);
        setResourceUrl(data.objectUrl);
        setResourceId(id);
        setChatId(id);

        await fetch("http://localhost:8787/saveChat", {
          method: "POST",
          body: JSON.stringify({
            resourceId: id,
            chatId: id,
            resourceUrl: data.objectUrl,
          }),
        });

        router.push(`/chat/${id}`);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mt-8 px-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter YouTube URL"
            className="w-full pr-10"
          />
          <label
            htmlFor="file-upload"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <PaperclipIcon className="h-5 w-5 text-gray-400" />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                  handleFileUpload(file);
                }
              }}
            />
          </label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {isLoading && (
          <div className="w-full">
            <Progress value={progress} className="w-full" />
          </div>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </form>
  );
}
