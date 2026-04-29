import { create } from 'zustand';
import { DIRECTORY_LAWYERS, type DirectoryLawyer } from '../constants/lawyersDirectory';
import { MOCK_LAWYERS, type Lawyer } from '../constants/mockData';
import { apiGet } from '../src/services/api';

type LawyerDataState = {
  directoryLawyers: DirectoryLawyer[] | null;
  featuredLawyers: Lawyer[] | null;
  isHydrating: boolean;
  hydrated: boolean;
  byId: Record<string, Lawyer>;
  hydrateLawyerData: () => Promise<void>;
  preloadLawyerData: (id: string) => void;
};

export const useLawyerDataStore = create<LawyerDataState>((set, get) => ({
  directoryLawyers: null,
  featuredLawyers: null,
  isHydrating: false,
  hydrated: false,
  byId: {},
  hydrateLawyerData: async () => {
    const state = get();
    if (state.hydrated || state.isHydrating) return;
    set({ isHydrating: true });
    try {
      let featuredLawyers: Lawyer[] = MOCK_LAWYERS;
      let directoryLawyers: DirectoryLawyer[] = DIRECTORY_LAWYERS;
      try {
        const rows = await apiGet('/lawyers');
        if (Array.isArray(rows) && rows.length > 0) {
          featuredLawyers = rows.map((r: any, idx: number) => ({
            id: String(r.id),
            name: String(r.name ?? 'Advocate'),
            designation: String(r.specialization ?? 'Legal Expert'),
            verified: true,
            verifiedPlus: false,
            barCouncilId: String(r.barCouncilId ?? `BAR/${idx + 1}`),
            experienceYears: Number(r.experienceYears ?? 5),
            city: String(r.city ?? 'Delhi'),
            state: String(r.state ?? 'Delhi'),
            servesRemote: true,
            specializations: [String(r.specialization ?? 'General Law')],
            languages: Array.isArray(r.languages) ? r.languages : ['English', 'Hindi'],
            courts: [{ name: String(r.court ?? 'District Court'), since: Number(r.since ?? 2018) }],
            cases: { total: 0, won: 0, lost: 0, settled: 0, winRatePercent: 0, byCategory: {} },
            fees: {
              chatPerMinuteInr: Number(r.pricePerMin ?? 20),
              call30minInr: Number(r.pricePerMin ?? 20) * 30,
              call60minInr: Number(r.pricePerMin ?? 20) * 60,
              documentReviewInr: 500,
              inPersonPerHourInr: 2500,
            },
            rating: { average: Number(r.rating ?? 4.5), totalReviews: Number(r.reviewCount ?? 0), breakdown: {} },
            isOnline: Boolean(r.availability ?? true),
            responseTimeMinutes: Number(r.responseTimeMinutes ?? 2),
            bio: String(r.bio ?? ''),
            initials: String(r.name ?? 'Law')
              .split(' ')
              .map((p: string) => p[0] ?? '')
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            avatarColor: '#4F46E5',
          }));
          directoryLawyers = featuredLawyers.map((l) => ({
            id: l.id,
            profileId: l.id,
            name: l.name.replace(/^Adv\.\s*/i, ''),
            category: 'civil',
            specialization: l.specializations[0] ?? l.designation,
            city: l.city,
            state: l.state,
            rating: l.rating.average,
            reviews: l.rating.totalReviews,
            pricePerMin: l.fees.chatPerMinuteInr,
            online: l.isOnline,
            responseTime: `${l.responseTimeMinutes} mins`,
            responseTimeMinutes: l.responseTimeMinutes,
            languages: l.languages.slice(0, 3),
            experience: l.experienceYears,
            verified: l.verified,
            initials: l.initials,
            avatarColor: l.avatarColor,
            courtType: 'district',
            queue: 0,
            lastSeen: l.isOnline ? null : 'Recently',
          }));
        }
      } catch {}
      const byId = Object.fromEntries(featuredLawyers.map((l) => [l.id, l]));
      set({
        directoryLawyers,
        featuredLawyers,
        byId,
        hydrated: true,
      });
    } finally {
      set({ isHydrating: false });
    }
  },
  preloadLawyerData: (id: string) => {
    const state = get();
    if (state.byId[id]) return;
    const match = MOCK_LAWYERS.find((l) => l.id === id);
    if (!match) return;
    set((prev) => ({ byId: { ...prev.byId, [id]: match } }));
  },
}));

