import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal as RNModal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_LAWYERS, MOCK_REVIEWS, type Lawyer as RawLawyer } from '../../constants/mockData';
import { getLawyerAvailability } from '../../constants/lawyersDirectory';
import { Avatar } from '../../components/ui/Avatar';
import { AppIcon } from '../../components/ui/AppIcon';
import { EmptyState } from '../../components/ui/EmptyState';

type Outcome = 'WON' | 'SETTLED' | 'ONGOING';

type Lawyer = {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  location: string;
  remoteAvailable: boolean;
  winRate: number;
  casesHandled: number;
  avgResponseTime: number;
  priceChatPerMin: number;
  priceCall30Min: number;
  priceDocReview: number;
  bio: string;
  languages: string[];
  specializations: string[];
  badges: string[];
  queueCount: number;
  avgWaitTime: number;
  successRate: number;
  topCategoryTag: string;
  isOnline: boolean;
  lastSeen: string | null;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  caseType: string;
  comment: string;
  outcome: Outcome;
  date: string;
};

const REVIEW_FILTERS = ['All', 'Matrimonial', 'Criminal', 'Recent', 'Top Rated'] as const;
const FEEDBACK_CASE_TYPES = ['Matrimonial', 'Criminal', 'Property', 'Corporate'] as const;
const POSITIVE_TAGS = ['Fast Response', 'Helpful', 'Clear Advice', 'Professional'] as const;
const NEGATIVE_TAGS = ['Slow', 'Confusing', 'Not Helpful', 'Unclear Guidance'] as const;

