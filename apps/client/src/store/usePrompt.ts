import { create } from "zustand";

interface PromptStore {
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  prompt: "",
  setPrompt: (prompt: string) => set({ prompt }),
}));
