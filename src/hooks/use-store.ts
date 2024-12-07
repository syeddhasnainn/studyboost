import { create } from "zustand";

type Status = "idle" | "loading" | "success" | "error";

interface Message {
  role: string
  content: string;
}
interface TranscriptEntry {
  offset: string;
  text: string;
}

interface StoreState {
  messages: Array<Message>;
  addMessage: (message: Message) => void;
  setMessages: (
    messages: Array<Message> | ((prev: Array<Message>) => Array<Message>)
  ) => void;

  resourceId: string | null;
  setResourceId: (id: string) => void;
  transcript: Array<TranscriptEntry>;
  setTranscript: (transcript: Array<TranscriptEntry>) => void;
  summary: Array<any>;
  setSummary: (summary: Array<any>) => void;

  status: Status;
  setStatus: (status: Status) => void;

  chatId: string | null;
  setChatId: (chatId: string | null) => void;

  resourceUrl: string | null;
  setResourceUrl: (resourceUrl: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function" ? messages(state.messages) : messages,
    })),
  resourceId: null,
  setResourceId: (id) => set({ resourceId: id }),

  transcript: [],
  setTranscript: (transcript) => set({ transcript }),

  summary: [],
  setSummary: (summary) => set({ summary }),

  status: "idle",
  setStatus: (status) => set({ status }),

  chatId: null,
  setChatId: (chatId) => set({ chatId }),

  resourceUrl: null,
  setResourceUrl: (resourceUrl) => set({ resourceUrl }),
}));