type FeedbackPayload = {
  rating: number;
  tags: string[];
  caseType: string;
  outcome: Outcome;
  reviewText: string;
  lawyerId: string;
  timestamp: number;
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

function normalizeLawyer(raw: RawLawyer): Lawyer {
  const availability = getLawyerAvailability(raw.id);
  return {
    id: raw.id,
    name: raw.name.replace(/^Adv\.\s*/i, ''),
    avatar: raw.initials,
    verified: raw.verified,
    rating: raw.rating.average,
    reviewCount: raw.rating.totalReviews,
    experienceYears: raw.experienceYears,
    location: raw.city,
    remoteAvailable: raw.servesRemote,
    winRate: Math.round(raw.cases.winRatePercent),
    casesHandled: raw.cases.total,
    avgResponseTime: raw.responseTimeMinutes,
    priceChatPerMin: raw.fees.chatPerMinuteInr,
    priceCall30Min: raw.fees.call30minInr,
    priceDocReview: raw.fees.documentReviewInr,
    bio: raw.bio,
    languages: raw.languages,
    specializations: raw.specializations,
    badges: [
      'Top Performer',
      raw.responseTimeMinutes <= 5 ? 'Fast Responder' : 'Highly Recommended',
      'Highly Recommended',
      'High Success in 498A',
    ],
    queueCount: availability.queue,
    avgWaitTime: availability.isOnline ? 5 : 0,
    successRate: Math.round(raw.cases.winRatePercent),
    topCategoryTag: `Top Rated in ${raw.specializations[0] ?? 'Matrimonial'} Cases`,
    isOnline: availability.isOnline,
    lastSeen: availability.lastSeen,
  };
}

function normalizeReviews(lawyer: Lawyer): Review[] {
  const seed = MOCK_REVIEWS.map((r, idx) => {
    const caseType = lawyer.specializations[idx % lawyer.specializations.length] ?? 'Matrimonial';
    const outcome: Outcome = idx % 3 === 0 ? 'WON' : idx % 3 === 1 ? 'SETTLED' : 'ONGOING';
    return {
      id: r.id,
      userName: r.name,
      rating: r.rating,
      caseType,
      comment: r.text,
      outcome,
      date: r.date,
    };
  });
  return [
    ...seed,
    {
      id: 'R-HC-01',
      userName: 'R.P.',
      rating: 5,
      caseType: '498A',
      comment: 'Solved my 498A case quickly and explained each legal step in simple language.',
      outcome: 'WON',
      date: '15 Apr 2026',
    },
    {
      id: 'R-HC-02',
      userName: 'M.K.',
      rating: 5,
      caseType: 'Matrimonial',
      comment: 'Very responsive and supportive throughout the settlement process.',
      outcome: 'SETTLED',
      date: '10 Apr 2026',
    },
  ];
}

function computeRankScore(l: Lawyer, caseType: string) {
  const relevance = l.specializations.some((s) => s.toLowerCase().includes(caseType.toLowerCase())) ? 1 : 0.6;
  const ratingScore = l.rating / 5;
  const successScore = l.successRate / 100;
  const responseScore = Math.max(0.2, 1 - l.avgResponseTime / 15);
  const conversionScore = (l.reviewCount > 80 ? 0.95 : 0.8) + l.queueCount <= 3 ? 0.05 : 0;
  const engagementScore = Math.min(1, l.reviewCount / 150);
  return (
    relevance * 0.36
    + ratingScore * 0.2
    + successScore * 0.17
    + responseScore * 0.12
    + conversionScore * 0.09
    + engagementScore * 0.06
  );
}

const StatPill = memo(function StatPill({ label }: { label: string }) {
  return (
    <View style={s.statPill}>
      <Text style={s.statPillTxt}>{label}</Text>
    </View>
  );
});

const LawyerHeader = memo(function LawyerHeader({
  lawyer,
  matchCaseType,
}: {
  lawyer: Lawyer;
  matchCaseType: string;
}) {
  return (
    <View style={s.section}>
      <View style={s.headerRow}>
        <Avatar name={lawyer.name} initials={lawyer.avatar} size={46} verified={lawyer.verified} online={lawyer.isOnline} />
        <View style={{ flex: 1 }}>
          <View style={s.nameRow}>
            <Text style={s.name}>Adv. {lawyer.name}</Text>
            {lawyer.verified && (
              <View style={s.verified}>
                <MaterialIcons name="verified" size={12} color={Colors.primary} />
                <Text style={s.verifiedTxt}>Verified</Text>
              </View>
            )}
            {lawyer.isOnline ? (
              <View style={s.onlineBadge}>
                <Text style={s.onlineBadgeTxt}>Online</Text>
              </View>
            ) : (
              <View style={s.offlineBadge}>
                <Text style={s.offlineBadgeTxt}>Offline • {lawyer.lastSeen ?? 'Recently'}</Text>
              </View>
            )}
          </View>
          <View style={s.inlineMetaRow}>
            <AppIcon name="rating" size={12} color={Colors.gold} />
            <Text style={s.inlineMeta}>
              {`${lawyer.rating} (${lawyer.reviewCount} reviews) • ${lawyer.experienceYears} yrs • ${lawyer.location} • ${lawyer.remoteAvailable ? 'Remote OK' : 'In-person'}`}
            </Text>
          </View>
        </View>
      </View>
      <View style={s.tagsRow}>
        <View style={s.tag}><Text style={s.tagTxt}>{lawyer.topCategoryTag}</Text></View>
        <View style={[s.tag, s.bestTag]}><Text style={s.bestTxt}>Best for your case: {matchCaseType}</Text></View>
      </View>
    </View>
  );
});

const SpecializationChips = memo(function SpecializationChips({
  items,
  matchCaseType,
}: {
  items: string[];
  matchCaseType: string;
}) {
  return (
    <View style={s.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipWrap}>
        {items.map((item) => {
          const matched = item.toLowerCase().includes(matchCaseType.toLowerCase()) || matchCaseType.includes(item);
          return (
            <View key={item} style={[s.chip, matched && s.chipMatched]}>
              <Text style={[s.chipTxt, matched && s.chipMatchedTxt]}>{item}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={s.bestCaseRow}>
        <MaterialIcons name="check-circle" size={14} color={Colors.success} />
        <Text style={s.bestCaseTxt}>Best for your case</Text>
      </View>
    </View>
  );
});

const ExpandableBio = memo(function ExpandableBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>About</Text>
      <Text style={s.bio} numberOfLines={expanded ? undefined : 3}>
        {bio} {' '}
        <Text style={s.hl}>High Court</Text> {' '}
        <Text style={s.hl}>10+ yrs</Text> {' '}
        <Text style={s.hl}>Women cases specialist</Text>
      </Text>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.8}>
        <Text style={s.link}>{expanded ? 'Read Less' : 'Read More'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const PricingRow = memo(function PricingRow({ lawyer }: { lawyer: Lawyer }) {
  return (
    <View style={s.section}>
      <View style={s.pricingRow}>
        <View style={s.priceItemWrap}><AppIcon name="chat" size={13} color={Colors.textSecondary} /><Text style={s.priceItem}>₹{lawyer.priceChatPerMin}/min</Text></View>
        <View style={s.priceItemWrap}><AppIcon name="call" size={13} color={Colors.textSecondary} /><Text style={s.priceItem}>₹{lawyer.priceCall30Min}/30m</Text></View>
        <View style={s.priceItemWrap}><AppIcon name="documents" size={13} color={Colors.textSecondary} /><Text style={s.priceItem}>₹{lawyer.priceDocReview} review</Text></View>
      </View>
      <Text style={s.muted}>No hidden charges</Text>
    </View>
  );
});

const ReviewPreview = memo(function ReviewPreview({
  reviews,
  favorableRate,
  onViewAll,
}: {
  reviews: Review[];
  favorableRate: number;
  onViewAll: () => void;
}) {
  return (
    <View style={s.section}>
      <View style={s.inlineMetaRow}>
        <AppIcon name="rating" size={13} color={Colors.gold} />
        <Text style={s.socialProof}>4.9 from 112 clients</Text>
      </View>
      <Text style={s.muted}>{favorableRate}% clients got favorable outcome</Text>
      {reviews.slice(0, 2).map((r) => (
        <View key={r.id} style={s.previewItem}>
          <Text style={s.previewText} numberOfLines={2}>{r.comment}</Text>
          <Text style={s.previewOutcome}>{r.outcome === 'WON' ? 'Won' : r.outcome === 'SETTLED' ? 'Settled' : 'Ongoing'}</Text>
        </View>
      ))}
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.85} style={s.viewAllBtn}>
        <Text style={s.viewAllTxt}>View all reviews</Text>
      </TouchableOpacity>
    </View>
  );
});

const BadgeRow = memo(function BadgeRow({ badges }: { badges: string[] }) {
  return (
    <View style={s.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipWrap}>
        {badges.map((badge) => (
          <View key={badge} style={s.badgeChip}>
            <Text style={s.badgeTxt}>
              {badge}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

const StatusBlock = memo(function StatusBlock({ lawyer }: { lawyer: Lawyer }) {
  const isBusy = lawyer.isOnline && lawyer.queueCount > 0;
  return (
    <View style={s.statusBox}>
      <Text style={s.statusText}>
        {lawyer.isOnline
          ? (isBusy ? `Busy • ${lawyer.queueCount} in queue • ~${lawyer.avgWaitTime} min wait` : 'Online • Available now')
          : `Offline • Last seen ${lawyer.lastSeen ?? 'recently'}`}
      </Text>
    </View>
  );
});

const StickyCTA = memo(function StickyCTA({
  bottomInset,
  lawyer,
  onChat,
  onCall,
  onNotify,
  onBook,
  onJoinQueue,
}: {
  bottomInset: number;
  lawyer: Lawyer;
  onChat: () => void;
  onCall: () => void;
  onNotify: () => void;
  onBook: () => void;
  onJoinQueue: () => void;
}) {
  const isBusy = lawyer.isOnline && lawyer.queueCount > 0;
  const isOffline = !lawyer.isOnline;

  return (
    <View style={[s.bottomCTA, { paddingBottom: bottomInset + 10 }]} pointerEvents="box-none">
      {lawyer.isOnline && !isBusy ? (
        <>
          <TouchableOpacity style={s.primaryCta} onPress={onChat} activeOpacity={0.8}>
            <Text style={s.primaryCtaTxt}>Join Chat ₹25/min</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryCta} onPress={onCall} activeOpacity={0.8}>
            <Text style={s.secondaryCtaTxt}>Call</Text>
          </TouchableOpacity>
        </>
      ) : isBusy ? (
        <View style={s.busyStickyWrap}>
          <Text style={s.busyStickyTxt}>{lawyer.queueCount} in queue • ~5 min wait</Text>
          <TouchableOpacity style={s.primaryCta} onPress={onJoinQueue} activeOpacity={0.8}>
            <Text style={s.primaryCtaTxt}>Join Queue</Text>
          </TouchableOpacity>
        </View>
      ) : isOffline ? (
        <View style={s.offlineStickyWrap}>
          <TouchableOpacity style={s.primaryCta} onPress={onNotify} activeOpacity={0.8}>
            <Text style={s.primaryCtaTxt}>Notify when available</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryCta} onPress={onBook} activeOpacity={0.8}>
            <Text style={s.secondaryCtaTxt}>Book appointment</Text>
          </TouchableOpacity>
          <Text style={s.helperText}>We’ll notify you instantly when this lawyer is available.</Text>
        </View>
      ) : null}
    </View>
  );
});

function ReviewList({
  visible,
  onClose,
  reviews,
}: {
  visible: boolean;
  onClose: () => void;
  reviews: Review[];
}) {
  const [filter, setFilter] = useState<(typeof REVIEW_FILTERS)[number]>('All');

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === 'Matrimonial') list = list.filter((r) => r.caseType.toLowerCase().includes('divorce') || r.caseType.toLowerCase().includes('family') || r.caseType.includes('498A'));
    if (filter === 'Criminal') list = list.filter((r) => r.caseType.toLowerCase().includes('criminal'));
    if (filter === 'Recent') list = [...list].reverse();
    if (filter === 'Top Rated') list = [...list].sort((a, b) => b.rating - a.rating);
    return list.slice(0, 6);
  }, [filter, reviews]);

  const renderItem = useCallback(({ item }: { item: Review }) => (
    <View style={s.reviewItem}>
      <View style={s.reviewHead}>
        <Text style={s.reviewUser}>{item.userName}</Text>
        <View style={s.inlineMetaRow}>
          <AppIcon name="rating" size={12} color={Colors.gold} />
          <Text style={s.reviewRating}>{item.rating}</Text>
        </View>
      </View>
      <View style={s.reviewMetaRow}>
        <Text style={s.reviewCase}>{item.caseType}</Text>
        <Text style={s.reviewOutcome}>{item.outcome === 'WON' ? 'Won' : item.outcome === 'SETTLED' ? 'Settled' : 'Ongoing'}</Text>
      </View>
      <Text style={s.reviewComment}>{item.comment}</Text>
    </View>
  ), []);

  return (
    <RNModal visible={visible} animationType="slide" transparent>
      <View style={s.reviewOverlay}>
        <View style={s.reviewModal}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Client Reviews</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.filterRow}>
              {REVIEW_FILTERS.map((f) => (
                <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)} activeOpacity={0.8}>
                  <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {filtered.map((item) => renderItem({ item }))}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const StarRating = memo(function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const scales = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;
  const tapStar = useCallback((idx: number) => {
    onChange(idx + 1);
    Animated.sequence([
      Animated.spring(scales[idx], { toValue: 1.14, useNativeDriver: false, speed: 35, bounciness: 10 }),
      Animated.spring(scales[idx], { toValue: 1, useNativeDriver: false, speed: 30, bounciness: 8 }),
    ]).start();
  }, [onChange, scales]);
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((n, idx) => (
        <Pressable key={n} onPress={() => tapStar(idx)} style={s.starBtn}>
          <Animated.View style={{ transform: [{ scale: scales[idx] }] }}>
            <AppIcon name="rating" size={30} color={n <= value ? Colors.gold : Colors.textTertiary} />
          </Animated.View>
        </Pressable>
      ))}
    </View>
  );
});

const FeedbackTags = memo(function FeedbackTags({
  rating,
  selected,
  onToggle,
}: {
  rating: number;
  selected: string[];
  onToggle: (tag: string) => void;
}) {
  const options = rating >= 4 ? POSITIVE_TAGS : NEGATIVE_TAGS;
  return (
    <View style={s.outcomeWrap}>
      {options.map((tag) => {
        const isActive = selected.includes(tag);
        return (
          <TouchableOpacity key={tag} style={[s.filterChip, isActive && s.filterChipActive]} onPress={() => onToggle(tag)}>
            <Text style={[s.filterTxt, isActive && s.filterTxtActive]}>{tag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const CaseTypeSelector = memo(function CaseTypeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.outcomeWrap}>
      {FEEDBACK_CASE_TYPES.map((type) => (
        <TouchableOpacity key={type} style={[s.filterChip, value === type && s.filterChipActive]} onPress={() => onChange(type)}>
          <Text style={[s.filterTxt, value === type && s.filterTxtActive]}>{type}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const OutcomeSelector = memo(function OutcomeSelector({
  value,
  onChange,
}: {
  value: Outcome | null;
  onChange: (value: Outcome) => void;
}) {
  return (
    <View style={s.outcomeWrap}>
      {(['WON', 'SETTLED', 'ONGOING'] as Outcome[]).map((o) => (
        <TouchableOpacity key={o} style={[s.filterChip, value === o && s.filterChipActive]} onPress={() => onChange(o)}>
          <Text style={[s.filterTxt, value === o && s.filterTxtActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const FeedbackBottomSheet = memo(function FeedbackBottomSheet({
  visible,
  onClose,
  onSubmit,
  lawyerId,
  initialCaseType,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: FeedbackPayload) => void;
  lawyerId: string;
  initialCaseType: string;
}) {
  const modalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [caseType, setCaseType] = useState(initialCaseType || 'Matrimonial');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (visible) modalRef.current?.present();
    else modalRef.current?.dismiss();
  }, [visible]);

  const emotionLabel = useMemo(() => {
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Okay';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    if (rating === 5) return 'Excellent';
    return 'Tap to rate';
  }, [rating]);

  const toggleTag = useCallback((tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  const isValid = rating > 0 && !!outcome;

  const submit = useCallback(() => {
    if (!isValid || !outcome) {
      setShowErrors(true);
      return;
    }
    const payload: FeedbackPayload = {
      rating,
      tags,
      caseType,
      outcome,
      reviewText,
      lawyerId,
      timestamp: Date.now(),
    };
    onSubmit(payload);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setRating(0);
      setTags([]);
      setCaseType(initialCaseType || 'Matrimonial');
      setOutcome(null);
      setReviewText('');
      setShowErrors(false);
    }, 1500);
  }, [caseType, initialCaseType, isValid, lawyerId, onClose, onSubmit, outcome, rating, reviewText, tags]);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backgroundStyle={s.feedbackSheet}
      backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
      handleIndicatorStyle={{ backgroundColor: Colors.border, width: 42 }}
    >
      <SafeAreaView style={s.feedbackSafeArea}>
        <BottomSheetView style={s.feedbackSheetRoot}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.feedbackKeyboard}>
            <ScrollView style={s.feedbackScroll} showsVerticalScrollIndicator={false} contentContainerStyle={s.feedbackScrollContent}>
              <View style={s.feedbackHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={s.modalTitle}>How was your experience?</Text>
                  <Text style={s.muted}>Your feedback improves lawyer rankings and helps others</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <AppIcon name="close" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {submitted ? (
                <View style={s.feedbackSuccess}>
                  <AppIcon name="success" size={30} color={Colors.success} />
                  <Text style={s.feedbackSuccessTxt}>Thank you for your feedback</Text>
                </View>
              ) : (
                <>
                  <Text style={s.inputLabel}>Rating *</Text>
                  <StarRating value={rating} onChange={setRating} />
                  <Text style={s.emotionLabel}>{emotionLabel}</Text>
                  {showErrors && rating === 0 && <Text style={s.errorTxt}>Rating is required</Text>}

                  {rating > 0 && (
                    <>
                      <Text style={s.inputLabel}>Quick Feedback</Text>
                      <FeedbackTags rating={rating} selected={tags} onToggle={toggleTag} />
                    </>
                  )}

                  <Text style={s.inputLabel}>Case Type</Text>
                  <CaseTypeSelector value={caseType} onChange={setCaseType} />

                  <Text style={s.inputLabel}>Outcome *</Text>
                  <OutcomeSelector value={outcome} onChange={setOutcome} />
                  {showErrors && !outcome && <Text style={s.errorTxt}>Outcome is required</Text>}

                  <Text style={s.inputLabel}>Review (Optional)</Text>
                  <TextInput
                    value={reviewText}
                    onChangeText={setReviewText}
                    style={[s.feedbackInput, s.feedbackReviewInput]}
                    placeholder="Share your experience (optional)"
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    textAlignVertical="top"
                  />
                  <Text style={s.microcopy}>Your review helps others choose the right lawyer</Text>
                </>
              )}
            </ScrollView>

            {!submitted && (
              <View style={s.feedbackButtonBar}>
                <TouchableOpacity onPress={onClose} style={s.feedbackActionSecondary}>
                  <Text style={s.secondaryCtaTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submit} style={[s.feedbackActionPrimary, !isValid && s.feedbackActionDisabled]} disabled={!isValid}>
                  <Text style={s.primaryCtaTxt}>Submit</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </BottomSheetView>
      </SafeAreaView>
    </BottomSheetModal>
  );
});

export default function LawyerProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; caseType?: string }>();
  const [reviewModal, setReviewModal] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [saveBusy, setSaveBusy] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const bookingTranslateY = useRef(new Animated.Value(0)).current;
  const userCaseType = Array.isArray(params.caseType) ? params.caseType[0] : params.caseType || '498A';

  const normalizedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const raw = MOCK_LAWYERS.find((l) => l.id === normalizedId);
  const lawyer = useMemo(() => (raw ? normalizeLawyer(raw) : null), [raw]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const favorableRate = useMemo(() => {
    const favorable = reviews.filter((r) => r.outcome === 'WON' || r.outcome === 'SETTLED').length;
    return Math.round((favorable / Math.max(1, reviews.length)) * 100);
  }, [reviews]);

  const rankScore = useMemo(() => {
    if (!lawyer) return 0;
    return computeRankScore(lawyer, userCaseType);
  }, [lawyer, userCaseType]);

  useEffect(() => {
    if (!lawyer) return;
    setReviews(normalizeReviews(lawyer));
  }, [lawyer]);

  const handleFeedbackSubmit = useCallback((payload: FeedbackPayload) => {
    setReviews((prev) => [
      {
        id: `R-${Date.now()}`,
        userName: 'You',
        rating: payload.rating,
        caseType: payload.caseType,
        comment: payload.reviewText || 'Great consultation.',
        outcome: payload.outcome,
        date: 'Today',
      },
      ...prev,
    ]);
  }, []);

  const handleSave = useCallback(() => {
    if (!lawyer || saveBusy) return;
    setSaveBusy(true);
    const nextSaved = !saved;
    setSaved(nextSaved);
    console.log('Saved lawyer:', lawyer.id);
    Alert.alert(
      nextSaved ? 'Saved' : 'Removed',
      nextSaved ? 'Added to your saved lawyers' : 'Removed from saved list',
    );
    setTimeout(() => setSaveBusy(false), 500);
  }, [lawyer?.id, saveBusy, saved]);

  const handleShare = useCallback(async () => {
    if (!lawyer || shareBusy) return;
    setShareBusy(true);
    try {
      await Share.share({
        message: `Check out Adv. ${lawyer.name}, expert in ${lawyer.specializations[0] ?? 'Legal Consultation'} on Law24.\n\nConsult now at ₹${lawyer.priceChatPerMin}/min.`,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => setShareBusy(false), 500);
    }
  }, [lawyer?.name, lawyer?.priceChatPerMin, lawyer?.specializations, shareBusy]);

  const handleConfirmBooking = useCallback(() => {
    if (!lawyer || bookingBusy) return;
    setBookingBusy(true);
    setShowBooking(false);
    Alert.alert('Booked', 'Your consultation has been scheduled for tomorrow.');
    console.log('Booking:', {
      lawyerId: lawyer.id,
      date: 'tomorrow',
      time: selectedTime,
    });
    setTimeout(() => setBookingBusy(false), 500);
  }, [bookingBusy, lawyer?.id, selectedTime]);

  const closeBookingSheet = useCallback(() => {
    Animated.timing(bookingTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowBooking(false);
      bookingTranslateY.setValue(0);
    });
  }, [bookingTranslateY]);

  const bookingPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          bookingTranslateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          closeBookingSheet();
        } else {
          Animated.spring(bookingTranslateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (showBooking) {
      bookingTranslateY.setValue(300);
      Animated.timing(bookingTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [bookingTranslateY, showBooking]);

  if (!id) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.textSecondary }}>Invalid Lawyer ID</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!normalizedId) {
    return <EmptyState message="Invalid lawyer profile ID. No ID provided." />;
  }

  if (!lawyer) {
    return <EmptyState message="No lawyer data available for this profile." />;
  }

  return (
    <BottomSheetModalProvider>
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.topBarTitle}>Lawyer Profile</Text>
          <TouchableOpacity onPress={() => setFeedbackOpen(true)} hitSlop={10}>
            <MaterialIcons name="rate-review" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.content, { paddingBottom: 140 + insets.bottom + 20 }]}>
          <LawyerHeader lawyer={lawyer} matchCaseType={userCaseType} />

        <View style={[s.section, s.statsStrip]}>
          <StatPill label={`${lawyer.winRate}% Win`} />
          <StatPill label={`${lawyer.casesHandled} Cases`} />
          <StatPill label={`${lawyer.experienceYears} yrs`} />
          <StatPill label={`<${lawyer.avgResponseTime}m Resp`} />
        </View>

        <SpecializationChips items={lawyer.specializations} matchCaseType={userCaseType} />
        <ExpandableBio bio={lawyer.bio} />
        <PricingRow lawyer={lawyer} />
        <ReviewPreview reviews={reviews} favorableRate={favorableRate} onViewAll={() => setReviewModal(true)} />
        <BadgeRow badges={lawyer.badges} />
        <StatusBlock lawyer={lawyer} />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Languages</Text>
          <Text style={s.muted}>{lawyer.languages.join(' • ')}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Smart Sort Signal</Text>
          <Text style={s.muted}>
            Ranked by case relevance, rating, success rate, response time, conversion, and engagement.
          </Text>
          <Text style={s.rank}>Match Score: {(rankScore * 100).toFixed(0)}%</Text>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.outlineBtn, { flex: 1 }, bookingBusy && s.secondaryActionDisabled]}
            onPress={() => !bookingBusy && setShowBooking(true)}
            activeOpacity={0.8}
            disabled={bookingBusy}
          >
            <Text style={s.outlineText} numberOfLines={1}>Book for Tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.outlineBtn, { flex: 1 }, saved && s.secondaryActionActive, saveBusy && s.secondaryActionDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saveBusy}
          >
            <Text style={[s.outlineText, saved && s.secondaryActionTxtActive]} numberOfLines={1}>{saved ? 'Saved' : 'Save Lawyer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.outlineBtn, { flex: 1 }, shareBusy && s.secondaryActionDisabled]}
            onPress={handleShare}
            activeOpacity={0.8}
            disabled={shareBusy}
          >
            <Text style={s.outlineText} numberOfLines={1}>Share</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>

        <StickyCTA
          bottomInset={insets.bottom}
          lawyer={lawyer}
          onChat={() => router.push(`/payment?lawyerId=${lawyer.id}&type=chat` as any)}
          onCall={() => router.push(`/payment?lawyerId=${lawyer.id}&type=call` as any)}
          onJoinQueue={() => router.push(`/payment?lawyerId=${lawyer.id}&type=chat` as any)}
          onNotify={() => Alert.alert('Get notified', `We’ll notify you when Adv. ${lawyer.name} is online.`, [{ text: 'OK' }])}
          onBook={() => setShowBooking(true)}
        />
        <ReviewList visible={reviewModal} onClose={() => setReviewModal(false)} reviews={reviews} />
        <FeedbackBottomSheet
          visible={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={handleFeedbackSubmit}
          lawyerId={lawyer.id}
          initialCaseType={userCaseType}
        />
        <RNModal visible={showBooking} animationType="none" transparent onRequestClose={closeBookingSheet}>
          <View style={s.bookingOverlay}>
            <View style={s.appContainer}>
              <Animated.View
                style={[
                  s.sheet,
                  { paddingBottom: insets.bottom + 12, transform: [{ translateY: bookingTranslateY }] },
                ]}
              >
                <View {...bookingPanResponder.panHandlers}>
                  <View style={s.handle} />
                </View>
                <Text style={s.bookingTitle}>Schedule Consultation</Text>
                <Text style={s.bookingSub}>Choose preferred time for tomorrow</Text>

                <View style={s.timeSlots}>
                  {['10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[s.slot, selectedTime === time && s.slotActive]}
                      onPress={() => setSelectedTime(time)}
                      activeOpacity={0.8}
                    >
                      <Text style={s.slotText}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={s.buttonRow}>
                  <TouchableOpacity style={s.cancelBtn} onPress={closeBookingSheet} activeOpacity={0.8}>
                    <Text style={s.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={s.confirmBtn} onPress={handleConfirmBooking} activeOpacity={0.8}>
                    <Text style={s.confirmText}>Confirm Booking</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </View>
        </RNModal>
      </View>
    </BottomSheetModalProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  topBarTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  content: { paddingHorizontal: 12, paddingBottom: 120, gap: 10 },
  section: { paddingVertical: 4, gap: 6 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  verifiedTxt: { color: Colors.primary, fontSize: 10, fontWeight: '700' },
  onlineBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  onlineBadgeTxt: { color: '#22C55E', fontSize: 11, fontWeight: '700' },
  offlineBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  offlineBadgeTxt: { color: '#D1D5DB', fontSize: 11, fontWeight: '600' },
  inlineMeta: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  inlineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  tagTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  bestTag: { backgroundColor: Colors.successSubtle, borderColor: 'rgba(63,185,80,0.35)' },
  bestTxt: { color: Colors.success, fontSize: 11, fontWeight: '700' },

  statsStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  statPillTxt: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },

  chipWrap: { flexDirection: 'row', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipTxt: { color: Colors.textSecondary, fontSize: 12 },
  chipMatched: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  chipMatchedTxt: { color: Colors.primary, fontWeight: '700' },
  bestCaseRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bestCaseTxt: { color: Colors.success, fontSize: 11, fontWeight: '700' },

  bio: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19 },
  hl: { color: Colors.gold, fontWeight: '700' },
  link: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  priceItemWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceItem: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  muted: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },

  socialProof: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
  previewItem: { backgroundColor: Colors.bgSecondary, borderColor: Colors.border, borderWidth: 1, borderRadius: 10, padding: 8, gap: 4 },
  previewText: { color: Colors.textPrimary, fontSize: 12, lineHeight: 18 },
  previewOutcome: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  viewAllBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary },
  viewAllTxt: { color: Colors.primary, fontSize: 12, fontWeight: '700' },

  badgeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  badgeTxt: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
  statusBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#111827',
  },
  statusText: {
    color: '#9CA3AF',
    fontSize: 13,
  },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8, opacity: 0.88 },
  outlineBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  secondaryActionActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  secondaryActionDisabled: { opacity: 0.65 },
  outlineText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
  secondaryActionTxtActive: { color: Colors.primary, fontWeight: '700' },
  bookingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  appContainer: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  sheet: {
    width: '100%',
    backgroundColor: '#0B1220',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    maxHeight: '45%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bookingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  slot: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  slotActive: {
    backgroundColor: '#5B6EF5',
  },
  slotText: {
    color: '#FFF',
    fontSize: 12,
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
  },
  cancelBtnTxt: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  cancelText: { color: '#D1D5DB', fontWeight: '500' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#5B6EF5',
    alignItems: 'center',
  },
  confirmBtnTxt: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  confirmText: { color: '#FFF', fontWeight: '600' },

  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#020617',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'column',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 999,
    elevation: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  primaryCta: { width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B6EF5' },
  primaryCtaTxt: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  secondaryCta: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryCtaTxt: { color: '#D1D5DB', fontSize: 14, fontWeight: '500' },
  busyStickyWrap: { width: '100%', gap: 12 },
  busyStickyTxt: { color: Colors.warning, fontSize: 12, fontWeight: '700' },
  offlineStickyWrap: { width: '100%', gap: 12 },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },

  reviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModal: {
    width: '92%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: '#0B1220',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  filterTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  filterTxtActive: { color: Colors.primary, fontWeight: '700' },
  reviewItem: { backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, marginBottom: 8 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewUser: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  reviewRating: { color: Colors.gold, fontSize: 11, fontWeight: '700' },
  reviewMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  reviewCase: { color: Colors.textSecondary, fontSize: 11 },
  reviewOutcome: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  reviewComment: { color: Colors.textPrimary, fontSize: 12, lineHeight: 18 },

  feedbackCard: { backgroundColor: Colors.bgPrimary, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 16, gap: 8 },
  inputLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary, borderRadius: 10, color: Colors.textPrimary, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  feedbackSafeArea: { flex: 1, maxWidth: '100%' },
  feedbackSheetRoot: { flex: 1, width: '100%', maxWidth: '100%' },
  feedbackSheet: {
    maxWidth: '100%',
    backgroundColor: Colors.bgPrimary,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  feedbackKeyboard: { flex: 1, width: '100%' },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  feedbackScroll: { flex: 1, width: '100%' },
  feedbackScrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100, gap: 10 },
  starsRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 8 },
  starBtn: { paddingVertical: 2, paddingRight: 2 },
  emotionLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  errorTxt: { color: Colors.danger, fontSize: 11, fontWeight: '600', marginTop: -4 },
  microcopy: { color: Colors.textTertiary, fontSize: 11, marginTop: 2 },
  feedbackInput: {
    width: '100%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 10,
    color: Colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 12,
    maxWidth: '100%',
  },
  feedbackReviewInput: { minHeight: 88 },
  outcomeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feedbackButtonBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#0B0F1A',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  feedbackActionPrimary: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  feedbackActionDisabled: { opacity: 0.45 },
  feedbackActionSecondary: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  feedbackSuccess: {
    width: '100%',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  feedbackSuccessTxt: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  rank: { color: Colors.success, fontSize: 12, fontWeight: '700' },
});
