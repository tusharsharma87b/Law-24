import { create } from 'zustand';

export type ChatMessage = {
  id: string;
  threadId: string;
  role: 'user' | 'lawyer';
  text: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  caseId: string;
  lawyerId: string;
  lawyerName: string;
  messages: ChatMessage[];
  updatedAt: number;
};

type ChatState = {
  threads: ChatThread[];
  getOrCreateThread: (payload: { caseId: string; lawyerId: string; lawyerName: string }) => ChatThread;
  sendMessage: (payload: { threadId: string; text: string }) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],

  getOrCreateThread: ({ caseId, lawyerId, lawyerName }) => {
    const existing = get().threads.find((t) => t.caseId === caseId && t.lawyerId === lawyerId);
    if (existing) return existing;
    const id = `chat-${caseId}-${lawyerId}`;
    const now = Date.now();
    const thread: ChatThread = {
      id,
      caseId,
      lawyerId,
      lawyerName,
      updatedAt: now,
      messages: [
        {
          id: `${id}-seed-lawyer`,
          threadId: id,
          role: 'lawyer',
          text: `Hi, I am ${lawyerName}. I reviewed your case details. How can I help?`,
          createdAt: now,
        },
      ],
    };
    set((s) => ({ threads: [thread, ...s.threads] }));
    return thread;
  },

  sendMessage: ({ threadId, text }) => {
    if (!text.trim()) return;
    set((s) => ({
      threads: s.threads.map((t) => {
        if (t.id !== threadId) return t;
        const createdAt = Date.now();
        const userMsg: ChatMessage = {
          id: `${threadId}-${createdAt}-u`,
          threadId,
          role: 'user',
          text: text.trim(),
          createdAt,
        };
        const lawyerMsg: ChatMessage = {
          id: `${threadId}-${createdAt + 1}-l`,
          threadId,
          role: 'lawyer',
          text: 'Noted. I will review and get back with the next legal step shortly.',
          createdAt: createdAt + 1,
        };
        return {
          ...t,
          updatedAt: createdAt + 1,
          messages: [...t.messages, userMsg, lawyerMsg],
        };
      }),
    }));
  },
}));
