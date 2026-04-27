import { create } from 'zustand';
import { sendNotification } from './useNotificationStore';

export type SupportTicketType = 'LAWYER_ISSUE' | 'PAYMENT' | 'CASE_ISSUE' | 'GENERAL';
export type SupportPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type SupportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export type SupportMessage = {
  id: string;
  role: 'user' | 'ai' | 'agent';
  text: string;
  createdAt: string;
  confidence?: number;
};

export type LawyerRecommendation = {
  lawyerId: string;
  name: string;
  rating: number;
  successRate: number;
  pricePerMinInr: number;
};

export type SupportTicket = {
  id: string;
  type: SupportTicketType;
  priority: SupportPriority;
  status: SupportStatus;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  aiResponse: string;
  assignedAgent: string | null;
  caseId?: string;
  messages: SupportMessage[];
  suggestedActions: string[];
  progress: number;
  lawyerPerformance?: {
    responseDelayHours: number;
    feedbackScore: number;
    caseProgressScore: number;
  };
  recommendations?: LawyerRecommendation[];
};

const RECOMMENDED_LAWYERS: LawyerRecommendation[] = [
  { lawyerId: 'LAW-201', name: 'Adv. Radhika Sen', rating: 4.9, successRate: 87, pricePerMinInr: 18 },
  { lawyerId: 'LAW-118', name: 'Adv. Karan Mehta', rating: 4.8, successRate: 84, pricePerMinInr: 15 },
];

const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

function getSmartActions(ticketType: SupportTicketType): string[] {
  switch (ticketType) {
    case 'LAWYER_ISSUE':
      return ['Request Lawyer Change', 'Send Reminder', 'Chat with Support'];
    case 'CASE_ISSUE':
      return ['Ask AI about your case', 'Upload missing documents', 'Chat with Support'];
    case 'PAYMENT':
      return ['View transactions', 'Retry payment', 'View invoice'];
    default:
      return ['View FAQ', 'Chat with Support'];
  }
}

function computePriority(input: {
  plan?: string;
  caseStage?: string;
  ticketType: SupportTicketType;
  lawyerInactivityHours?: number;
}): SupportPriority {
  const isPremium = input.plan === 'premium_pro' || input.plan === 'standard';
  const isTrial = (input.caseStage || '').toLowerCase().includes('trial');
  const inactivityHigh = (input.lawyerInactivityHours || 0) >= 48;
  if (isPremium || isTrial || input.ticketType === 'PAYMENT' || inactivityHigh) return 'HIGH';
  if (input.ticketType === 'GENERAL') return 'LOW';
  return 'MEDIUM';
}

async function generateAutoReply(input: {
  ticketType: SupportTicketType;
  caseTitle?: string;
  caseStage?: string;
  lawyerInactivityHours?: number;
  userMessage: string;
}): Promise<{ text: string; confidence: number }> {
  await Promise.resolve();
  if (input.ticketType === 'LAWYER_ISSUE') {
    const inactivity = input.lawyerInactivityHours ?? 0;
    return {
      text: `We understand your concern. ${input.caseTitle ? `For ${input.caseTitle}, ` : ''}your lawyer has been inactive for approximately ${inactivity} hours. We are escalating this for review. You can request a replacement lawyer now.`,
      confidence: 0.86,
    };
  }
  if (input.ticketType === 'PAYMENT') {
    return {
      text: 'We detected a payment issue and prioritized this ticket. Please verify your transaction details and retry payment from Wallet. A support specialist will intervene if this remains unresolved.',
      confidence: 0.89,
    };
  }
  if (input.ticketType === 'CASE_ISSUE') {
    return {
      text: `For your ${input.caseStage || 'active'} stage case, you can ask Nyaya AI for strategy and upload any missing documents to improve progress clarity. A human specialist can be assigned if needed.`,
      confidence: 0.75,
    };
  }
  return {
    text: 'Thanks for reaching out. We have captured your request and generated suggested next steps. If this does not solve your issue, we can connect you to a human support agent immediately.',
    confidence: 0.72,
  };
}

function computeProgress(status: SupportStatus): number {
  if (status === 'OPEN') return 20;
  if (status === 'IN_PROGRESS') return 55;
  if (status === 'RESOLVED') return 100;
  return 80;
}

type SupportEngineState = {
  tickets: SupportTicket[];
  supportChatThinking: boolean;
  createTicket: (input: {
    ticketType: SupportTicketType;
    title: string;
    description: string;
    plan?: string;
    caseId?: string;
    caseTitle?: string;
    caseStage?: string;
    lawyerInactivityHours?: number;
  }) => Promise<SupportTicket>;
  sendMessageToTicket: (input: { ticketId: string; text: string }) => Promise<void>;
  assignSupportAgent: (ticketId: string) => void;
  resolveTicket: (ticketId: string) => void;
  refreshSLAEscalations: () => void;
};

