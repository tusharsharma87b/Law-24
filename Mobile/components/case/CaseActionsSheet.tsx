/**
 * Case Action & Escalation System
 *
 * Full bottom sheet accessible from the 3-dot (⋮) menu on the Case OS screen.
 *
 * Sections:
 *  1. Manage Your Case     — edit, history
 *  2. Lawyer & Support     — change lawyer, raise concern, contact
 *  3. Get Expert Help      — premium escalation (second opinion)
 *  4. Case Files           — download, share
 *  5. Danger Zone          — close case
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, PanResponder, Alert, TextInput, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_LAWYERS } from '../../constants/mockData';
import { getLawyersByCategory } from '../../constants/categoryLawyers';
import { useCaseStore } from '../../store/useCaseStore';

// ─── Types ────────────────────────────────────────────────────────────────────
export type CaseActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  onEditCaseDetails?: (caseId: string) => void;
};

const DISMISS_THRESHOLD = 80;

// Senior lawyers for the expert escalation panel
const EXPERT_LAWYERS = MOCK_LAWYERS.filter((l) => l.rating.average >= 4.8).slice(0, 3);

// ─── Raise a Concern Sub-sheet ────────────────────────────────────────────────
const CONCERN_OPTIONS = [
  { id: 'no-response', label: 'Lawyer is not responding', icon: 'phone-disabled' },
  { id: 'delay',       label: 'Case is delayed without reason', icon: 'schedule' },
  { id: 'payment',     label: 'Payment related issue', icon: 'payments' },
  { id: 'quality',     label: 'Not satisfied with advice given', icon: 'thumb-down' },
  { id: 'docs',        label: 'Documents not handled properly', icon: 'folder-off' },
  { id: 'other',       label: 'Other issue', icon: 'help-outline' },
];

function RaiseConcernPanel({
  caseId,
  onBack,
  onSubmit,
}: {
  caseId: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { raiseConcern } = useCaseStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const handleSubmit = () => {
    if (!selected) {
      Alert.alert('Please select an issue', 'Choose what concerns you most.');
      return;
    }
    if (!details.trim()) {
      Alert.alert('Description required', 'Please describe your concern.');
      return;
    }
    raiseConcern({
      caseId,
      issueType: selected,
      description: details.trim(),
      priority,
    });
    onSubmit();
  };

  return (
    <View style={rc.root}>
      <View style={rc.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={rc.title}>Raise a Concern</Text>
        <View style={{ width: 20 }} />
      </View>
      <Text style={rc.sub}>We will review your concern and follow up within 24 hours.</Text>

      {CONCERN_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={[rc.option, selected === opt.id && rc.optionSel]}
          onPress={() => setSelected(opt.id)}
          activeOpacity={0.8}
        >
          <View style={[rc.optionIcon, { backgroundColor: selected === opt.id ? Colors.primarySubtle : Colors.bgElevated }]}>
            <MaterialIcons name={opt.icon as any} size={18} color={selected === opt.id ? Colors.primary : Colors.textSecondary} />
          </View>
          <Text style={[rc.optionTxt, selected === opt.id && rc.optionTxtSel]}>{opt.label}</Text>
          {selected === opt.id && <MaterialIcons name="check-circle" size={18} color={Colors.primary} />}
        </TouchableOpacity>
      ))}

      <Text style={rc.detailLabel}>Add details (optional)</Text>
      <TextInput
        style={rc.detailInput}
        value={details}
        onChangeText={setDetails}
        placeholder="Describe what happened in your own words…"
        placeholderTextColor={Colors.textTertiary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <Text style={rc.detailLabel}>Priority</Text>
      <View style={rc.priRow}>
        {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
          <TouchableOpacity key={p} style={[rc.priChip, priority === p && rc.priChipActive]} onPress={() => setPriority(p)} activeOpacity={0.85}>
            <Text style={[rc.priChipTxt, priority === p && rc.priChipTxtActive]}>{p.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[rc.submitBtn, !selected && rc.submitBtnDim]}
        onPress={handleSubmit}
        activeOpacity={0.88}
        disabled={!selected}
      >
        <MaterialIcons name="send" size={16} color="#fff" />
        <Text style={rc.submitTxt}>Submit Concern</Text>
      </TouchableOpacity>
    </View>
  );
}

function LawyerPanel({
  caseId,
  category,
  onBack,
  onSubmit,
}: {
  caseId: string;
  category: string;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const {
    cases,
    user,
    assignLawyer,
    createLawyerReviewTicket,
    resolveLawyerReviewTicket,
    closeLawyerReviewTicket,
    deductWalletForCase,
  } = useCaseStore();
  const active = (cases as any[]).find((c) => c.id === caseId);
  const mappedCategory = category.includes('matrimonial')
    ? 'Family Law'
    : category.includes('criminal')
      ? 'Criminal Law'
      : category.includes('employment')
        ? 'Employment & Labour'
        : category.includes('property')
          ? 'Property & Real Estate'
          : 'Documentation & Civil';
  const recommended = getLawyersByCategory(mappedCategory);
  const [useOwn, setUseOwn] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [own, setOwn] = useState({ name: '', phone: '', court: '', notes: '' });
  const [ticketMsg, setTicketMsg] = useState('');

  const oldRate = Number(active?.lawyer?.rate ?? active?.lawyer?.price ?? 0);
  const activeTicket = (active?.tickets ?? []).find((t: any) => t.type === 'lawyer_review' && (t.status === 'OPEN' || t.status === 'RESOLVED'));
  const selectedLawyer = !useOwn ? recommended.find((l) => l.id === selectedId) : null;
  const newRate = useOwn ? oldRate : Number(selectedLawyer?.price ?? selectedLawyer?.rate ?? 0);
  const difference = Math.max(0, newRate - oldRate);
  const replacementRecommended = activeTicket?.status === 'RESOLVED' && activeTicket?.resolution === 'Replacement recommended';
  const firstFreeAvailable = !active?.freeReplacementUsed;
  const payableDifference = replacementRecommended && firstFreeAvailable ? 0 : difference;

  const submit = () => {
    const chosen = useOwn
      ? {
          name: own.name.trim(),
          initials: own.name.trim().split(' ').map((s) => s[0] || '').slice(0, 2).join('').toUpperCase() || 'LA',
          isOnline: false,
          court: own.court,
          phone: own.phone,
          notes: own.notes,
        }
      : recommended.find((l) => l.id === selectedId);
    if (!chosen || !chosen.name) {
      Alert.alert('Select lawyer', 'Please select or add a lawyer first.');
      return;
    }
    if (activeTicket?.status !== 'RESOLVED') {
      Alert.alert('Review pending', 'Complete lawyer review ticket before replacement.');
      return;
    }
    if (payableDifference > 0) {
      const ok = deductWalletForCase(caseId, payableDifference);
      if (!ok) {
        Alert.alert('Insufficient wallet balance', `Need ₹${payableDifference}. Available ₹${user.walletBalance}.`);
        return;
      }
    }
    assignLawyer(caseId, chosen);
    if (replacementRecommended && firstFreeAvailable) {
      useCaseStore.getState().updateCase(caseId, { freeReplacementUsed: true } as any);
    }
    closeLawyerReviewTicket(caseId);
    onSubmit();
  };

  return (
    <View style={lp.root}>
      <View style={lp.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={lp.title}>Change / Add Lawyer</Text>
        <View style={{ width: 20 }} />
      </View>
      {!!active?.lawyer?.name && (
        <Text style={lp.warn}>Changing lawyer may affect progress.</Text>
      )}
      <Text style={lp.walletTxt}>Wallet balance: ₹{user.walletBalance}</Text>
      <View style={lp.ticketBox}>
        {!activeTicket ? (
          <TouchableOpacity
            style={lp.ticketBtn}
            onPress={() => {
              const id = createLawyerReviewTicket({ caseId });
              if (id) setTicketMsg(`Review in progress • Ticket #${id.replace('TICKET-', '')}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={lp.ticketBtnTxt}>Request Lawyer Review</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={lp.ticketState}>
              {activeTicket.status === 'OPEN'
                ? `Review in progress • Ticket #${activeTicket.id.replace('TICKET-', '')}`
                : `Ticket resolved • ${activeTicket.resolution}`}
            </Text>
            {activeTicket.status === 'OPEN' && (
              <View style={lp.resolveRow}>
                <TouchableOpacity style={lp.resolveBtn} onPress={() => resolveLawyerReviewTicket(caseId, 'Lawyer is fine')} activeOpacity={0.85}>
                  <Text style={lp.resolveBtnTxt}>Resolve: Lawyer is fine</Text>
                </TouchableOpacity>
                <TouchableOpacity style={lp.resolveBtn} onPress={() => resolveLawyerReviewTicket(caseId, 'Replacement recommended')} activeOpacity={0.85}>
                  <Text style={lp.resolveBtnTxt}>Resolve: Replacement recommended</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {!!ticketMsg && <Text style={lp.ticketMsg}>{ticketMsg}</Text>}
      </View>
      <View style={lp.modeRow}>
        <TouchableOpacity style={[lp.modeBtn, !useOwn && lp.modeBtnActive]} onPress={() => setUseOwn(false)} activeOpacity={0.85}>
          <Text style={[lp.modeTxt, !useOwn && lp.modeTxtActive]}>Choose from platform</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[lp.modeBtn, useOwn && lp.modeBtnActive]} onPress={() => setUseOwn(true)} activeOpacity={0.85}>
          <Text style={[lp.modeTxt, useOwn && lp.modeTxtActive]}>Add your own lawyer</Text>
        </TouchableOpacity>
      </View>
      {!useOwn ? (
        <View style={{ gap: 8 }}>
          {recommended.map((l) => (
            <TouchableOpacity key={l.id} style={[lp.card, selectedId === l.id && lp.cardActive]} onPress={() => setSelectedId(l.id)} activeOpacity={0.86}>
              <Text style={lp.name}>{l.name}</Text>
              <Text style={lp.meta}>{l.city} • {l.rating} • ₹{l.price}/min</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <TextInput style={lp.input} placeholder="Name" placeholderTextColor={Colors.textTertiary} value={own.name} onChangeText={(v) => setOwn((s) => ({ ...s, name: v }))} />
          <TextInput style={lp.input} placeholder="Phone" placeholderTextColor={Colors.textTertiary} value={own.phone} onChangeText={(v) => setOwn((s) => ({ ...s, phone: v }))} />
          <TextInput style={lp.input} placeholder="Court" placeholderTextColor={Colors.textTertiary} value={own.court} onChangeText={(v) => setOwn((s) => ({ ...s, court: v }))} />
          <TextInput style={[lp.input, { minHeight: 72 }]} multiline textAlignVertical="top" placeholder="Notes" placeholderTextColor={Colors.textTertiary} value={own.notes} onChangeText={(v) => setOwn((s) => ({ ...s, notes: v }))} />
        </View>
      )}
      <View style={lp.pricingBox}>
        {payableDifference <= 0 ? (
          <Text style={lp.pricingOk}>
            {replacementRecommended && firstFreeAvailable
              ? 'First replacement is free. No extra cost.'
              : 'Your replacement lawyer is within your existing plan. No extra cost.'}
          </Text>
        ) : (
          <Text style={lp.pricingWarn}>This lawyer costs ₹{payableDifference} more than your current plan.</Text>
        )}
      </View>
      <TouchableOpacity style={lp.submitBtn} onPress={submit} activeOpacity={0.88}>
        <Text style={lp.submitTxt}>{payableDifference > 0 ? `Pay ₹${payableDifference} & Replace` : 'Save Lawyer'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Expert Review Modal ──────────────────────────────────────────────────────
function ExpertReviewPanel({
  onBack,
  onPay,
}: {
  onBack: () => void;
  onPay: (lawyerId: string) => void;
}) {
  const [selectedLawyer, setSelectedLawyer] = useState<string | null>(null);

  return (
    <View style={er.root}>
      <View style={er.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={er.title}>Get Expert Review</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Trust messaging */}
      <LinearGradient colors={['rgba(245,166,35,0.15)', 'rgba(245,166,35,0.04)']} style={er.trustCard}>
        <MaterialIcons name="verified-user" size={20} color={Colors.gold} />
        <View style={{ flex: 1 }}>
          <Text style={er.trustTitle}>Need a second opinion?</Text>
          <Text style={er.trustDesc}>
            Get your case reviewed by a senior expert lawyer for better strategy and faster progress.
          </Text>
        </View>
      </LinearGradient>

      <View style={er.noticeRow}>
        <MaterialIcons name="info-outline" size={14} color={Colors.textTertiary} />
        <Text style={er.noticeTxt}>
          This does <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>NOT</Text> replace your current lawyer. This is an independent expert review only.
        </Text>
      </View>

      <Text style={er.pickLabel}>CHOOSE AN EXPERT LAWYER</Text>

      {EXPERT_LAWYERS.map((l) => (
        <TouchableOpacity
          key={l.id}
          style={[er.lawyerCard, selectedLawyer === l.id && er.lawyerCardSel]}
          onPress={() => setSelectedLawyer(l.id)}
          activeOpacity={0.86}
        >
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={er.avatar}>
            <Text style={er.avatarTxt}>{l.initials}</Text>
          </LinearGradient>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={er.nameRow}>
              <Text style={er.name} numberOfLines={1}>{l.name}</Text>
              {l.verified && <MaterialIcons name="verified" size={13} color={Colors.primary} />}
            </View>
            <Text style={er.spec} numberOfLines={1}>{l.specializations[0]}</Text>
            <View style={er.metaRow}>
              <MaterialIcons name="star" size={12} color={Colors.gold} />
              <Text style={er.rating}>{l.rating.average}</Text>
              <View style={er.dot} />
              <Text style={er.exp}>{l.experienceYears} yrs exp</Text>
            </View>
          </View>
          <View style={er.priceCol}>
            <Text style={er.price}>₹{l.fees.call30minInr}</Text>
            <Text style={er.priceSub}>30 min</Text>
            {selectedLawyer === l.id && (
              <MaterialIcons name="check-circle" size={18} color={Colors.success} style={{ marginTop: 4 }} />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[er.payBtn, !selectedLawyer && er.payBtnDim]}
        onPress={() => selectedLawyer && onPay(selectedLawyer)}
        activeOpacity={0.88}
        disabled={!selectedLawyer}
      >
        <MaterialIcons name="lock" size={14} color="#fff" />
        <Text style={er.payBtnTxt}>Get Expert Advice (Paid)</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Contact Support Panel ────────────────────────────────────────────────────
function ContactSupportPanel({ onBack }: { onBack: () => void }) {
  return (
    <View style={cs.root}>
      <View style={cs.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={cs.title}>Contact Support</Text>
        <View style={{ width: 20 }} />
      </View>
      <Text style={cs.sub}>Our team is available Mon–Sat, 9 AM – 6 PM IST.</Text>
      {[
        { icon: 'chat',  label: 'Chat with Us',      sub: 'Avg response: 5 min',     color: Colors.primary },
        { icon: 'phone', label: 'Call Support',       sub: '+91 98765 00000',          color: Colors.success },
        { icon: 'email', label: 'Email Us',           sub: 'support@law24.in',         color: Colors.gold },
      ].map((item) => (
        <TouchableOpacity key={item.label} style={cs.optionRow} activeOpacity={0.86}>
          <View style={[cs.optIcon, { backgroundColor: item.color + '1A' }]}>
            <MaterialIcons name={item.icon as any} size={20} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={cs.optLabel}>{item.label}</Text>
            <Text style={cs.optSub}>{item.sub}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main CaseActionsSheet ────────────────────────────────────────────────────
type Panel = 'main' | 'concern' | 'expert' | 'support' | 'lawyer';

export function CaseActionsSheet({ visible, onClose, caseId, caseTitle, onEditCaseDetails }: CaseActionsSheetProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>('main');
  const { cases } = useCaseStore();
  const activeCase = (cases as any[]).find((c) => c.id === caseId);

  const slideAnim    = useRef(new Animated.Value(800)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragY        = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const isClosing = useRef(false);

  // Show toast briefly
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      setPanel('main');
      setMounted(true);
      dragY.setValue(0);
      slideAnim.setValue(800);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim,    { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 0 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      if (isClosing.current) return;
      isClosing.current = true;
      Animated.parallel([
        Animated.timing(slideAnim,    { toValue: 800, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) { setMounted(false); } });
    }
  }, [visible]);

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dy, dx }) => dy > 6 && Math.abs(dy) > Math.abs(dx),
    onPanResponderGrant: () => { dragY.setOffset((dragY as any).__getValue()); dragY.setValue(0); },
    onPanResponderMove: (_, { dy }) => { dragY.setValue(Math.max(0, dy)); },
    onPanResponderRelease: (_, { dy, vy }) => {
      dragY.flattenOffset();
      const finalDy = (dragY as any).__getValue();
      if (finalDy > DISMISS_THRESHOLD || vy > 0.5) {
        onClose();
      } else {
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
      }
    },
  })).current;

  const handleCloseCaseConfirm = () => {
    Alert.alert(
      'Close This Case?',
      `Are you sure you want to close "${caseTitle}"? This action cannot be undone.`,
      [
        { text: 'Keep Case', style: 'cancel' },
        {
          text: 'Close Case',
          style: 'destructive',
          onPress: () => {
            onClose();
            showToast('Case closed successfully');
          },
        },
      ],
    );
  };

  const handlePay = (lawyerId: string) => {
    onClose();
    router.push(`/payment?lawyerId=${lawyerId}&type=expert-review` as any);
  };

  if (!mounted) return null;

  const combinedY  = Animated.add(slideAnim, dragY);
  const backdropOp = Animated.multiply(
    backdropAnim,
    dragY.interpolate({ inputRange: [0, DISMISS_THRESHOLD * 2], outputRange: [1, 0], extrapolate: 'clamp' }),
  );

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFillObject, m.backdrop, { opacity: backdropOp }]} pointerEvents="none" />
      <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} accessible={false} />

      {/* Sheet */}
      <Animated.View style={[m.sheet, { transform: [{ translateY: combinedY }] }]} pointerEvents="auto">

        {/* Drag handle */}
        <View style={m.handleZone} {...panResponder.panHandlers}>
          <View style={m.handle} />
        </View>

        {/* Title (changes per panel) */}
        <View style={m.sheetTitle}>
          <Text style={m.sheetTitleTxt}>
            {panel === 'main'    ? 'Case Actions' :
             panel === 'concern' ? 'Raise a Concern' :
             panel === 'expert'  ? 'Get Expert Review' :
                                   'Contact Support'}
          </Text>
        </View>

        <ScrollView
          style={m.scroll}
          contentContainerStyle={m.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ─── MAIN PANEL ─────────────────────────────────────────────── */}
          {panel === 'main' && (
            <>
              {/* Section 1: Case Management */}
              <Text style={m.sectionLabel}>MANAGE YOUR CASE</Text>
              <ActionRow
                icon="edit"         color={Colors.primary}
                label="Edit Case Details"
                sub="Update description, court, hearing date"
                onPress={() => {
                  onClose();
                  if (onEditCaseDetails) onEditCaseDetails(caseId);
                  else showToast('Opening case editor…');
                }}
              />
              <ActionRow
                icon="history"      color={Colors.blue}
                label="View Full History"
                sub="All updates, lawyer actions, changes"
                onPress={() => { onClose(); router.push({ pathname: '/case/history/[id]', params: { id: caseId } } as any); }}
              />

              {/* Section 2: Lawyer & Support */}
              <Text style={[m.sectionLabel, { marginTop: 16 }]}>LAWYER & SUPPORT</Text>
              <ActionRow
                icon="swap-horiz"   color={Colors.success}
                label="Change / Add Lawyer"
                sub="Find a better-suited specialist"
                badge="⚠️ May affect progress"
                onPress={() => setPanel('lawyer')}
              />
              <ActionRow
                icon="report-problem" color={Colors.warning}
                label="Raise a Concern"
                sub="Lawyer not responding? Unhappy with service?"
                onPress={() => setPanel('concern')}
              />
              <ActionRow
                icon="headset-mic"  color={Colors.primary}
                label="Contact Support"
                sub="Chat, call or email Law24 team"
                onPress={() => setPanel('support')}
              />

              {/* Section 3: Escalation (Premium) */}
              <Text style={[m.sectionLabel, { marginTop: 16 }]}>GET EXPERT HELP</Text>
              <TouchableOpacity style={m.escalateCard} onPress={() => setPanel('expert')} activeOpacity={0.88}>
                <LinearGradient colors={[Colors.gold + '22', Colors.gold + '08']} style={m.escalateGrad}>
                  <View style={m.escalateLeft}>
                    <View style={m.escalateIcon}>
                      <MaterialIcons name="workspace-premium" size={20} color={Colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={m.escalateTopRow}>
                        <Text style={m.escalateLabel}>Expert Case Review</Text>
                        <View style={m.premiumTag}><Text style={m.premiumTagTxt}>PAID</Text></View>
                      </View>
                      <Text style={m.escalateSub}>Get a second opinion from a senior lawyer — independent review of your case strategy</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.gold} style={{ marginTop: 4 }} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Section 4: Utilities */}
              <Text style={[m.sectionLabel, { marginTop: 16 }]}>CASE FILES</Text>
              <ActionRow
                icon="download"     color={Colors.blue}
                label="Download Case Summary"
                sub="Generate a PDF of your full case"
                onPress={() => { onClose(); showToast('Generating PDF summary…'); }}
              />
              <ActionRow
                icon="share"        color={Colors.primary}
                label="Share Case"
                sub="Share with family or another lawyer"
                onPress={() => { onClose(); showToast('Share sheet opening…'); }}
              />

              {/* Section 5: Danger Zone */}
              <Text style={[m.sectionLabel, { marginTop: 16, color: Colors.danger }]}>DANGER ZONE</Text>
              <ActionRow
                icon="cancel"       color={Colors.danger}
                label="Close This Case"
                sub="This cannot be undone"
                danger
                onPress={handleCloseCaseConfirm}
              />

              <View style={{ height: 24 }} />
            </>
          )}

          {/* ─── SUB-PANELS ─────────────────────────────────────────────── */}
          {panel === 'concern' && (
            <RaiseConcernPanel
              caseId={caseId}
              onBack={() => setPanel('main')}
              onSubmit={() => {
                setPanel('main');
                onClose();
                showToast('✅ Concern submitted — we\'ll follow up within 24 hrs');
              }}
            />
          )}

          {panel === 'expert' && (
            <ExpertReviewPanel
              onBack={() => setPanel('main')}
              onPay={handlePay}
            />
          )}

          {panel === 'support' && (
            <ContactSupportPanel onBack={() => setPanel('main')} />
          )}
          {panel === 'lawyer' && (
            <LawyerPanel
              caseId={caseId}
              category={(activeCase?.category || '').toLowerCase()}
              onBack={() => setPanel('main')}
              onSubmit={() => {
                setPanel('main');
                onClose();
                showToast('Lawyer updated successfully');
              }}
            />
          )}
        </ScrollView>
      </Animated.View>

      {/* Toast */}
      {toast && (
        <View style={m.toast} pointerEvents="none">
          <MaterialIcons name="check-circle" size={16} color="#fff" />
          <Text style={m.toastTxt}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Reusable Action Row ──────────────────────────────────────────────────────
function ActionRow({
  icon, color, label, sub, badge, danger, onPress,
}: {
  icon: string; color: string; label: string; sub: string;
  badge?: string; danger?: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[m.actionRow, danger && m.actionRowDanger]} onPress={onPress} activeOpacity={0.85}>
      <View style={[m.actionIcon, { backgroundColor: color + '1A' }]}>
        <MaterialIcons name={icon as any} size={19} color={color} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[m.actionLabel, danger && { color: Colors.danger }]}>{label}</Text>
        <Text style={m.actionSub}>{sub}</Text>
        {badge && (
          <View style={m.badgeRow}>
            <Text style={m.badgeTxt}>{badge}</Text>
          </View>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%',
    elevation: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4, shadowRadius: 20,
  },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  sheetTitle: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  sheetTitleTxt: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14 },

  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },

  // Action rows
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 13, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  actionRowDanger: { borderColor: Colors.danger + '40', backgroundColor: Colors.dangerSubtle },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  actionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  badgeRow: { marginTop: 5 },
  badgeTxt: { fontSize: 10, color: Colors.warning, fontWeight: '700', backgroundColor: Colors.warningSubtle, alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },

  // Escalation card
  escalateCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 8, borderWidth: 1.5, borderColor: Colors.gold + '44' },
  escalateGrad: { padding: 14 },
  escalateLeft: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  escalateIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  escalateTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  escalateLabel: { fontSize: 14, fontWeight: '800', color: Colors.gold },
  escalateSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  premiumTag: { backgroundColor: Colors.gold + '22', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: Colors.gold + '44' },
  premiumTagTxt: { fontSize: 9, fontWeight: '800', color: Colors.gold, letterSpacing: 0.8 },

  // Toast
  toast: {
    position: 'absolute', bottom: 60, left: 24, right: 24,
    backgroundColor: '#1A2740', borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, elevation: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12,
    borderWidth: 1, borderColor: Colors.success + '40',
  },
  toastTxt: { fontSize: 13, fontWeight: '600', color: '#fff', flex: 1 },
});

