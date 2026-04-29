import { create } from 'zustand';
import type { NyayaIntelResponse } from '../constants/nyayaLegalIntelligence';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  response?: NyayaIntelResponse;
  timestamp: Date;
}

interface NyayaState {
  messages: AIMessage[];
  isLoading: boolean;
  sessionId: string | null;
  addUserMessage: (text: string) => void;
  addAIResponse: (response: NyayaIntelResponse) => void;
  setLoading: (val: boolean) => void;
  clearSession: () => void;
}

export const useNyayaStore = create<NyayaState>((set) => ({
  messages: [],
  isLoading: false,
  sessionId: null,
  addUserMessage: (text) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { id: `msg-${Date.now()}`, role: 'user', text, timestamp: new Date() },
      ],
    })),
  addAIResponse: (response) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: `ai-${Date.now()}`,
          role: 'ai',
          text: response.case_understanding,
          response,
          timestamp: new Date(),
        },
      ],
      isLoading: false,
    })),
  setLoading: (val) => set({ isLoading: val }),
  clearSession: () => set({ messages: [], sessionId: null }),
}));
