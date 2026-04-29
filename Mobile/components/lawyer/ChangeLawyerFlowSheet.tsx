import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { BottomSheetWrapper } from '../ui/BottomSheetWrapper';
import { getLawyersByCategory, type CategoryLawyer } from '../../constants/categoryLawyers';
import { useAuthStore } from '../../store/useAuthStore';

type FlowStep = 'menu' | 'review' | 'platform' | 'own' | 'success';

type Props = {
  visible: boolean;
  onClose: () => void;
  caseId: string;
  caseTitle: string;
  caseCategory: string;
  walletBalance: number;
  currentLawyer: any;
  activeReviewTicket?: {
    status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';
    createdAt: string;
    slaDeadline: string;
  } | null;
  onCreateReviewTicket: (payload: { reason: string; note: string; type: 'LAWYER_CHANGE_REQUEST' }) => Promise<void>;
  onAssignPlatformLawyer: (payload: { lawyer: CategoryLawyer; extraChargeInr: number }) => Promise<void>;
  onAddOwnLawyer: (payload: { name: string; phone: string; email: string; firm?: string }) => Promise<void>;
};

const PLAN_RATE_CAP: Record<'free' | 'standard' | 'premium_pro', number> = {
  free: 20,
  standard: 25,
  premium_pro: 999,
};

const CATEGORY_TO_LAWYER_MAP: Record<string, string> = {
  matrimonial: 'Family Law',
  criminal: 'Criminal Law',
  property: 'Property & Real Estate',
  employment: 'Employment & Labour',
  civil: 'Documentation & Civil',
};