// Raise Concern styles
const rc = StyleSheet.create({
  root: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 6 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: Colors.border },
  optionSel: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  optionIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionTxt: { flex: 1, fontSize: 13, fontWeight: '500', color: Colors.textPrimary },
  optionTxtSel: { fontWeight: '700', color: Colors.primary },
  detailLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginTop: 6 },
  detailInput: { backgroundColor: Colors.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 12, fontSize: 13, color: Colors.textPrimary, minHeight: 80 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 13, height: 50, marginTop: 8 },
  submitBtnDim: { opacity: 0.4 },
  submitTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
  priRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  priChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated },
  priChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  priChipTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  priChipTxtActive: { color: Colors.primary, fontWeight: '700' },
});

const lp = StyleSheet.create({
  root: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  warn: { fontSize: 12, color: Colors.warning, backgroundColor: Colors.warningSubtle, borderRadius: 8, padding: 8 },
  walletTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  ticketBox: { backgroundColor: Colors.bgElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 10, gap: 8 },
  ticketBtn: { height: 38, borderRadius: 10, backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  ticketBtnTxt: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  ticketState: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  resolveRow: { gap: 8 },
  resolveBtn: { height: 34, borderRadius: 8, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  resolveBtnTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  ticketMsg: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  modeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  modeTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  modeTxtActive: { color: Colors.primary, fontWeight: '700' },
  card: { borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated, padding: 12 },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  name: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  input: { backgroundColor: Colors.bgElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, color: Colors.textPrimary, fontSize: 13 },
  pricingBox: { padding: 10, borderRadius: 10, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  pricingOk: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  pricingWarn: { color: Colors.warning, fontSize: 12, fontWeight: '700' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  submitTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

// Expert Review styles
const er = StyleSheet.create({
  root: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  trustCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.goldSubtle },
  trustTitle: { fontSize: 14, fontWeight: '800', color: Colors.gold, marginBottom: 4 },
  trustDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: Colors.bgElevated, borderRadius: 10, padding: 11 },
  noticeTxt: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  pickLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase' },
  lawyerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: Colors.border },
  lawyerCardSel: { borderColor: Colors.success, backgroundColor: Colors.successSubtle },
  avatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  spec: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rating: { fontSize: 11, fontWeight: '700', color: Colors.gold },
  exp: { fontSize: 11, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  priceCol: { alignItems: 'center', flexShrink: 0 },
  price: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  priceSub: { fontSize: 10, color: Colors.textTertiary },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 52, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  payBtnDim: { opacity: 0.4 },
  payBtnTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
});

// Contact Support styles
const cs = StyleSheet.create({
  root: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, lineHeight: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  optIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLabel: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  optSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
