"use client";

import { Input } from "@/components/ui/input";
import { PaperclipIcon } from "lucide-react";
import { useState, useRef, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/hooks/use-store";
import { nanoid } from "nanoid";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IChat, IFileUploadResponse, ITranscriptResponse } from "@/types/api";

function isValidYoutubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export function ChatForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      const chats = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/db/getAllChats`);
      const { results } = await chats.json() as { results: IChat[] };
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
          `${process.env.NEXT_PUBLIC_API_URL}/youtube/transcript?videoId=${youtubeId}`
        );
        var data = await transcriptResponse.json() as ITranscriptResponse;

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
          `${process.env.NEXT_PUBLIC_API_URL}/vectors`,
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

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saveChat`, {
        method: "POST",
        body: JSON.stringify({
          resourceId: youtubeId,
          chatId,
          resourceUrl: inputRef.current?.value,
          userId
        }),
      });

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/db/saveSummary`, {
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      handleFileUpload(droppedFile);
    } else {
      toast({
        variant: 'destructive',
        title: "Invalid file type",
        description: "Please upload a PDF file"
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadFile`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json() as IFileUploadResponse;

        const id = nanoid(10);
        setResourceUrl(data.objectUrl);
        setResourceId(id);
        setChatId(id);

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saveChat`, {
          method: "POST",
          body: JSON.stringify({
            resourceId: id,
            chatId: id,
            resourceUrl: data.objectUrl,
            userId
          }),
        });

        router.push(`/chat/${id}`);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div
        className={`flex flex-col gap-4 ${isDragging ? 'bg-secondary/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter YouTube URL or Drag and Drop PDF"
            className="w-full pr-10"
          />
          <label
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <PaperclipIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 animate" />
            <input
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
        {/* <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            "Submit"
          )}
        </Button> */}
      </div>
    </form>
  );
}
