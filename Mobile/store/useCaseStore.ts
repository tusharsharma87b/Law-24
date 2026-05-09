import { create } from 'zustand';
import { MOCK_CASES } from '../constants/mockData';
import { LAWYERS } from '../constants/categoryLawyers';
import { apiGet } from '../src/services/api';

// Shape for a user-registered case (form-created)
export type NewCaseForm = {
  category:     string;
  title:        string;
  section:      string;   // first chip / primary section
  caseType:     string;
  caseNumber:   string;
  court:        string;
  courtName?:   string;
  city?:        string;
  firYear?:     string;
  judge:        string;
  filedDate:    string;
  nextHearing:  string;
  assignedLawyerId?: string;
  assignedLawyerName?: string;
  notes?: string;
  urgency:      'critical' | 'high' | 'medium' | 'low';
};

type CaseRecord = typeof MOCK_CASES[0] & Record<string, any>;
export type CaseEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'hearing' | 'filing' | 'evidence' | 'note' | 'update' | 'document' | 'lawyer' | 'order' | 'support';
};
export type CaseConcern = {
  id: string;
  caseId: string;
  issueType: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open';
  createdAt: string;
};
export type CaseTicket = {
  id: string;
  caseId: string;
  type: 'lawyer_review';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
  lawyerId?: string;
  reason?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  assignedTo: 'internal_team';
  resolution: string | null;
};
export type CaseDocument = {
  id: string;
  name: string;
  type: 'document' | 'audio' | 'video' | 'chat' | 'official' | 'affidavit';
  folder?: 'Case Documents' | 'Evidence Files' | 'Court Submissions' | 'Personal Uploads' | 'Lawyer Shared';
  subtype?: string;
  format: string;
  caseId: string;
  caseTag: string;
  tags: string[];
  uploadedBy: 'user' | 'lawyer';
  verificationStatus: 'verified' | 'pending';
  courtReady: boolean;
  size: number;
  uri: string;
  createdAt: string;
};
export type CaseReminder = {
  caseId: string;
  date: string;
  triggered: boolean;
};

interface CaseState {
  cases: CaseRecord[];
  isHydrating: boolean;
  hydrateError: string | null;
  reminders: CaseReminder[];
  user: { walletBalance: number };
  activeCaseId: string | null;
  selectedSubCaseId: string | null;

  setActiveCase:      (id: string) => void;
  setSelectedSubCase: (id: string) => void;
  getCategoryPeers:   (caseId: string) => CaseRecord[];
  getCaseGroups: () => Array<{ category: string; subCases: CaseRecord[] }>;

  /** Register a new case from the user-filled form */
  addCase: (form: NewCaseForm) => string;   // returns new case id
  setCases: (updater: (prev: CaseRecord[]) => CaseRecord[]) => void;
  updateCase: (caseId: string, patch: Partial<CaseRecord>) => void;
  refreshStatuses: () => void;
  addEvent: (caseId: string, event: Omit<CaseEvent, 'id'>) => void;
  addDocument: (caseId: string, doc: Omit<CaseDocument, 'id' | 'createdAt'>) => void;
  deleteDocument: (caseId: string, docId: string) => void;
  updateDocument: (caseId: string, docId: string, patch: Partial<CaseDocument>) => void;
  assignLawyer: (caseId: string, lawyer: any) => void;
  createLawyerReviewTicket: (payload: { caseId: string; lawyerId?: string; reason?: string; note?: string }) => string | null;
  resolveLawyerReviewTicket: (caseId: string, resolution: 'Lawyer is fine' | 'Replacement recommended') => void;
  closeLawyerReviewTicket: (caseId: string) => void;
  refreshLawyerReviewSLAs: () => void;
  deductWalletForCase: (caseId: string, amount: number) => boolean;
  raiseConcern: (concern: Omit<CaseConcern, 'id' | 'status' | 'createdAt'>) => void;
  addReminder: (reminder: CaseReminder) => void;
  updateCaseStage: (caseId: string, stage: string) => void;
  hydrateFromApi: (userId: string) => Promise<void>;
}