export function ChangeLawyerFlowSheet({
  visible,
  onClose,
  caseId,
  caseTitle,
  caseCategory,
  walletBalance,
  currentLawyer,
  activeReviewTicket,
  onCreateReviewTicket,
  onAssignPlatformLawyer,
  onAddOwnLawyer,
}: Props) {
  const [step, setStep] = useState<FlowStep>('menu');
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState('Not responsive');
  const [note, setNote] = useState('');
  const [selectedLawyerId, setSelectedLawyerId] = useState<string | null>(null);
  const [ownName, setOwnName] = useState('');
  const [ownPhone, setOwnPhone] = useState('');
  const [ownEmail, setOwnEmail] = useState('');
  const [ownFirm, setOwnFirm] = useState('');

  const userPlan = useAuthStore((s) => s.user?.plan ?? 'free');
  const mappedCategory = CATEGORY_TO_LAWYER_MAP[caseCategory] ?? 'Family Law';
  const platformLawyers = useMemo(() => getLawyersByCategory(mappedCategory), [mappedCategory]);
  const selectedLawyer = platformLawyers.find((l) => l.id === selectedLawyerId) ?? null;
  const hasOpenReview = Boolean(activeReviewTicket && ['OPEN', 'IN_REVIEW', 'ESCALATED'].includes(activeReviewTicket.status));

  const resetAndClose = () => {
    setStep('menu');
    setSaving(false);
    setReason('Not responsive');
    setNote('');
    setSelectedLawyerId(null);
    setOwnName('');
    setOwnPhone('');
    setOwnEmail('');
    setOwnFirm('');
    onClose();
  };

  const HeaderContext = (
    <View style={s.context}>
      <Text style={s.warn}>Changing lawyer may affect progress</Text>
      <View style={s.contextRow}>
        <Text style={s.label}>Wallet Balance</Text>
        <Text style={s.value}>INR {walletBalance}</Text>
      </View>
      <View style={s.contextCard}>
        <Text style={s.smallLabel}>Current Lawyer</Text>
        <Text style={s.name}>{currentLawyer?.name ?? 'Assigned Lawyer'}</Text>
        <Text style={s.meta}>
          {currentLawyer?.designation ?? 'Advocate'} • {currentLawyer?.experienceYears ?? currentLawyer?.experience ?? '--'} yrs
        </Text>
      </View>
    </View>
  );

  const handleSubmitReview = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onCreateReviewTicket({ reason, note: note.trim(), type: 'LAWYER_CHANGE_REQUEST' });
      setStep('success');
      setTimeout(resetAndClose, 1200);
    } catch {
      Alert.alert('Submit failed', 'Unable to submit request right now.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: handleSubmitReview },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPlatform = async () => {
    if (!selectedLawyer) {
      Alert.alert('Select Lawyer', 'Please select a platform lawyer first.');
      return;
    }
    const planCap = PLAN_RATE_CAP[userPlan];
    const extraPerMin = Math.max(0, selectedLawyer.price - planCap);
    const estimatedCharge = extraPerMin * 30;

    const proceed = async () => {
      if (saving) return;
      setSaving(true);
      try {
        await onAssignPlatformLawyer({ lawyer: selectedLawyer, extraChargeInr: estimatedCharge });
        setStep('success');
        setTimeout(resetAndClose, 1200);
      } catch {
        Alert.alert('Assignment failed', 'Could not assign lawyer.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: proceed },
        ]);
      } finally {
        setSaving(false);
      }
    };

    if (estimatedCharge > 0) {
      Alert.alert(
        'Additional Wallet Charge',
        `Selected lawyer is above your ${userPlan} plan. Estimated additional charge: INR ${estimatedCharge} (for ~30 mins). Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: proceed },
        ],
      );
      return;
    }

    await proceed();
  };

  const handleSubmitOwnLawyer = async () => {
    const phone = ownPhone.replace(/[^\d]/g, '');
    if (ownName.trim().length < 3) {
      Alert.alert('Invalid Name', 'Please enter a valid lawyer name.');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone.');
      return;
    }
    if (ownEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email.');
      return;
    }

    if (saving) return;
    setSaving(true);
    try {
      await onAddOwnLawyer({
        name: ownName.trim(),
        phone,
        email: ownEmail.trim(),
        firm: ownFirm.trim() || undefined,
      });
      setStep('success');
      setTimeout(resetAndClose, 1200);
    } catch {
      Alert.alert('Submit failed', 'Could not submit own lawyer details.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: handleSubmitOwnLawyer },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const renderPlatformLawyer = ({ item }: { item: CategoryLawyer }) => {
    const active = selectedLawyerId === item.id;
    return (
      <TouchableOpacity style={[s.lawyerItem, active && s.lawyerItemActive]} onPress={() => setSelectedLawyerId(item.id)} activeOpacity={0.9}>
        <View style={{ flex: 1 }}>
          <Text style={s.lawyerName}>{item.name}</Text>
          <Text style={s.lawyerMeta}>{item.city} • {item.court}</Text>
          <Text style={s.lawyerMeta}>Rating {item.rating} • INR {item.price}/min</Text>
        </View>
        {active && <MaterialIcons name="check-circle" size={18} color={Colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheetWrapper visible={visible} onClose={resetAndClose} heightPercent={0.9} enableScroll={false}>
      <View style={s.sheet}>
        {HeaderContext}

        {step === 'menu' && (
          <View style={s.section}>
            <Text style={s.title}>Change / Add Lawyer</Text>
            {hasOpenReview && (
              <View style={s.slaCard}>
                <Text style={s.slaTitle}>Review in progress (ETA: 48h)</Text>
                <Text style={s.slaSub}>Raised: {new Date(activeReviewTicket!.createdAt).toLocaleString('en-IN')}</Text>
                <Text style={s.slaSub}>Deadline: {new Date(activeReviewTicket!.slaDeadline).toLocaleString('en-IN')}</Text>
                <Text style={s.slaSub}>Status: {activeReviewTicket!.status.replace('_', ' ')}</Text>
              </View>
            )}
            <TouchableOpacity style={s.actionBtn} onPress={() => setStep('review')} activeOpacity={0.85}>
              <Text style={s.actionTxt}>Request Lawyer Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => setStep('platform')} activeOpacity={0.85}>
              <Text style={s.actionTxt}>Choose from Platform</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => setStep('own')} activeOpacity={0.85}>
              <Text style={s.actionTxt}>Add Your Own Lawyer</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'review' && (
          <View style={s.section}>
            <Text style={s.title}>Request Review</Text>
            <Text style={s.label}>Reason</Text>
            <View style={s.chipRow}>
              {['Not responsive', 'Not satisfied', 'Cost issue', 'Other'].map((r) => (
                <TouchableOpacity key={r} style={[s.chip, reason === r && s.chipActive]} onPress={() => setReason(r)} activeOpacity={0.85}>
                  <Text style={[s.chipTxt, reason === r && s.chipTxtActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.label}>Note (optional)</Text>
            <TextInput
              style={s.inputBox}
              value={note}
              onChangeText={setNote}
              placeholder="Share details to help support review faster"
              placeholderTextColor={Colors.textTertiary}
              multiline
            />
            <View style={s.row}>
              <TouchableOpacity style={s.secondaryBtn} onPress={() => setStep('menu')} activeOpacity={0.85}>
                <Text style={s.secondaryTxt}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.primaryBtn, (saving || hasOpenReview) && s.disabled]} onPress={handleSubmitReview} disabled={saving || hasOpenReview} activeOpacity={0.85}>
                <Text style={s.primaryTxt}>{hasOpenReview ? 'Request Submitted' : saving ? 'Submitting...' : 'Submit Request'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'platform' && (
          <FlatList
            data={platformLawyers}
            keyExtractor={(item) => item.id}
            renderItem={renderPlatformLawyer}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.list}
            ListHeaderComponent={<Text style={s.title}>Choose Platform Lawyer</Text>}
            ListFooterComponent={
              <View style={s.row}>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => setStep('menu')} activeOpacity={0.85}>
                  <Text style={s.secondaryTxt}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.primaryBtn, saving && s.disabled]} onPress={handleAssignPlatform} disabled={saving} activeOpacity={0.85}>
                  <Text style={s.primaryTxt}>{saving ? 'Saving...' : 'Save Lawyer'}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {step === 'own' && (
          <View style={s.section}>
            <Text style={s.title}>Add Your Own Lawyer</Text>
            <TextInput style={s.input} placeholder="Lawyer Name *" placeholderTextColor={Colors.textTertiary} value={ownName} onChangeText={setOwnName} />
            <TextInput style={s.input} placeholder="Phone *" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" value={ownPhone} onChangeText={setOwnPhone} />
            <TextInput style={s.input} placeholder="Email *" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" value={ownEmail} onChangeText={setOwnEmail} />
            <TextInput style={s.input} placeholder="Law firm (optional)" placeholderTextColor={Colors.textTertiary} value={ownFirm} onChangeText={setOwnFirm} />
            <View style={s.row}>
              <TouchableOpacity style={s.secondaryBtn} onPress={() => setStep('menu')} activeOpacity={0.85}>
                <Text style={s.secondaryTxt}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.primaryBtn, saving && s.disabled]} onPress={handleSubmitOwnLawyer} disabled={saving} activeOpacity={0.85}>
                <Text style={s.primaryTxt}>{saving ? 'Submitting...' : 'Submit for Verification'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 'success' && (
          <View style={s.success}>
            <MaterialIcons name="check-circle" size={42} color={Colors.success} />
            <Text style={s.successTitle}>Your request has been submitted</Text>
            <Text style={s.successSub}>Our team will assign a better lawyer within 48 hours</Text>
          </View>
        )}
      </View>
    </BottomSheetWrapper>
  );
}

const s = StyleSheet.create({
  sheet: { flex: 1, paddingHorizontal: 16, paddingBottom: 18, gap: 10 },
  context: { gap: 8, marginBottom: 4 },
  warn: { color: Colors.warning, fontSize: 12, fontWeight: '700' },
  contextRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: Colors.textTertiary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  contextCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, backgroundColor: Colors.bgSecondary, gap: 2 },
  smallLabel: { color: Colors.textTertiary, fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  name: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 12 },
  section: { gap: 10 },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  actionBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.bgElevated, height: 48, justifyContent: 'center', paddingHorizontal: 12 },
  actionTxt: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 18, backgroundColor: Colors.bgElevated, paddingHorizontal: 10, paddingVertical: 7 },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  chipTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTxtActive: { color: Colors.primary, fontWeight: '700' },
  inputBox: {
    minHeight: 86,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    color: Colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    color: Colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
  secondaryBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  secondaryTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  primaryBtn: { flex: 1.5, height: 46, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.55 },
  list: { gap: 8, paddingBottom: 10 },
  lawyerItem: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.bgElevated, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'center' },
  lawyerItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  lawyerName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  lawyerMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  successTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  successSub: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center' },
  slaCard: { borderWidth: 1, borderColor: Colors.warning + '44', borderRadius: 10, backgroundColor: Colors.warningSubtle, padding: 10, gap: 2 },
  slaTitle: { color: Colors.warning, fontSize: 12, fontWeight: '800' },
  slaSub: { color: Colors.textSecondary, fontSize: 11 },
});
