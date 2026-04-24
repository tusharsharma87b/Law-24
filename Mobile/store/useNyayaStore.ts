import { create } from 'zustand';
import { MOCK_AI_RESPONSE } from '../constants/mockData';

interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  response?: typeof MOCK_AI_RESPONSE;
  timestamp: Date;
}

interface NyayaState {
  messages: AIMessage[];
  isLoading: boolean;
  sessionId: string | null;
  addUserMessage: (text: string) => void;
  addAIResponse: (response: typeof MOCK_AI_RESPONSE) => void;
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
          text: response.legal_basis,
          response,
          timestamp: new Date(),
        },
      ],
      isLoading: false,
    })),
  setLoading: (val) => set({ isLoading: val }),
  clearSession: () => set({ messages: [], sessionId: null }),
}));