type TimelineStep = { step: string; done: boolean };

const STORAGE_KEY = 'law24_cases_v1';
const STORAGE_REMINDERS_KEY = 'law24_case_reminders_v1';

const normalizeCategory = (category: string): string => {
  const c = (category || '').toLowerCase();
  if (c.includes('criminal')) return 'Criminal';
  if (c.includes('matrimonial') || c.includes('family')) return 'Matrimonial';
  if (c.includes('civil')) return 'Civil';
  if (c.includes('employment') || c.includes('labour')) return 'Labour';
  return 'General';
};

export const generateTimeline = (category: string): TimelineStep[] => {
  const normalized = normalizeCategory(category);
  if (normalized === 'Criminal') {
    return [
      { step: 'FIR Filed', done: true },
      { step: 'Charge Sheet', done: false },
      { step: 'Trial', done: false },
      { step: 'Judgment', done: false },
    ];
  }
  if (normalized === 'Matrimonial') {
    return [
      { step: 'Petition Filed', done: true },
      { step: 'Mediation', done: false },
      { step: 'Hearing', done: false },
      { step: 'Order', done: false },
    ];
  }
  return [
    { step: 'Case Filed', done: true },
    { step: 'Proceedings', done: false },
    { step: 'Judgment', done: false },
  ];
};

export const getInitialStage = (category: string): string => {
  const first = generateTimeline(category)[0];
  return first?.step ?? 'Case Filed';
};

export const getNextStep = (caseItem: CaseRecord): string => {
  if (!Array.isArray(caseItem.documents) || caseItem.documents.length === 0) return 'Upload supporting documents';
  if (caseItem.stage === 'Filing') return 'Complete filing process';
  if (caseItem.stage === 'Evidence') return 'Submit evidence documents';
  if (caseItem.stage === 'Trial') return 'Prepare for court hearing';
  return 'Monitor case progress';
};

export const matchLawyers = (category: string, city?: string, urgency?: string) => {
  const normalized = normalizeCategory(category);
  let filtered = LAWYERS.filter((l) => {
    const c = l.category.toLowerCase();
    if (normalized === 'Criminal') return c.includes('criminal');
    if (normalized === 'Matrimonial') return c.includes('family');
    if (normalized === 'Labour') return c.includes('employment') || c.includes('labour');
    if (normalized === 'Civil') return c.includes('civil') || c.includes('documentation');
    return true;
  });

  if (city) {
    filtered = filtered.filter((l) => l.city.toLowerCase().includes(city.toLowerCase()));
  }

  if ((urgency || '').toLowerCase() === 'critical') {
    filtered = filtered.filter((l) => l.isOnline);
  }

  return filtered.slice(0, 3);
};

export const getCTA = (lawyer: { isOnline?: boolean } | undefined, urgency?: string): string => {
  if (!lawyer?.isOnline) return 'Notify when available';
  if ((urgency || '').toLowerCase() === 'critical') return 'Connect instantly';
  return 'Start Chat';
};

const getLawyerRate = (lawyer: any): number => {
  if (!lawyer) return 0;
  if (typeof lawyer.rate === 'number') return lawyer.rate;
  if (typeof lawyer.price === 'number') return lawyer.price;
  if (typeof lawyer?.fees?.chatPerMinInr === 'number') return lawyer.fees.chatPerMinInr;
  if (typeof lawyer?.fees?.call30minInr === 'number') return Math.round(lawyer.fees.call30minInr / 30);
  return 0;
};

const toISODate = (value?: string): string => {
  const parsed = value ? new Date(value) : new Date();
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
};

const enrichEventsWithAI = (events: CaseEvent[]): CaseEvent[] =>
  events.map((e) => ({
    ...e,
    aiNote: 'Typical court process step based on Indian judiciary flow',
  } as CaseEvent));