export const useSupportEngineStore = create<SupportEngineState>((set, get) => ({
  tickets: [],
  supportChatThinking: false,

  createTicket: async (input) => {
    const now = new Date();
    const priority = computePriority({
      plan: input.plan,
      caseStage: input.caseStage,
      ticketType: input.ticketType,
      lawyerInactivityHours: input.lawyerInactivityHours,
    });
    const ai = await generateAutoReply({
      ticketType: input.ticketType,
      caseTitle: input.caseTitle,
      caseStage: input.caseStage,
      lawyerInactivityHours: input.lawyerInactivityHours,
      userMessage: input.description,
    });

    const recommendations = input.ticketType === 'LAWYER_ISSUE' && (input.lawyerInactivityHours || 0) >= 48
      ? RECOMMENDED_LAWYERS
      : undefined;

    const status: SupportStatus = ai.confidence < 0.68 ? 'IN_PROGRESS' : 'OPEN';
    const assignedAgent = ai.confidence < 0.68 ? 'agent_queue_1' : null;
    const ticket: SupportTicket = {
      id: genId('SUP'),
      type: input.ticketType,
      priority,
      status,
      title: input.title,
      description: input.description,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      aiResponse: ai.text,
      assignedAgent,
      caseId: input.caseId,
      messages: [
        { id: genId('MSG-U'), role: 'user', text: input.description, createdAt: now.toISOString() },
        { id: genId('MSG-AI'), role: 'ai', text: ai.text, createdAt: new Date().toISOString(), confidence: ai.confidence },
      ],
      suggestedActions: getSmartActions(input.ticketType),
      progress: computeProgress(status),
      lawyerPerformance: input.ticketType === 'LAWYER_ISSUE' ? {
        responseDelayHours: input.lawyerInactivityHours || 0,
        feedbackScore: 3.4,
        caseProgressScore: 42,
      } : undefined,
      recommendations,
    };

    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    sendNotification('general', `${ticket.title} created with ${ticket.priority} priority.`, {
      title: 'Ticket Created',
      priority: ticket.priority === 'HIGH' ? 'high' : 'medium',
      targetRoute: '/profile/support-center',
    });
    return ticket;
  },

  sendMessageToTicket: async ({ ticketId, text }) => {
    if (!text.trim()) return;
    set({ supportChatThinking: true });
    const ticket = get().tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      set({ supportChatThinking: false });
      return;
    }

    const nowIso = new Date().toISOString();
    const userMsg: SupportMessage = { id: genId('MSG-U'), role: 'user', text: text.trim(), createdAt: nowIso };
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, updatedAt: nowIso, messages: [...t.messages, userMsg] }
          : t),
    }));

    const ai = await generateAutoReply({
      ticketType: ticket.type,
      caseStage: undefined,
      caseTitle: undefined,
      lawyerInactivityHours: ticket.lawyerPerformance?.responseDelayHours,
      userMessage: text.trim(),
    });

    const aiMsg: SupportMessage = {
      id: genId('MSG-AI'),
      role: 'ai',
      text: ai.text,
      confidence: ai.confidence,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      supportChatThinking: false,
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        const needsAgent = ai.confidence < 0.65 || /human|agent|talk to/i.test(text);
        const nextStatus: SupportStatus = needsAgent ? 'IN_PROGRESS' : t.status;
        return {
          ...t,
          status: nextStatus,
          assignedAgent: needsAgent ? (t.assignedAgent ?? 'agent_queue_1') : t.assignedAgent,
          progress: computeProgress(nextStatus),
          updatedAt: new Date().toISOString(),
          messages: [...t.messages, aiMsg],
        };
      }),
    }));
  },

  assignSupportAgent: (ticketId) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assignedAgent: 'agent_queue_1', status: 'IN_PROGRESS', progress: computeProgress('IN_PROGRESS'), updatedAt: new Date().toISOString() }
          : t),
    }));
  },

  resolveTicket: (ticketId) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'RESOLVED', progress: 100, updatedAt: new Date().toISOString() }
          : t),
    }));
    sendNotification('general', 'Your support ticket has been resolved.', {
      title: 'Ticket Resolved',
      targetRoute: '/profile/support-center',
    });
  },

  refreshSLAEscalations: () => {
    const now = Date.now();
    let escalated = 0;
    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.status === 'RESOLVED') return t;
        const deadline = new Date(t.slaDeadline).getTime();
        if (Number.isFinite(deadline) && now > deadline && t.status !== 'ESCALATED') {
          escalated += 1;
          return {
            ...t,
            status: 'ESCALATED',
            assignedAgent: t.assignedAgent ?? 'admin_escalation_queue',
            progress: computeProgress('ESCALATED'),
            updatedAt: new Date().toISOString(),
            messages: [
              ...t.messages,
              {
                id: genId('MSG-SYS'),
                role: 'agent',
                text: 'SLA breached. Ticket escalated to support admin for immediate action.',
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }
        return t;
      }),
    }));
    if (escalated > 0) {
      sendNotification('general', `${escalated} support ticket(s) escalated due to SLA breach.`, {
        title: 'SLA Escalation',
        priority: 'high',
        targetRoute: '/profile/support-center',
      });
    }
  },
}));

