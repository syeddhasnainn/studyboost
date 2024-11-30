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

interface TranscriptEntry {
  offset: string;
  text: string;
}

interface TranscriptResponse {
  transcript: TranscriptEntry[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json()) as Promise<TranscriptResponse>;

function isValidYoutubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

export default function Page() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { setResourceId, setChatId, setTranscript, resourceUrl } = useStore();
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
      const chatId = nanoid(10);
      setResourceId(youtubeId);
      setChatId(chatId);
      setResourceUrl(youtubeUrl);

      setProgress(30);
      const transcriptResponse = await fetch(
        `http://localhost:8787/youtube/transcript?videoId=${youtubeId}`
      );
      const data = (await transcriptResponse.json()) as TranscriptResponse;
      setTranscript(data.transcript);

      setProgress(50);
      const CHUNK_SIZE = 50;
      const chunks = [];

      for (let i = 0; i < data?.transcript.length; i += CHUNK_SIZE) {
        const mergedText = data?.transcript
          .slice(i, i + CHUNK_SIZE)
          .map((entry) => entry.text)
          .join(" ");
        chunks.push(mergedText);
      }

      setProgress(70);
      const vectorUploadResponse = await fetch(
        `http://localhost:8787/vectors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ chunks, youtubeId }),
        }
      );

      const result = await vectorUploadResponse.json();
      setProgress(90);

      const db = await fetch("http://localhost:8787/db", {
        method: "POST",
        body: JSON.stringify({
          resourceId: youtubeId,
          chatId,
          resourceUrl: inputRef.current?.value,
        }),
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

  const { setResourceUrl } = useStore();

  const handleFileUpload = async (file: File) => {
    if (file.type === "application/pdf") {
      const formData = new FormData();
      formData.append("file", file);
      console.log("formdata", formData.get("file"));

      try {
        const response = await fetch("http://localhost:8787/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = (await response.json()) as any;
        const id = nanoid(10);
        setResourceUrl(data.objectUrl);
        setResourceId(id);
        setChatId(id);

        const db = await fetch("http://localhost:8787/db", {
          method: "POST",
          body: JSON.stringify({
            resourceId: id,
            chatId: id,
            resourceUrl: data.objectUrl,
          }),
        });

        console.log(db);

        router.push(`/chat/${id}`);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <main
      className="min-h-screen bg-white flex items-center justify-center text-black py-12"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <h1 className="text-4xl tracking-tight text-center">
          What do you want to learn
          <span className="text-zinc-500"> today?</span>
        </h1>

        {/* Upload Input */}
        <div className="relative space-y-4">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              disabled={isLoading}
              autoFocus
              ref={inputRef}
              className={`w-full bg-white rounded-xl py-6 pl-12 pr-12 text-zinc-700 placeholder:text-zinc-500 outline-none focus-visible:ring-0 ${
                error ? "border-red-500" : ""
              }`}
              placeholder="Upload PDF or paste a YouTube link"
            />
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-3 cursor-pointer"
              onClick={() => !isLoading && fileInputRef.current?.click()}
            >
              <PaperclipIcon
                className={`h-5 w-5 text-zinc-500 hover:text-zinc-400 ${
                  isLoading ? "opacity-50" : ""
                }`}
              />
            </div>
          </form>

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-zinc-500">
                  Processing your content...
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
            disabled={isLoading}
          />
        </div>
      </div>
    </main>
  );
}