const generateDefaultEvents = (caseItem: CaseRecord): CaseEvent[] => {
  const events: CaseEvent[] = [];
  const filedDate = new Date(caseItem.filedDate || Date.now());
  const safeFiledDate = Number.isNaN(filedDate.getTime()) ? new Date() : filedDate;

  events.push({
    id: `EV-${caseItem.id}-DEFAULT-FILED`,
    title: 'Case Filed',
    description: 'Your case has been officially filed',
    date: safeFiledDate.toISOString(),
    type: 'filing',
  });

  const stages = [
    'Notice Issued',
    'First Hearing',
    'Reply Filed',
    'Interim Hearing',
    'Arguments Stage',
    'Evidence Submission',
  ];

  let currentDate = new Date(safeFiledDate);
  stages.forEach((stage, index) => {
    currentDate = new Date(currentDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    events.push({
      id: `EV-${caseItem.id}-DEFAULT-${index + 2}`,
      title: stage,
      description: `${stage} completed`,
      date: currentDate.toISOString(),
      type: 'hearing',
    });
  });

  if ((caseItem.stage || '').toLowerCase() === 'evidence') {
    events.push({
      id: `EV-${caseItem.id}-DEFAULT-EVIDENCE`,
      title: 'Evidence Stage Active',
      description: 'Court is reviewing submitted evidence',
      date: new Date().toISOString(),
      type: 'evidence',
    });
  }

  const hearingDate = caseItem.nextHearing || caseItem.hearingDate;
  if (hearingDate) {
    events.push({
      id: `EV-${caseItem.id}-DEFAULT-HEARING`,
      title: 'Next Hearing Scheduled',
      description: 'Your next court date is scheduled',
      date: toISODate(hearingDate),
      type: 'hearing',
    });
  }

  return enrichEventsWithAI(events).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const syncTimelineEvents = (caseItem: CaseRecord): CaseEvent[] => {
  const existing = Array.isArray(caseItem.events) ? [...caseItem.events] : [];
  const timelineFlow = Array.isArray(caseItem.timelineFlow) ? caseItem.timelineFlow : [];
  const completed = timelineFlow.filter((step: TimelineStep) => step.done);
  const additions: CaseEvent[] = [];

  completed.forEach((step: TimelineStep, idx: number) => {
    const title = step.step;
    const alreadyExists = existing.some((ev) => (ev.title || '').toLowerCase() === title.toLowerCase());
    if (alreadyExists) return;
    const eventDate = new Date(toISODate(caseItem.filedDate));
    eventDate.setDate(eventDate.getDate() + idx * 10);
    additions.push({
      id: `EV-${caseItem.id}-TL-${idx + 1}`,
      title,
      description: `${title} completed`,
      date: eventDate.toISOString(),
      type: title.toLowerCase().includes('evidence') ? 'evidence' : 'note',
    });
  });

  return additions;
};

const ensureCoreEvents = (caseItem: CaseRecord, existingEvents: CaseEvent[]): CaseEvent[] => {
  const additions: CaseEvent[] = [];
  const hasFiled = existingEvents.some((ev) => (ev.title || '').toLowerCase() === 'case filed');
  if (!hasFiled) {
    additions.push({
      id: `EV-${caseItem.id}-CORE-FILED`,
      title: 'Case Filed',
      description: 'Your case has been officially filed',
      date: toISODate(caseItem.filedDate),
      type: 'filing',
    });
  }
  const hearingDate = caseItem.nextHearing || caseItem.hearingDate;
  const hasHearing = existingEvents.some((ev) => (ev.title || '').toLowerCase() === 'next hearing scheduled');
  if (hearingDate && !hasHearing) {
    additions.push({
      id: `EV-${caseItem.id}-CORE-HEARING`,
      title: 'Next Hearing Scheduled',
      description: 'Your next court date is scheduled',
      date: toISODate(hearingDate),
      type: 'hearing',
    });
  }
  return additions;
};

const maybeAddCourtOrderEvent = (caseItem: CaseRecord, existingEvents: CaseEvent[]): CaseEvent[] => {
  const stage = (caseItem.stage || '').toLowerCase();
  if (stage !== 'judgment') return [];
  const hasOrder = existingEvents.some((ev) => (ev.type === 'order') || (ev.title || '').toLowerCase().includes('court order issued'));
  if (hasOrder) return [];
  return [{
    id: `EV-${caseItem.id}-ORDER`,
    title: 'Court Order Issued',
    description: 'Final order passed by court',
    date: new Date().toISOString(),
    type: 'order',
  }];
};

const toComparableDate = (value?: string): number => {
  if (!value) return Number.NaN;
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
  const fallback = new Date(`${value}T00:00:00`);
  return fallback.getTime();
};

const applyLifecycleStatus = (item: CaseRecord): CaseRecord => {
  const hearingTs = toComparableDate(item.nextHearing);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const completed = Number.isFinite(hearingTs) && now.getTime() > hearingTs;
  const status = completed ? 'completed' : (item.status || 'active');
  const timeline = Array.isArray(item.timeline) ? item.timeline : [];
  const safeTimeline = timeline.map((step: any, idx: number) => {
    if (step?.step) return step;
    return { step: item.stages?.[idx] ?? `Step ${idx + 1}`, done: idx === 0 };
  });
  const baseEvents = Array.isArray(item.events) && item.events.length > 0
    ? [...item.events]
    : generateDefaultEvents(item);
  const coreEvents = ensureCoreEvents(item, baseEvents);
  const timelineEvents = syncTimelineEvents({ ...item, events: [...baseEvents, ...coreEvents] } as CaseRecord);
  const orderEvents = maybeAddCourtOrderEvent(item, [...baseEvents, ...coreEvents, ...timelineEvents]);
  const allEvents = enrichEventsWithAI([...baseEvents, ...coreEvents, ...timelineEvents, ...orderEvents]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return {
    ...item,
    status,
    timeline: safeTimeline,
    events: allEvents,
    nextAction: getNextStep({ ...item, timeline: safeTimeline } as CaseRecord),
  };
};

const loadInitialCases = (): CaseRecord[] => {
  const fallback = (MOCK_CASES as CaseRecord[]).map(applyLifecycleStatus);
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.map((c) => applyLifecycleStatus(c as CaseRecord));
  } catch {
    return fallback;
  }
};

const persistCases = (cases: CaseRecord[]) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch {
    // ignore persistence errors (private mode/quota)
  }
};

const loadInitialReminders = (): CaseReminder[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistReminders = (reminders: CaseReminder[]) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(reminders));
  } catch {
    // ignore storage failures
  }
};

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: loadInitialCases(),
  isHydrating: false,
  hydrateError: null,
  reminders: loadInitialReminders(),
  user: { walletBalance: 1000 },
  activeCaseId: null,
  selectedSubCaseId: null,

  setActiveCase:      (id) => set({ activeCaseId: id, selectedSubCaseId: id }),
  setSelectedSubCase: (id) => set({ selectedSubCaseId: id }),

  getCategoryPeers: (caseId) => {
    const { cases } = get();
    const target = cases.find((c) => c.id === caseId);
    if (!target) return [];
    const cat = target.category;
    return cases.filter((c) => c.category === cat);
  },
  getCaseGroups: () => {
    const { cases } = get();
    const grouped: Record<string, CaseRecord[]> = {};
    cases.forEach((c) => {
      const cat = ((c as any).category ?? 'other') as string;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(c);
    });
    return Object.entries(grouped).map(([category, subCases]) => ({ category, subCases }));
  },

  addCase: (form) => {
    const id = `CASE-USR-${Date.now()}`;
    const matchedLawyers = matchLawyers(form.category, form.city, form.urgency);
    const selectedLawyer = matchedLawyers[0];
    const timelineFlow = generateTimeline(form.category);
    const autoEvents: CaseEvent[] = [
      {
        id: `EV-${id}-FILED`,
        title: 'Case Filed',
        description: `${form.title || form.section || 'Case'} created.`,
        date: form.filedDate || new Date().toISOString(),
        type: 'filing',
      },
      ...(form.nextHearing ? [{
        id: `EV-${id}-HEARING`,
        title: 'Next Hearing',
        description: `Hearing scheduled for ${form.nextHearing}`,
        date: form.nextHearing,
        type: 'hearing' as const,
      }] : []),
    ];
    const newCase: CaseRecord = {
      id,
      category:           form.category,
      title:              form.title || form.section,
      chips:              form.section ? [form.section] : [],
      type:               form.caseType,
      successProbability: 0,
      urgency:            form.urgency,
      stage:              getInitialStage(form.category),
      stages:             ['Filing', 'Hearing', 'Judgment', 'Closed'],
      activeStageIndex:   0,
      court:              form.court,
      judge:              form.judge,
      caseNumber:         form.caseNumber,
      filedDate:          form.filedDate,
      nextHearing:        form.nextHearing,
      notes:              form.notes ?? '',
      freeReplacementUsed: false,
      tickets:            [],
      concerns:           [],
      createdAt:          new Date().toISOString(),
      status:             'active',
      priority:           form.urgency === 'critical',
      cta:                getCTA(selectedLawyer, form.urgency),
      nextAction:         'Upload supporting documents',
      pendingActions:     [],
      aiStrategy:         'Once you add more case details, NyayaAI will generate a personalised strategy for this case.',
      aiSteps:            [],
      documents:          [],
      events:             autoEvents,
      timelineFlow,
      timeline:           timelineFlow.map((step, idx) => ({
        id: `T-${idx + 1}`,
        date: idx === 0
          ? (form.filedDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
          : '',
        time: '',
        type: step.done ? 'success' : 'info',
        title: step.step,
        desc: step.done ? 'Completed' : 'Pending',
        done: step.done,
      })),
      similarCases:       [],
      lawyer: form.assignedLawyerName
        ? {
            ...((MOCK_CASES[0] as any).lawyer ?? {}),
            name: form.assignedLawyerName,
            initials: form.assignedLawyerName
              .replace(/^Adv\.\s*/i, '')
              .split(' ')
              .slice(0, 2)
              .map((p: string) => p[0]?.toUpperCase() ?? '')
              .join(''),
          }
        : selectedLawyer
          ? {
              ...((MOCK_CASES[0] as any).lawyer ?? {}),
              name: selectedLawyer.name,
              initials: selectedLawyer.name
                .replace(/^Adv\.\s*/i, '')
                .split(' ')
                .slice(0, 2)
                .map((p: string) => p[0]?.toUpperCase() ?? '')
                .join(''),
              isOnline: selectedLawyer.isOnline,
            }
          : (MOCK_CASES[0] as any).lawyer,
    } as any;

    set((state) => {
      const nextCases = [...state.cases, applyLifecycleStatus(newCase)];
      persistCases(nextCases);
      return { cases: nextCases };
    });
    return id;
  },
  setCases: (updater) => {
    set((state) => {
      const nextCases = updater(state.cases).map(applyLifecycleStatus);
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  updateCase: (caseId, patch) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const prevHearing = c.nextHearing || c.hearingDate || '';
        const nextHearing = (patch.nextHearing || patch.hearingDate || prevHearing || '') as string;
        const hearingChanged = Boolean(nextHearing) && prevHearing !== nextHearing;
        const updateEvent: CaseEvent = {
          id: `EV-${Date.now()}-UPDATE`,
          title: 'Case Updated',
          description: 'Case details were modified',
          date: new Date().toISOString(),
          type: 'update',
        };
        const hearingEvent: CaseEvent | null = hearingChanged ? {
          id: `EV-${Date.now()}-RESCHEDULED`,
          title: 'Hearing Rescheduled',
          description: 'New hearing date updated',
          date: toISODate(nextHearing),
          type: 'hearing',
        } : null;
        const merged = {
          ...c,
          ...patch,
          nextHearing,
          updatedAt: new Date().toISOString(),
          events: [updateEvent, ...(hearingEvent ? [hearingEvent] : []), ...(c.events ?? [])],
        } as CaseRecord;
        return applyLifecycleStatus(merged);
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  refreshStatuses: () => {
    set((state) => {
      const nextCases = state.cases.map(applyLifecycleStatus);
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  addEvent: (caseId, event) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const nextEvent: CaseEvent = { ...event, id: `EV-${Date.now()}` };
        return applyLifecycleStatus({ ...c, events: [nextEvent, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  addDocument: (caseId, doc) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const nextDoc: CaseDocument = {
          ...doc,
          id: `DOC-${Date.now()}`,
          createdAt: new Date().toISOString(),
          caseId,
        };
        const event: CaseEvent = {
          id: `EV-${Date.now()}-DOC`,
          title: 'Document Uploaded',
          description: nextDoc.name,
          date: nextDoc.createdAt,
          type: 'document',
        };
        return applyLifecycleStatus({ ...c, documents: [nextDoc, ...((c.documents ?? []) as any)] as any, events: [event, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  deleteDocument: (caseId, docId) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return applyLifecycleStatus({ ...c, documents: ((c.documents ?? []) as any).filter((d: any) => d.id !== docId) });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  updateDocument: (caseId, docId, patch) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const docs = ((c.documents ?? []) as any).map((d: any) => (d.id === docId ? { ...d, ...patch } : d));
        return applyLifecycleStatus({ ...c, documents: docs as any });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  assignLawyer: (caseId, lawyer) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const hadLawyer = Boolean(c.lawyer?.name);
        const event: CaseEvent = {
          id: `EV-${Date.now()}-LAWYER`,
          title: hadLawyer ? 'Lawyer Changed' : 'Lawyer Assigned',
          description: hadLawyer ? `Switched to ${lawyer.name}` : `${lawyer.name} assigned to case`,
          date: new Date().toISOString(),
          type: 'lawyer',
        };
        return applyLifecycleStatus({
          ...c,
          lawyer: { ...lawyer, rate: getLawyerRate(lawyer) },
          tickets: (c.tickets ?? []).map((t: CaseTicket) => t.status === 'CLOSED' ? t : { ...t, status: 'CLOSED', updatedAt: new Date().toISOString() }),
          events: [event, ...(c.events ?? [])],
        });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  createLawyerReviewTicket: ({ caseId, lawyerId, reason, note }) => {
    const ticketId = `TICKET-${Date.now()}`;
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const alreadyOpen = (c.tickets ?? []).some((t: CaseTicket) =>
          t.type === 'lawyer_review' && ['OPEN', 'IN_REVIEW', 'ESCALATED'].includes(t.status),
        );
        if (alreadyOpen) return c;
        const nowIso = new Date().toISOString();
        const deadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const ticket: CaseTicket = {
          id: ticketId,
          caseId,
          type: 'lawyer_review',
          status: 'OPEN',
          lawyerId,
          reason,
          note,
          createdAt: nowIso,
          updatedAt: nowIso,
          slaDeadline: deadline,
          assignedTo: 'internal_team',
          resolution: null,
        };
        const event: CaseEvent = {
          id: `EV-${Date.now()}-TICKET-OPEN`,
          title: 'Support Ticket Created',
          description: `Lawyer review requested${reason ? `: ${reason}` : ''}`,
          date: nowIso,
          type: 'support',
        };
        return applyLifecycleStatus({ ...c, tickets: [ticket, ...(c.tickets ?? [])], events: [event, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
    return ticketId;
  },
  resolveLawyerReviewTicket: (caseId, resolution) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        let resolvedAny = false;
        const tickets = (c.tickets ?? []).map((t: CaseTicket) => {
          if (t.type === 'lawyer_review' && ['OPEN', 'IN_REVIEW', 'ESCALATED'].includes(t.status) && !resolvedAny) {
            resolvedAny = true;
            return { ...t, status: 'RESOLVED', resolution, updatedAt: new Date().toISOString() };
          }
          return t;
        });
        if (!resolvedAny) return c;
        const event: CaseEvent = {
          id: `EV-${Date.now()}-TICKET-RESOLVED`,
          title: 'Support Ticket Resolved',
          description: resolution,
          date: new Date().toISOString(),
          type: 'support',
        };
        return applyLifecycleStatus({ ...c, tickets, events: [event, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  closeLawyerReviewTicket: (caseId) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const tickets = (c.tickets ?? []).map((t: CaseTicket) =>
          t.type === 'lawyer_review' && t.status !== 'CLOSED' ? { ...t, status: 'CLOSED', updatedAt: new Date().toISOString() } : t
        );
        return applyLifecycleStatus({ ...c, tickets });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  refreshLawyerReviewSLAs: () => {
    set((state) => {
      const now = Date.now();
      const nextCases = state.cases.map((c) => {
        let changed = false;
        const tickets = (c.tickets ?? []).map((t: CaseTicket) => {
          if (t.type !== 'lawyer_review') return t;
          if (['CLOSED', 'RESOLVED'].includes(t.status)) return t;
          const deadline = new Date(t.slaDeadline).getTime();
          if (Number.isFinite(deadline) && now > deadline && t.status !== 'ESCALATED') {
            changed = true;
            return { ...t, status: 'ESCALATED', updatedAt: new Date().toISOString() };
          }
          return t;
        });
        if (!changed) return c;
        const escalationEvent: CaseEvent = {
          id: `EV-${Date.now()}-SLA-ESCALATE`,
          title: 'Lawyer Review Escalated',
          description: '48-hour SLA breached. Escalated to support admin.',
          date: new Date().toISOString(),
          type: 'support',
        };
        return applyLifecycleStatus({ ...c, tickets, events: [escalationEvent, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  deductWalletForCase: (caseId, amount) => {
    if (amount <= 0) return true;
    const { user } = get();
    if ((user.walletBalance ?? 0) < amount) return false;
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const event: CaseEvent = {
          id: `EV-${Date.now()}-WALLET`,
          title: 'Wallet Charge',
          description: `₹${amount} deducted for lawyer upgrade`,
          date: new Date().toISOString(),
          type: 'support',
        };
        return applyLifecycleStatus({ ...c, events: [event, ...(c.events ?? [])] });
      });
      persistCases(nextCases);
      return { cases: nextCases, user: { ...state.user, walletBalance: Math.max(0, state.user.walletBalance - amount) } };
    });
    return true;
  },
  raiseConcern: (concernInput) => {
    set((state) => {
      const concern: CaseConcern = {
        id: `CONCERN-${Date.now()}`,
        caseId: concernInput.caseId,
        issueType: concernInput.issueType,
        description: concernInput.description,
        priority: concernInput.priority,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      const nextCases = state.cases.map((c) => {
        if (c.id !== concern.caseId) return c;
        const concernEvent: CaseEvent = {
          id: `EV-${Date.now()}-CONCERN`,
          title: 'Concern Raised',
          description: concern.issueType,
          date: concern.createdAt,
          type: 'support',
        };
        return applyLifecycleStatus({
          ...c,
          concerns: [concern, ...(c.concerns ?? [])],
          events: [concernEvent, ...(c.events ?? [])],
        });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  addReminder: (reminder) => {
    set((state) => {
      const next = [...state.reminders, reminder];
      persistReminders(next);
      return { reminders: next };
    });
  },
  updateCaseStage: (caseId, stage) => {
    set((state) => {
      const nextCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        const idx = Math.max(0, (c.stages ?? []).findIndex((s: string) => s.toLowerCase() === stage.toLowerCase()));
        const updatedFlow = Array.isArray(c.timelineFlow) && c.timelineFlow.length
          ? c.timelineFlow.map((s: TimelineStep, i: number) => ({ ...s, done: i <= idx }))
          : generateTimeline(c.category).map((s, i) => ({ ...s, done: i <= idx }));
        const stageEvent: CaseEvent = {
          id: `EV-${Date.now()}-STAGE`,
          title: 'Stage Updated',
          description: `Case moved to ${stage}`,
          date: new Date().toISOString(),
          type: 'note',
        };
        return applyLifecycleStatus({
          ...c,
          stage,
          activeStageIndex: idx,
          timelineFlow: updatedFlow,
          events: [stageEvent, ...(c.events ?? [])],
        });
      });
      persistCases(nextCases);
      return { cases: nextCases };
    });
  },
  hydrateFromApi: async (userId) => {
    set({ isHydrating: true, hydrateError: null });
    try {
      const [casesRes, docsRes] = await Promise.all([
        apiGet(`/cases/${userId}`),
        apiGet('/documents'),
      ]);
      const docsByCase = new Map<string, any[]>();
      if (Array.isArray(docsRes)) {
        docsRes.forEach((d: any) => {
          const key = String(d.caseId ?? '');
          if (!docsByCase.has(key)) docsByCase.set(key, []);
          docsByCase.get(key)?.push({
            id: String(d.id),
            name: String(d.fileName ?? 'Document'),
            type: String(d.type ?? 'document'),
            format: 'unknown',
            caseId: key,
            caseTag: 'General',
            tags: Array.isArray(d.tags) ? d.tags : [],
            uploadedBy: 'user',
            verificationStatus: 'pending',
            courtReady: false,
            size: 0,
            uri: '',
            createdAt: new Date().toISOString(),
          });
        });
      }
      if (Array.isArray(casesRes)) {
        const normalized = casesRes.map((c: any) =>
          applyLifecycleStatus({
            id: String(c.id),
            category: String(c.category ?? 'civil'),
            title: String(c.title ?? 'Case'),
            chips: [String(c.caseType ?? c.category ?? 'General')],
            type: String(c.caseType ?? 'Civil'),
            successProbability: Number(c.successProbability ?? 0),
            urgency: (String(c.urgency ?? 'medium') as any),
            stage: String(c.stage ?? 'Filing'),
            stages: ['Filing', 'Hearing', 'Judgment', 'Closed'],
            activeStageIndex: 0,
            court: String(c.courtName ?? c.court ?? ''),
            judge: String(c.judge ?? ''),
            caseNumber: String(c.caseNumber ?? ''),
            filedDate: String(c.filedDate ?? new Date().toISOString()),
            nextHearing: String(c.nextHearing ?? ''),
            notes: String(c.notes ?? ''),
            freeReplacementUsed: false,
            tickets: [],
            concerns: [],
            createdAt: String(c.createdAt ?? new Date().toISOString()),
            status: String(c.status ?? 'active'),
            priority: Boolean(c.priority),
            cta: 'Start Chat',
            nextAction: 'Monitor case progress',
            pendingActions: [],
            aiStrategy: '',
            aiSteps: [],
            documents: docsByCase.get(String(c.id)) ?? [],
            events: [],
            timelineFlow: generateTimeline(String(c.category ?? 'civil')),
            timeline: [],
            similarCases: [],
            lawyer: (MOCK_CASES[0] as any).lawyer,
          } as any)
        );
        set({ cases: normalized });
      }
    } catch (e) {
      set({ hydrateError: (e as Error).message || 'Failed to load cases/documents' });
    } finally {
      set({ isHydrating: false });
    }
  },
}));
