"use client";

import { fetchTranscript, getSummary } from "@/actions/transcript";
import { useState } from "react";

export default function TestPage() {
  const [transcript, setTranscript] = useState<any>(null);

  const handleClick = async () => {
    const transcript = await getSummary("NFvOMwfRkaM");
    setTranscript(transcript);
  };

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <div>{JSON.stringify(transcript)}</div>
    </div>
  );
}
