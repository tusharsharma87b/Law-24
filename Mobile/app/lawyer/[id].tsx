/**
 * Lawyer Profile — compact hero + sticky CTA panel.
 * Bottom panel shows: Available CTAs | Busy queue system | Offline state.
 * Queue slider lets users choose Chat or Call queue when lawyer is busy.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  Animated, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_LAWYERS, MOCK_REVIEWS } from '../../constants/mockData';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';

// ─── Mock busy state (replace with WebSocket / API later) ────────────────────
const MOCK_BUSY: Record<string, { type: 'chat' | 'call'; queue: number }> = {
  'LAW-001': { type: 'chat', queue: 2 },
  'LAW-002': { type: 'call', queue: 4 },
};

type LawyerState =
  | { status: 'available' }
  | { status: 'busy'; type: 'chat' | 'call'; queue: number }
  | { status: 'offline' };

function getLawyerState(l: typeof MOCK_LAWYERS[0]): LawyerState {
  if (!l.isOnline) return { status: 'offline' };
  const busy = MOCK_BUSY[l.id];
  if (busy) return { status: 'busy', ...busy };
  return { status: 'available' };
}

const TABS = ['Overview', 'Cases', 'Courts', 'Reviews'];

// ─── Animated Queue Type Slider ───────────────────────────────────────────────

function QueueTypeSlider({
  value,
  onChange,
}: {
  value: 'chat' | 'call';
  onChange: (v: 'chat' | 'call') => void;
}) {
  const { width } = useWindowDimensions();
  const trackWidth = Math.min(width - 64, 380);
  const thumbW = trackWidth / 2 - 4;

  const anim = useRef(new Animated.Value(value === 'chat' ? 0 : 1)).current;

  const select = (type: 'chat' | 'call') => {
    Animated.spring(anim, {
      toValue: type === 'chat' ? 0 : 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 2,
    }).start();
    onChange(type);
  };

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, thumbW + 4],
  });

  return (
    <View style={[qs.track, { width: trackWidth }]}>
      <Animated.View style={[qs.thumb, { width: thumbW, transform: [{ translateX: thumbTranslate }] }]} />
      <TouchableOpacity style={qs.opt} onPress={() => select('chat')} activeOpacity={0.85}>
        <Text style={[qs.optTxt, value === 'chat' && qs.optTxtActive]}>💬 Chat Queue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={qs.opt} onPress={() => select('call')} activeOpacity={0.85}>
        <Text style={[qs.optTxt, value === 'call' && qs.optTxtActive]}>📞 Call Queue</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Schedule Modal ────────────────────────────────────────────────────────────

const TOMORROW_SLOTS = [
  { id: 's1', time: 'Tomorrow 9:00 AM', icon: 'wb-sunny' },
  { id: 's2', time: 'Tomorrow 12:00 PM', icon: 'wb-sunny' },
  { id: 's3', time: 'Tomorrow 3:00 PM', icon: 'wb-cloudy' },
  { id: 's4', time: 'Tomorrow 6:00 PM', icon: 'nightlight-round' },
] as const;

function ScheduleModal({
  visible,
  onClose,
  onConfirm,
  fee30min,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (slot: string) => void;
  fee30min: number;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      slideAnim.setValue(400);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 2 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }).start(
        ({ finished }) => { if (finished) { setMounted(false); setSelected(null); } }
      );
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} accessible={false} />
      <Animated.View style={[sm.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={sm.handle} />
        <Text style={sm.title}>📅 Book a Call for Tomorrow</Text>
        <Text style={sm.sub}>30-min session · ₹{fee30min} · Pay after confirmation</Text>
        <View style={sm.slots}>
          {TOMORROW_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[sm.slot, selected === slot.id && sm.slotSelected]}
              onPress={() => setSelected(slot.id)}
              activeOpacity={0.85}
            >
              <MaterialIcons name={slot.icon as any} size={18} color={selected === slot.id ? '#4F6BFF' : '#9CA3AF'} />
              <Text style={[sm.slotTxt, selected === slot.id && sm.slotTxtSelected]}>{slot.time}</Text>
              {selected === slot.id && <MaterialIcons name="check-circle" size={16} color="#4F6BFF" />}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[sm.confirmBtn, !selected && sm.confirmBtnDisabled]}
          onPress={() => selected && onConfirm(TOMORROW_SLOTS.find((s) => s.id === selected)!.time)}
          activeOpacity={0.88}
        >
          <Text style={sm.confirmTxt}>{selected ? `Confirm — ${TOMORROW_SLOTS.find((s) => s.id === selected)?.time}` : 'Select a time slot'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Sticky Bottom Panel ──────────────────────────────────────────────────────

function BottomPanel({
  lawyer,
  state,
  onPay,
}: {
  lawyer: typeof MOCK_LAWYERS[0];
  state: LawyerState;
  onPay: (type: 'chat' | 'call') => void;
}) {
  const [queueType, setQueueType] = useState<'chat' | 'call'>('chat');
  const [inQueue, setInQueue] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduled, setScheduled] = useState<string | null>(null);
  const queuePos = state.status === 'busy' ? state.queue + 1 : 1;

  const handleScheduleConfirm = useCallback((slot: string) => {
    setScheduled(slot);
    setScheduleOpen(false);
  }, []);

  // ── Scheduled confirmation banner ──────────────────────────────────────────
  if (scheduled) {
    return (
      <View style={bp.panel}>
        <View style={bp.scheduledCard}>
          <MaterialIcons name="event-available" size={22} color={Colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={bp.scheduledTitle}>Call Scheduled!</Text>
            <Text style={bp.scheduledSlot}>{scheduled} · ₹{lawyer.fees.call30minInr}</Text>
          </View>
          <TouchableOpacity onPress={() => setScheduled(null)} hitSlop={10}>
            <Text style={bp.cancelTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Offline ────────────────────────────────────────────────────────────────
  if (state.status === 'offline') {
    return (
      <>
        <View style={bp.panel}>
          <View style={bp.offlineRow}>
            <View style={bp.offlineDot} />
            <Text style={bp.offlineTxt}>Offline · Back in a few hours</Text>
          </View>
          <View style={bp.ctaRow}>
            <TouchableOpacity style={bp.ctaSchedule} onPress={() => setScheduleOpen(true)} activeOpacity={0.88}>
              <MaterialIcons name="event" size={18} color="#fff" />
              <Text style={bp.ctaScheduleTxt}>Book for Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bp.ctaCall} activeOpacity={0.88}>
              <MaterialIcons name="notifications-none" size={18} color={Colors.primary} />
              <Text style={bp.ctaCallTxt}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScheduleModal
          visible={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          onConfirm={handleScheduleConfirm}
          fee30min={lawyer.fees.call30minInr}
        />
      </>
    );
  }

  // ── Busy ───────────────────────────────────────────────────────────────────
  if (state.status === 'busy') {
    const waitMins = Math.ceil(state.queue * lawyer.responseTimeMinutes * 0.6);
    return (
      <>
        <View style={bp.panel}>
          {/* Busy banner */}
          <View style={bp.busyBanner}>
            <View style={bp.busyDot} />
            <View style={{ flex: 1 }}>
              <Text style={bp.busyTitle}>
                In {state.type === 'chat' ? 'Chat' : 'Call'} ·{' '}
                <Text style={bp.busyCount}>{state.queue} waiting</Text>
              </Text>
              <Text style={bp.busyWait}>~{waitMins} min wait</Text>
            </View>
            <View style={bp.queueBadge}><Text style={bp.queueBadgeTxt}>#{state.queue + 1}</Text></View>
          </View>

          {!inQueue ? (
            <>
              <QueueTypeSlider value={queueType} onChange={setQueueType} />
              <View style={bp.ctaRow}>
                <TouchableOpacity style={bp.joinBtn} onPress={() => setInQueue(true)} activeOpacity={0.88}>
                  <MaterialIcons name={queueType === 'chat' ? 'chat' : 'phone'} size={16} color="#fff" />
                  <Text style={bp.joinBtnTxt}>Join {queueType === 'chat' ? 'Chat' : 'Call'} Queue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={bp.ctaScheduleSmall} onPress={() => setScheduleOpen(true)} activeOpacity={0.88}>
                  <MaterialIcons name="event" size={16} color={Colors.primary} />
                  <Text style={bp.ctaCallTxt}>Tomorrow</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={bp.joinedCard}>
              <View style={bp.joinedRow}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={bp.joinedTitle}>You're #{queuePos} in queue</Text>
              </View>
              <Text style={bp.joinedSub}>We'll notify you when it's your turn</Text>
              <View style={bp.leaveRow}>
                <TouchableOpacity style={bp.leaveBtn} onPress={() => setInQueue(false)} activeOpacity={0.8}>
                  <Text style={bp.leaveTxt}>Leave Queue</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setScheduleOpen(true)} activeOpacity={0.8}>
                  <Text style={bp.scheduleInsteadTxt}>Book Tomorrow Instead</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <ScheduleModal
          visible={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          onConfirm={handleScheduleConfirm}
          fee30min={lawyer.fees.call30minInr}
        />
      </>
    );
  }

  // ── Available ──────────────────────────────────────────────────────────────
  return (
    <>
      <View style={bp.panel}>
        <View style={bp.availRow}>
          <View style={bp.availDot} />
          <Text style={bp.availTxt}>Available now · ~{lawyer.responseTimeMinutes} min response</Text>
        </View>
        <View style={bp.ctaRow}>
          <TouchableOpacity style={bp.ctaChat} onPress={() => onPay('chat')} activeOpacity={0.88}>
            <MaterialIcons name="chat" size={16} color="#fff" />
            <Text style={bp.ctaChatTxt}>Chat  ₹{lawyer.fees.chatPerMinuteInr}/min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={bp.ctaCall} onPress={() => onPay('call')} activeOpacity={0.88}>
            <MaterialIcons name="phone" size={16} color={Colors.primary} />
            <Text style={bp.ctaCallTxt}>Call Now</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={bp.ctaScheduleRow} onPress={() => setScheduleOpen(true)} activeOpacity={0.85}>
          <MaterialIcons name="event" size={16} color="#9CA3AF" />
          <Text style={bp.ctaScheduleRowTxt}>Book a call for tomorrow  ₹{lawyer.fees.call30minInr}</Text>
          <MaterialIcons name="chevron-right" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScheduleModal
        visible={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={handleScheduleConfirm}
        fee30min={lawyer.fees.call30minInr}
      />
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LawyerProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);

  // Normalize id in case URL encoding adds extra characters
  const normalizedId = Array.isArray(id) ? id[0] : (id ?? '');
  const lawyer = MOCK_LAWYERS.find((l) => l.id === normalizedId)
    ?? MOCK_LAWYERS.find((l) => l.id.toLowerCase() === normalizedId.toLowerCase())
    ?? MOCK_LAWYERS[0];
  const lawyerState = getLawyerState(lawyer);

  const handlePay = (type: 'chat' | 'call') => {
    router.push(`/payment?lawyerId=${lawyer.id}&type=${type}` as any);
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* ── Fixed header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Lawyer Profile</Text>
        <TouchableOpacity style={s.moreBtn} hitSlop={10}>
          <MaterialIcons name="more-vert" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 200 }}
      >
        {/* ── Premium hero ── */}
        <View style={s.hero}>
          <View style={s.heroLeft}>
            <Avatar
              name={lawyer.name}
              size={80}
              initials={lawyer.initials}
              color={lawyer.avatarColor}
              verified={lawyer.verified}
              online={lawyer.isOnline}
            />
          </View>
          <View style={s.heroRight}>
            <Text style={s.lawyerName} numberOfLines={1}>Adv. {lawyer.name}</Text>
            <Text style={s.designation} numberOfLines={1}>{lawyer.designation}</Text>
            <View style={s.locationRow}>
              <MaterialIcons name="location-on" size={12} color={Colors.textTertiary} />
              <Text style={s.location}>{lawyer.city}, {lawyer.state}</Text>
              {lawyer.servesRemote && (
                <View style={s.remotePill}>
                  <Text style={s.remoteTxt}>Remote OK</Text>
                </View>
              )}
            </View>
            <View style={s.nameRow}>
              <View style={s.ratingPill}>
                <MaterialIcons name="star" size={12} color={Colors.gold} />
                <Text style={s.ratingTxt}>{lawyer.rating.average}</Text>
                <Text style={s.reviewCount}>· {lawyer.rating.totalReviews} reviews</Text>
              </View>
              <Text style={s.barId}>{lawyer.barCouncilId}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats 2×2 grid ── */}
        <View style={s.statsGrid}>
          {[
            { v: `${lawyer.cases.winRatePercent}%`, l: 'Win Rate',    icon: 'emoji-events',  color: Colors.gold },
            { v: `${lawyer.cases.total}+`,           l: 'Cases',       icon: 'work',           color: Colors.primary },
            { v: `${lawyer.experienceYears} yrs`,    l: 'Experience',  icon: 'history',        color: Colors.success },
            { v: `<${lawyer.responseTimeMinutes}m`,  l: 'Response',    icon: 'bolt',           color: Colors.info },
          ].map((st) => (
            <View key={st.l} style={s.statCard}>
              <View style={[s.statIconWrap, { backgroundColor: st.color + '1A' }]}>
                <MaterialIcons name={st.icon as any} size={18} color={st.color} />
              </View>
              <Text style={s.statValue}>{st.v}</Text>
              <Text style={s.statLabel}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* ── Tab bar (sticky) ── */}
        <View style={s.tabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabContent}>
            {TABS.map((tab, idx) => (
              <TouchableOpacity
                key={tab}
                style={[s.tab, activeTab === idx && s.tabActive]}
                onPress={() => setActiveTab(idx)}
                activeOpacity={0.8}
              >
                <Text style={[s.tabTxt, activeTab === idx && s.tabTxtActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Tab content ── */}
        <View style={s.tabBody}>
          {activeTab === 0 && <OverviewTab lawyer={lawyer} />}
          {activeTab === 1 && <CasesTab lawyer={lawyer} />}
          {activeTab === 2 && <CourtsTab lawyer={lawyer} />}
          {activeTab === 3 && <ReviewsTab />}
        </View>
      </ScrollView>

      {/* ── Sticky bottom CTA / Queue panel ── */}
      <BottomPanel lawyer={lawyer} state={lawyerState} onPay={handlePay} />
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ lawyer }: { lawyer: typeof MOCK_LAWYERS[0] }) {
  return (
    <View style={t.root}>
      <Text style={t.label}>SPEAKS</Text>
      <View style={t.chipRow}>
        {lawyer.languages.map((lang: string) => (
          <View key={lang} style={t.chip}>
            <Text style={t.chipTxt}>{lang}</Text>
          </View>
        ))}
      </View>

      <Text style={t.label}>SPECIALIZES IN</Text>
      <View style={t.chipRow}>
        {lawyer.specializations.map((sp: string) => (
          <View key={sp} style={[t.chip, t.specChip]}>
            <Text style={t.specTxt}>{sp}</Text>
          </View>
        ))}
      </View>

      <Text style={t.label}>ABOUT</Text>
      <Text style={t.bio}>{lawyer.bio}</Text>

      <Text style={t.label}>CONSULTATION FEES</Text>
      <View style={t.feesCard}>
        {[
          { l: 'Chat (per min)', v: `₹${lawyer.fees.chatPerMinuteInr}` },
          { l: '30-min Call', v: `₹${lawyer.fees.call30minInr}` },
          { l: '60-min Call', v: `₹${lawyer.fees.call60minInr}` },
          { l: 'Document Review', v: `₹${lawyer.fees.documentReviewInr}` },
        ].map((f, i, arr) => (
          <View key={f.l}>
            <View style={t.feeRow}>
              <Text style={t.feeLbl}>{f.l}</Text>
              <Text style={t.feeVal}>{f.v}</Text>
            </View>
            {i < arr.length - 1 && <View style={t.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Cases Tab ────────────────────────────────────────────────────────────────

function CasesTab({ lawyer }: { lawyer: typeof MOCK_LAWYERS[0] }) {
  const total = lawyer.cases.total;
  return (
    <View style={t.root}>
      <View style={t.caseGrid}>
        {[
          { l: 'Total', v: total, c: Colors.textPrimary },
          { l: 'Won', v: lawyer.cases.won, c: Colors.success },
          { l: 'Lost', v: lawyer.cases.lost, c: Colors.danger },
          { l: 'Settled', v: lawyer.cases.settled, c: Colors.warning },
        ].map((st) => (
          <View key={st.l} style={t.caseItem}>
            <Text style={[t.caseVal, { color: st.c }]}>{st.v}</Text>
            <Text style={t.caseLbl}>{st.l}</Text>
          </View>
        ))}
      </View>
      <Text style={t.label}>CASE BREAKDOWN</Text>
      {Object.entries(lawyer.cases.byCategory).map(([cat, count]) => (
        <View key={cat} style={t.barRow}>
          <Text style={t.barLabel}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
          <View style={t.barTrack}>
            <View style={[t.barFill, { width: `${Math.round(((count as number) / total) * 100)}%` as any }]} />
          </View>
          <Text style={t.barPct}>{Math.round(((count as number) / total) * 100)}%</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Courts Tab ───────────────────────────────────────────────────────────────

function CourtsTab({ lawyer }: { lawyer: typeof MOCK_LAWYERS[0] }) {
  return (
    <View style={t.root}>
      <Text style={t.label}>COURTS PRACTICED IN</Text>
      {lawyer.courts.map((court: { name: string; since: number }) => (
        <View key={court.name} style={t.courtCard}>
          <MaterialIcons name="account-balance" size={18} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={t.courtName}>{court.name}</Text>
            <Text style={t.courtSince}>Since {court.since}</Text>
          </View>
        </View>
      ))}
      <Text style={t.label}>BAR COUNCIL</Text>
      <View style={t.courtCard}>
        <MaterialIcons name="verified" size={18} color={Colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={t.courtName}>{lawyer.barCouncilId}</Text>
          <Text style={t.courtSince}>Verified by Law24</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab() {
  const lawyer = MOCK_LAWYERS[0];
  return (
    <View style={t.root}>
      <View style={t.ratingRow}>
        <Text style={t.bigRating}>{lawyer.rating.average}</Text>
        <Text style={t.bigStar}>★</Text>
        <Text style={t.reviewCount}>{lawyer.rating.totalReviews} reviews</Text>
      </View>
      {MOCK_REVIEWS.map((r: typeof MOCK_REVIEWS[0]) => (
        <View key={r.id} style={t.reviewCard}>
          <View style={t.reviewHead}>
            <View style={t.reviewAvatar}>
              <Text style={t.reviewInitials}>{r.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={t.reviewerName}>{r.name}</Text>
                <Text style={t.reviewDate}>{r.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
                {Array.from({ length: 5 }).map((_: unknown, i: number) => (
                  <Text key={i} style={{ color: i < r.rating ? Colors.gold : Colors.border, fontSize: 11 }}>★</Text>
                ))}
                <View style={t.typePill}><Text style={t.typeTxt}>{r.type}</Text></View>
              </View>
            </View>
          </View>
          <Text style={t.reviewTxt}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { padding: 4, width: 36 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },
  moreBtn: { padding: 4, width: 36, alignItems: 'flex-end' },

  // Large centered hero
  hero: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSecondary,
  },
  heroLeft: { alignItems: 'center' },
  heroRight: { alignItems: 'center', gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  lawyerName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.goldSubtle, borderRadius: 100,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
  },
  ratingTxt: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  reviewCount: { fontSize: 11, color: Colors.textSecondary },
  designation: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500', textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' },
  location: { fontSize: 12, color: Colors.textSecondary },
  remotePill: {
    backgroundColor: Colors.successSubtle, borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(63,185,80,0.25)',
  },
  remoteTxt: { color: Colors.success, fontSize: 10, fontWeight: '700' },
  barId: { fontSize: 11, color: Colors.textTertiary },

  // Stats 2×2 grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bgPrimary,
  },
  statCard: {
    flex: 1, minWidth: '44%',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.3 },
  statDivider: { width: 1, backgroundColor: Colors.borderSubtle }, // kept for compat

  // Tabs
  tabBar: {
    backgroundColor: Colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabContent: { paddingHorizontal: 16, gap: 0 },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primary, fontWeight: '700' },
  tabBody: { padding: 16 },
});

const t = StyleSheet.create({
  root: { gap: 14 },
  label: { fontSize: 10, color: Colors.textTertiary, letterSpacing: 1, fontWeight: '600', textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 11, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  chipTxt: { color: Colors.textSecondary, fontSize: 12 },
  specChip: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  specTxt: { color: Colors.primary, fontSize: 12 },
  bio: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  feesCard: { backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.goldSubtle },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9 },
  feeLbl: { fontSize: 13, color: Colors.textSecondary },
  feeVal: { fontSize: 13, fontWeight: '600', color: Colors.gold },
  divider: { height: 1, backgroundColor: Colors.borderSubtle },
  caseGrid: { flexDirection: 'row', gap: 8 },
  caseItem: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  caseVal: { fontSize: 18, fontWeight: '700' },
  caseLbl: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  barLabel: { width: 68, fontSize: 12, color: Colors.textSecondary, textTransform: 'capitalize' },
  barTrack: { flex: 1, height: 5, backgroundColor: Colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, backgroundColor: Colors.primary, borderRadius: 3 },
  barPct: { width: 30, fontSize: 11, color: Colors.textSecondary, textAlign: 'right' },
  courtCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgSecondary, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 6 },
  courtName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  courtSince: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  bigRating: { fontSize: 36, fontWeight: '800', color: Colors.textPrimary },
  bigStar: { fontSize: 26, color: Colors.gold },
  reviewCount: { fontSize: 13, color: Colors.textSecondary },
  reviewCard: { backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  reviewHead: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  reviewAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reviewInitials: { color: '#fff', fontSize: 12, fontWeight: '700' },
  reviewerName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  reviewDate: { fontSize: 11, color: Colors.textTertiary },
  typePill: { backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 7, paddingVertical: 1, marginLeft: 4 },
  typeTxt: { fontSize: 10, color: Colors.textSecondary },
  reviewTxt: { fontSize: 12, color: Colors.textPrimary, lineHeight: 19 },
});

// ─── Bottom Panel Styles ──────────────────────────────────────────────────────

const bp = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
    gap: 10,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },

  // Available
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  availTxt: { fontSize: 12, color: Colors.success, fontWeight: '500' },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaChat: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 50,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  ctaChatTxt: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  ctaCall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 14, height: 50,
    backgroundColor: Colors.primarySubtle,
  },
  ctaCallTxt: { color: Colors.primary, fontSize: 14, fontWeight: '700' },

  // Busy
  busyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(248,81,73,0.08)',
    borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(248,81,73,0.2)',
  },
  busyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, flexShrink: 0 },
  busyTitle: { fontSize: 12, color: Colors.textPrimary, fontWeight: '500' },
  busyCount: { color: Colors.danger, fontWeight: '700' },
  busyWait: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  queueBadge: {
    backgroundColor: Colors.danger, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  queueBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  joinBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: Colors.primary, borderRadius: 12, height: 44,
  },
  joinBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Schedule small (busy state secondary)
  ctaScheduleSmall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, height: 44,
  },

  // Joined
  joinedCard: {
    backgroundColor: Colors.successSubtle, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.success, gap: 4,
  },
  joinedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinedTitle: { fontSize: 14, fontWeight: '700', color: Colors.success },
  joinedSub: { fontSize: 12, color: Colors.textSecondary, marginLeft: 28 },
  leaveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  leaveBtn: {},
  leaveTxt: { fontSize: 12, color: Colors.danger, fontWeight: '600' },
  scheduleInsteadTxt: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  // Offline
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  offlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textTertiary },
  offlineTxt: { fontSize: 12, color: Colors.textSecondary },

  // Schedule "Book for tomorrow" row (available state)
  ctaScheduleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 4,
    borderTopWidth: 1, borderTopColor: Colors.borderSubtle, marginTop: 4,
  },
  ctaScheduleRowTxt: { flex: 1, fontSize: 13, color: Colors.textSecondary },

  // Schedule CTA (offline state primary)
  ctaSchedule: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: Colors.primary, borderRadius: 12, height: 46,
  },
  ctaScheduleTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Scheduled confirmation
  scheduledCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.successSubtle, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.success,
  },
  scheduledTitle: { fontSize: 14, fontWeight: '700', color: Colors.success },
  scheduledSlot: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  cancelTxt: { fontSize: 12, color: Colors.danger, fontWeight: '600' },
});

// ─── Queue Slider Styles ──────────────────────────────────────────────────────

const qs = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 38,
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  thumb: {
    position: 'absolute',
    top: 2, bottom: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    opacity: 0.9,
  },
  opt: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  optTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  optTxtActive: { color: '#fff' },
});

// ─── Schedule Modal Styles ────────────────────────────────────────────────────

const sm = StyleSheet.create({
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    borderTopWidth: 1, borderTopColor: Colors.border,
    elevation: 30, zIndex: 50,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginTop: 10, marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  sub: { fontSize: 12, color: Colors.textSecondary, marginBottom: 16 },
  slots: { gap: 8, marginBottom: 16 },
  slot: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  slotSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  slotTxt: { flex: 1, fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  slotTxtSelected: { color: Colors.primary, fontWeight: '700' },
  confirmBtn: {
    height: 50, borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmBtnDisabled: { backgroundColor: Colors.bgElevated },
  confirmTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
