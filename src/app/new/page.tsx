"use client";
import { Input } from "@/components/ui/input";
import { PaperclipIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Page() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      router.push(`/chat`);
    }
  };

  type UploadStatus = "idle" | "uploading" | "success" | "error";

  const handleFileChange = (e:React.ChangeEvent<HTMLInputElement>)=> {
    if(e.target.files) {
      console.log(e.target.files);
      setFile(e.target.files[0]);
    }
  }
  return (
    <main className="min-h-screen bg-white flex items-center justify-center text-white py-12">
      <div className="container max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <h1 className="text-4xl tracking-tight text-center">
          What do you want to learn
          <span className="text-zinc-500"> today?</span>
        </h1>

        {/* Upload Input */}
        <div className="relative">
          <form onSubmit={handleSubmit}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-[#09090B] border-zinc-800 rounded-xl py-6 pl-12 pr-12 text-zinc-300 placeholder:text-zinc-500"
              placeholder="Upload PDF or paste a YouTube link"
            />
          </form>

          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-3">
          
            <PaperclipIcon className="h-5 w-5 text-zinc-500" />
          </div>
        </div>
      </div>

      <div className="text-black" >
      <input onChange={handleFileChange} className="text-black" type="file" />
      {file && <p>{file.name}</p>}
      {file && <p>{file.size}</p>}

      </div>
    </main>
  );
}
