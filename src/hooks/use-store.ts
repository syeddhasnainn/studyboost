import { create } from "zustand";
import { devtools, persist } from 'zustand/middleware'

type Status = "idle" | "loading" | "success" | "error";
interface StoreState {
  messages: Array<{ role: string; content: string }>;
  addMessage: (message: { role: string; content: string }) => void;
  videoId: string;
  setVideoId: (videoId: string) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  status: Status;
  setStatus: (status: Status) => void;
}

export const useStore = create<StoreState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  videoId: "HB9YVYntdbY",

  setVideoId: (videoId) => set({ videoId }),
  
  
  transcript: "",
  setTranscript: (transcript) => set({ transcript }),

  status: "idle",
  setStatus: (status) => set({ status }),
}));
