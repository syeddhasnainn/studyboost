"use client";

import { fetchTranscript } from "@/actions/transcript";
import { useState } from "react";

export default function TestPage() {
  const [transcript, setTranscript] = useState<any>(null);

  const handleClick = async () => {
    const transcript = await fetchTranscript("NFvOMwfRkaM");
    setTranscript(transcript);
  };

  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <div>{JSON.stringify(transcript)}</div>
    </div>
  );
}
