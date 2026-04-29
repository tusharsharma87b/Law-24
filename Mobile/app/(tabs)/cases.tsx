import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Platform, Pressable,
  TextInput, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getCTA, useCaseStore, type NewCaseForm } from '../../store/useCaseStore';
import { AppIcon, type AppIconName } from '../../components/ui/AppIcon';
import { getLawyersByCategory, type CategoryLawyer } from '../../constants/categoryLawyers';
import { BottomSheetWrapper } from '../../components/ui/BottomSheetWrapper';

const URGENCY: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: Colors.danger,  bg: Colors.dangerSubtle,  label: 'CRITICAL' },
  high:     { color: Colors.warning, bg: Colors.warningSubtle, label: 'HIGH' },
  medium:   { color: Colors.blue,    bg: Colors.blueSubtle,    label: 'MEDIUM' },
  low:      { color: Colors.success, bg: Colors.successSubtle, label: 'LOW' },
};

const CATEGORY_LABEL: Record<string, string> = {
  matrimonial: 'Matrimonial',
  employment:  'Employment',
  criminal:    'Criminal',
  property:    'Property',
  civil:       'Civil',
};

const CATEGORY_ICON: Record<string, AppIconName> = {
  matrimonial: 'lawyers',
  employment:  'cases',
  criminal:    'gavel',
  property:    'documents',
  civil:       'scale',
};

// ─── New Case Form (bottom sheet) ────────────────────────────────────────────

// Defined at MODULE level — never recreated on parent re-render.
// If defined inside NewCaseSheet, React treats it as a new component type
// on every state update → TextInput unmounts → keyboard focus lost after each char.
const FormInput = React.memo(function FormInput({
  label, value, placeholder, onChangeText,
}: {
  label: string; value: string; placeholder: string; onChangeText: (v: string) => void;
}) {
  return (
    <View style={f.fieldWrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoCorrect={false}
        autoCapitalize="words"
      />
    </View>
  );
});

const CATEGORY_OPTIONS = [
  { value: 'matrimonial', label: 'Matrimonial' },
  { value: 'employment',  label: 'Employment' },
  { value: 'criminal',    label: 'Criminal' },
  { value: 'property',    label: 'Property' },
  { value: 'civil',       label: 'Civil' },
];

const URGENCY_OPTIONS: { value: NewCaseForm['urgency']; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: Colors.danger },
  { value: 'high',     label: 'High',     color: Colors.warning },
  { value: 'medium',   label: 'Medium',   color: Colors.blue },
  { value: 'low',      label: 'Low',      color: Colors.success },
];

const CASE_TYPE_OPTIONS = ['Civil', 'Criminal', 'Family', 'Labour'] as const;
const COURT_OPTIONS = ['Sessions Court', 'High Court', 'Supreme Court'] as const;
const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;
const FIR_PATTERN = /^[A-Z]{2,}\/[A-Z]{3}\/\d{4}\/\d+$/;

const CATEGORY_TO_LAWYER_MAP: Record<string, string> = {
  matrimonial: 'Family Law',
  criminal: 'Criminal Law',
  property: 'Property & Real Estate',
  employment: 'Employment & Labour',
  civil: 'Documentation & Civil',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getExperienceYears(seed: string): number {
  let acc = 0;
  for (let i = 0; i < seed.length; i += 1) acc += seed.charCodeAt(i);
  return 5 + (acc % 11);
}

function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function isValidDate(dateString: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getDate() === day &&
    date.getMonth() === month - 1 &&
    date.getFullYear() === year
  );
}

function isFutureDate(dateString: string): boolean {
  const [day, month, year] = dateString.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
}

function isTodayOrPast(dateString: string): boolean {
  const [day, month, year] = dateString.split('/').map(Number);
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate <= today;
}

function formatAnyDateToInput(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}/${m}/${y}`;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type LawyerMode = 'platform' | 'external';

type ExternalLawyer = {
  name: string;
  phone: string;
  email: string;
  firm: string;
};

function NewCaseSheet({
  visible,
  onClose,
  onSubmit,
  lockedCategory,
  formMode = 'create',
  initialCaseData,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (form: NewCaseForm) => void;
  lockedCategory?: string;
  formMode?: 'create' | 'edit';
  initialCaseData?: any;
}) {
  const [form, setForm] = useState<NewCaseForm>({
    category: lockedCategory || 'matrimonial', title: '', section: '',
    caseType: '', caseNumber: '', court: '', courtName: '', city: '', firYear: '', judge: '',
    filedDate: '', nextHearing: '', notes: '', urgency: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<LawyerMode>('platform');
  const [showLawyerList, setShowLawyerList] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<CategoryLawyer | null>(null);
  const [ext, setExt] = useState<ExternalLawyer>({ name: '', phone: '', email: '', firm: '' });
  const [filedDateInput, setFiledDateInput] = useState('');
  const [hearingDateInput, setHearingDateInput] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [showStateList, setShowStateList] = useState(false);

  const set = (key: keyof NewCaseForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const recommendedLawyers = React.useMemo(() => {
    const mappedCategory = CATEGORY_TO_LAWYER_MAP[form.category] ?? 'Family Law';
    return getLawyersByCategory(mappedCategory);
  }, [form.category]);

  const setCaseNumber = (value: string) => {
    const upper = value.toUpperCase();
    setForm((prev) => ({ ...prev, caseNumber: upper }));
    if (errors.caseNumber) setErrors((prev) => ({ ...prev, caseNumber: '' }));
    const parts = upper.split('/');
    if (parts.length >= 4) {
      const year = parts[2];
      if (/^\d{4}$/.test(year)) setForm((prev) => ({ ...prev, firYear: year }));
    }
  };

  const setJudge = (value: string) => {
    const cleaned = value.replace(/\s+/g, ' ').trimStart();
    const capitalized = cleaned.replace(/\b\w/g, (ch) => ch.toUpperCase());
    set('judge', capitalized);
  };

  const validate = (nextForm: NewCaseForm, external: ExternalLawyer, selectedMode: LawyerMode, filedText: string, hearingText: string) => {
    const nextErrors: Record<string, string> = {};
    if (!nextForm.title.trim()) nextErrors.title = 'Case title is required';
    if (!(nextForm.city ?? '').trim()) nextErrors.city = 'Please select state / UT';
    if (nextForm.caseNumber.trim().length > 0 && !FIR_PATTERN.test(nextForm.caseNumber)) {
      nextErrors.caseNumber = 'Enter valid FIR format (e.g. DV/BLR/2026/1234)';
    }
    if (!filedText.trim()) {
      nextErrors.filedDate = 'Filed date required';
    } else if (!isValidDate(filedText)) {
      nextErrors.filedDate = 'Invalid date format';
    } else if (!isTodayOrPast(filedText)) {
      nextErrors.filedDate = 'Filed date can only be past or today';
    }
    if (!hearingText.trim()) {
      nextErrors.nextHearing = 'Hearing date required';
    } else if (!isValidDate(hearingText)) {
      nextErrors.nextHearing = 'Invalid date format';
    } else if (!isFutureDate(hearingText)) {
      nextErrors.nextHearing = 'Hearing date must be in future';
    }
    if (selectedMode === 'external') {
      if (external.name.trim().length < 3) nextErrors.extName = 'Lawyer name must be at least 3 characters';
      if (!/^\d{10}$/.test(external.phone.replace(/\D/g, ''))) nextErrors.extPhone = 'Enter valid 10-digit phone number';
      if (external.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(external.email.trim())) nextErrors.extEmail = 'Enter valid email';
    }
    return nextErrors;
  };

  const isLawyerSet = mode === 'platform' ? !!selectedLawyer : ext.name.trim().length >= 3 && /^\d{10}$/.test(ext.phone.replace(/\D/g, ''));
  const isFormValid = React.useMemo(
    () => Object.keys(validate(form, ext, mode, filedDateInput, hearingDateInput)).length === 0,
    [form, ext, mode, filedDateInput, hearingDateInput]
  );
  const stateOptions = React.useMemo(
    () => INDIA_STATES.filter((s) => s.toLowerCase().includes(stateQuery.toLowerCase().trim())),
    [stateQuery],
  );

  React.useEffect(() => {
    if (lockedCategory) {
      setForm((prev) => ({ ...prev, category: lockedCategory }));
    }
  }, [lockedCategory]);

  React.useEffect(() => {
    if (!visible || formMode !== 'edit' || !initialCaseData) return;
    const hearingRaw = initialCaseData.nextHearing || initialCaseData.hearingDate || '';
    const filedRaw = initialCaseData.filedDate || '';
    const c = initialCaseData as any;
    setForm({
      category: lockedCategory || c.category || 'matrimonial',
      title: c.title || '',
      section: c.section || c.chips?.[0] || '',
      caseType: c.caseType || c.type || '',
      caseNumber: c.caseNumber || '',
      court: c.court || '',
      courtName: c.courtName || (c.court || '').split(',')[0]?.trim() || '',
      city: c.city || (c.court || '').split(',')[1]?.trim() || '',
      firYear: c.firYear || '',
      judge: c.judge || '',
      filedDate: c.filedDate || '',
      nextHearing: hearingRaw || '',
      notes: c.notes || '',
      assignedLawyerId: c.assignedLawyerId,
      assignedLawyerName: c.assignedLawyerName || c.lawyer?.name,
      urgency: c.urgency || 'medium',
    });
    setFiledDateInput(formatAnyDateToInput(filedRaw));
    setHearingDateInput(formatAnyDateToInput(hearingRaw));
    if (c.assignedLawyerName || c.lawyer?.name) {
      setMode('external');
      setExt((prev) => ({
        ...prev,
        name: c.assignedLawyerName || c.lawyer?.name || '',
      }));
    }
  }, [visible, formMode, initialCaseData, lockedCategory]);

  if (!visible) return <View pointerEvents="none" />;

  const handleSubmit = () => {
    const nextErrors = validate(form, ext, mode, filedDateInput, hearingDateInput);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const safeCity = form.city || 'Delhi';
    const safeCourtName = form.courtName || 'District Court';
    const safeCaseType = form.caseType || 'Civil';
    const safeSection = form.section.trim() || 'General Legal Relief';
    const autoCaseNumber =
      form.caseNumber.trim() ||
      `CASE/${safeCity}/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`;
    const court = `${safeCourtName}, ${safeCity}`;
    onSubmit({
      ...form,
      title: form.title.trim(),
      section: safeSection,
      caseType: safeCaseType,
      caseNumber: autoCaseNumber,
      courtName: safeCourtName,
      city: safeCity,
      category: lockedCategory || form.category,
      court,
      filedDate: filedDateInput,
      nextHearing: hearingDateInput,
      assignedLawyerId: mode === 'platform' ? selectedLawyer?.id : undefined,
      assignedLawyerName: mode === 'platform' ? selectedLawyer?.name : ext.name.trim() || undefined,
    });
    // Reset form
    setForm({
      category: lockedCategory || 'matrimonial', title: '', section: '', caseType: '', caseNumber: '', court: '', courtName: '', city: '', firYear: '',
      judge: '', filedDate: '', nextHearing: '', notes: '', urgency: 'medium',
    });
    setMode('platform');
    setSelectedLawyer(null);
    setShowLawyerList(false);
    setExt({ name: '', phone: '', email: '', firm: '' });
    setFiledDateInput('');
    setHearingDateInput('');
    setErrors({});
  };

  return (
    <BottomSheetWrapper visible={visible} onClose={onClose} heightPercent={0.9} enableScroll={false}>
      <View style={f.sheetHeader}>
        <View>
          <Text style={f.sheetTitle}>{formMode === 'edit' ? 'Edit Case Details' : 'Register New Case'}</Text>
          <Text style={f.sheetSub}>{formMode === 'edit' ? 'Update details and save changes' : 'Fill basic details — you can update more later'}</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={12}>
          <AppIcon name="close" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          style={f.scroll}
          contentContainerStyle={f.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
            {/* Category */}
            <Text style={f.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={f.catRow} style={{ marginBottom: 16 }}>
              {CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[f.catChip, form.category === opt.value && f.catChipActive]}
                  onPress={() => !lockedCategory && set('category', opt.value)}
                  activeOpacity={0.8}
                  disabled={!!lockedCategory}
                >
                  <Text style={[f.catChipTxt, form.category === opt.value && f.catChipTxtActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {!!lockedCategory && <Text style={f.lockedHint}>Category is fixed for this case group.</Text>}

            {/* Assign lawyer */}
            <Text style={f.label}>Assign Lawyer (Optional)</Text>
            <View style={f.segment}>
              <Pressable onPress={() => setMode('platform')} style={[f.segmentBtn, mode === 'platform' && f.segmentBtnActive]}>
                <Text style={[f.segmentTxt, mode === 'platform' && f.segmentTxtActive]}>From Law24</Text>
              </Pressable>
              <Pressable onPress={() => setMode('external')} style={[f.segmentBtn, mode === 'external' && f.segmentBtnActive]}>
                <Text style={[f.segmentTxt, mode === 'external' && f.segmentTxtActive]}>My Lawyer</Text>
              </Pressable>
            </View>
            {isLawyerSet && (
              <View style={f.assignedTick}>
                <Text style={f.assignedTickTxt}>✓ Lawyer assigned</Text>
              </View>
            )}

            {mode === 'platform' ? (
              <>
                <TouchableOpacity style={f.inputBox} onPress={() => setShowLawyerList((p) => !p)} activeOpacity={0.85}>
                  <Text style={selectedLawyer ? f.inputBoxValue : f.inputBoxPlaceholder}>
                    {selectedLawyer ? selectedLawyer.name : 'Select your lawyer'}
                  </Text>
                  <AppIcon name="forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
                {!selectedLawyer && (
                  <>
                    <Text style={f.helper}>Don’t have a lawyer? We’ll recommend the best match.</Text>
                    <TouchableOpacity style={f.findBtn} onPress={() => setShowLawyerList(true)} activeOpacity={0.85}>
                      <Text style={f.findBtnTxt}>Find Lawyer for Me</Text>
                    </TouchableOpacity>
                  </>
                )}
                {showLawyerList && !selectedLawyer && (
                  <View style={f.recommendWrap}>
                    {recommendedLawyers.map((lawyer) => (
                      <TouchableOpacity
                        key={lawyer.id}
                        style={f.recommendCard}
                        onPress={() => {
                          setSelectedLawyer(lawyer);
                          setShowLawyerList(false);
                        }}
                        activeOpacity={0.9}
                      >
                        <Text style={f.recommendName}>{lawyer.name}</Text>
                        <Text style={f.recommendMeta}>⭐ {lawyer.rating} • {getExperienceYears(lawyer.id)} yrs • ₹{lawyer.price}/min</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={f.externalWrap}>
                <View style={f.fieldWrap}>
                  <Text style={f.label}>Lawyer Name *</Text>
                  <TextInput
                    style={f.input}
                    placeholder="Lawyer Name *"
                    placeholderTextColor={Colors.textTertiary}
                    value={ext.name}
                    onChangeText={(v) => setExt((s) => ({ ...s, name: v }))}
                    autoCapitalize="words"
                  />
                  {!!errors.extName && <Text style={f.errorTxt}>{errors.extName}</Text>}
                </View>
                <View style={f.fieldWrap}>
                  <Text style={f.label}>Phone Number *</Text>
                  <TextInput
                    style={f.input}
                    placeholder="Phone Number *"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                    value={ext.phone}
                    onChangeText={(v) => setExt((s) => ({ ...s, phone: v.replace(/[^\d]/g, '').slice(0, 10) }))}
                  />
                  {!!errors.extPhone && <Text style={f.errorTxt}>{errors.extPhone}</Text>}
                </View>
                <View style={f.fieldWrap}>
                  <Text style={f.label}>Email (Optional)</Text>
                  <TextInput
                    style={f.input}
                    placeholder="Email (optional)"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={ext.email}
                    onChangeText={(v) => setExt((s) => ({ ...s, email: v.trim() }))}
                  />
                  {!!errors.extEmail && <Text style={f.errorTxt}>{errors.extEmail}</Text>}
                </View>
                <View style={f.fieldWrap}>
                  <Text style={f.label}>Law Firm (Optional)</Text>
                  <TextInput
                    style={f.input}
                    placeholder="Law Firm (optional)"
                    placeholderTextColor={Colors.textTertiary}
                    value={ext.firm}
                    onChangeText={(v) => setExt((s) => ({ ...s, firm: v }))}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Primary section/act */}
            <FormInput label="Section / Act *" value={form.section} placeholder="e.g. DV Act, Section 498A, Section 125" onChangeText={(v) => set('section', v)} />
            {!!errors.section && <Text style={f.errorTxt}>{errors.section}</Text>}
            <FormInput label="Case Title *" value={form.title} placeholder="e.g. DV Application — Bengaluru HC" onChangeText={(v) => set('title', v)} />
            {!!errors.title && <Text style={f.errorTxt}>{errors.title}</Text>}
            <Text style={f.label}>Case Type *</Text>
            <View style={f.optionRow}>
              {CASE_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt} style={[f.optionChip, form.caseType === opt && f.optionChipActive]} onPress={() => set('caseType', opt)} activeOpacity={0.85}>
                  <Text style={[f.optionChipTxt, form.caseType === opt && f.optionChipTxtActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!!errors.caseType && <Text style={f.errorTxt}>{errors.caseType}</Text>}

            <FormInput label="Case / FIR Number *" value={form.caseNumber} placeholder="e.g. DV/BLR/2026/1234" onChangeText={setCaseNumber} />
            {!!errors.caseNumber && <Text style={f.errorTxt}>{errors.caseNumber}</Text>}

            <Text style={f.label}>Court Name *</Text>
            <View style={f.optionRow}>
              {COURT_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt} style={[f.optionChip, form.courtName === opt && f.optionChipActive]} onPress={() => set('courtName', opt)} activeOpacity={0.85}>
                  <Text style={[f.optionChipTxt, form.courtName === opt && f.optionChipTxtActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!!errors.courtName && <Text style={f.errorTxt}>{errors.courtName}</Text>}

            <Text style={f.label}>State / UT *</Text>
            <View style={f.fieldWrap}>
              <TouchableOpacity
                style={f.inputBox}
                onPress={() => setShowStateList((v) => !v)}
                activeOpacity={0.85}
              >
                <Text style={form.city ? f.inputBoxValue : f.inputBoxPlaceholder}>
                  {form.city || 'Select state / UT'}
                </Text>
                <AppIcon name="forward" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
              {showStateList && (
                <View style={f.statePickerWrap}>
                  <TextInput
                    style={f.input}
                    value={stateQuery}
                    onChangeText={setStateQuery}
                    placeholder="Search state / UT"
                    placeholderTextColor={Colors.textTertiary}
                    autoCapitalize="words"
                  />
                  <ScrollView
                    style={f.stateList}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {stateOptions.map((name) => (
                      <TouchableOpacity
                        key={name}
                        style={[f.stateRow, form.city === name && f.stateRowActive]}
                        onPress={() => {
                          set('city', name);
                          setShowStateList(false);
                          setStateQuery('');
                          if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={[f.stateTxt, form.city === name && f.stateTxtActive]}>{name}</Text>
                      </TouchableOpacity>
                    ))}
                    {stateOptions.length === 0 && <Text style={f.noStateTxt}>No matches</Text>}
                  </ScrollView>
                </View>
              )}
            </View>
            {!!errors.city && <Text style={f.errorTxt}>{errors.city}</Text>}

            {!!form.firYear && <Text style={f.autoFillTxt}>Auto-filled from FIR: Year {form.firYear}</Text>}

            <FormInput label="Presiding Judge (Optional)" value={form.judge} placeholder="e.g. Hon. Justice R. Kumar" onChangeText={setJudge} />
            <FormInput label="Notes (Optional)" value={form.notes ?? ''} placeholder="Add brief notes for this case" onChangeText={(v) => set('notes', v)} />

            <Text style={f.label}>Filed Date *</Text>
            <TextInput
              style={[f.input, !!errors.filedDate && f.inputError]}
              value={filedDateInput}
              onChangeText={(v) => {
                setFiledDateInput(formatDateInput(v));
                if (errors.filedDate) setErrors((prev) => ({ ...prev, filedDate: '' }));
              }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={10}
            />
            {!!errors.filedDate && <Text style={f.errorTxt}>{errors.filedDate}</Text>}

            <Text style={f.label}>Next Hearing Date *</Text>
            <TextInput
              style={[f.input, !!errors.nextHearing && f.inputError]}
              value={hearingDateInput}
              onChangeText={(v) => {
                setHearingDateInput(formatDateInput(v));
                if (errors.nextHearing) setErrors((prev) => ({ ...prev, nextHearing: '' }));
              }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={10}
            />
            {!!errors.nextHearing && <Text style={f.errorTxt}>{errors.nextHearing}</Text>}

            {/* Urgency */}
            <Text style={[f.label, { marginBottom: 8 }]}>Urgency Level</Text>
            <View style={f.urgRow}>
              {URGENCY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[f.urgChip, form.urgency === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '1A' }]}
                  onPress={() => setForm((prev) => ({ ...prev, urgency: opt.value }))}
                  activeOpacity={0.8}
                >
                  {form.urgency === opt.value && <View style={[f.urgDot, { backgroundColor: opt.color }]} />}
                  <Text style={[f.urgTxt, form.urgency === opt.value && { color: opt.color, fontWeight: '700' }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: 20 }} />
            {/* Submit */}
            <View style={f.submitWrap}>
            <TouchableOpacity
              style={[f.submitBtn, !isFormValid && f.submitBtnDim]}
              onPress={handleSubmit}
              activeOpacity={0.88}
            >
              <AppIcon name="plus" size={18} color="#fff" />
              <Text style={f.submitTxt}>{formMode === 'edit' ? 'Save Changes' : 'Create Case'}</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheetWrapper>
  );
}

export default function CasesScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ openNew?: string; category?: string; editCaseId?: string; source?: string }>();
  const { cases, addCase, updateCase, refreshStatuses } = useCaseStore();
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [lockedCategory, setLockedCategory] = useState<string | undefined>(undefined);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const openFromParamsHandledRef = useRef(false);
  // Track which categories are COLLAPSED (default: none — all start expanded)
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const dataLoaded = Array.isArray(cases);
  if (!dataLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgPrimary }}>
        <Text style={{ color: Colors.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  const toggleCat = (cat: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);   // re-expand
      else next.add(cat);                     // collapse
      return next;
    });
  };

  const handleAddCase = (form: NewCaseForm) => {
    if (formMode === 'edit' && editingCaseId) {
      const original = (cases as any[]).find((c) => c.id === editingCaseId);
      if (!original) return;
      updateCase(editingCaseId, {
        ...original,
        ...form,
        type: form.caseType,
        section: form.section,
        chips: form.section ? [form.section] : original.chips,
        court: `${form.courtName || ''}${form.city ? `, ${form.city}` : ''}`.trim(),
        courtName: form.courtName,
        city: form.city,
        nextHearing: form.nextHearing,
        hearingDate: form.nextHearing,
        filedDate: form.filedDate,
      } as any);
      setEditingCaseId(null);
      setFormMode('create');
      setLockedCategory(undefined);
      setShowNewCaseForm(false);
      router.push({ pathname: '/case/[id]', params: { id: editingCaseId } });
      return;
    }
    const newId = addCase({
      ...form,
      category: lockedCategory || form.category,
    });
    setLockedCategory(undefined);
    setShowNewCaseForm(false);
    router.push({ pathname: '/case/[id]', params: { id: newId } });
  };

  useEffect(() => {
    refreshStatuses();
  }, [refreshStatuses]);

  useEffect(() => {
    const validSource = ['subcategory', 'case_selector_add', 'edit_case'].includes(params.source ?? '');
    const contextTriggered =
      validSource ||
      Boolean(params.editCaseId && params.source === 'edit_case') ||
      Boolean(params.category && params.source === 'case_selector_add');
    if (params.openNew === '1' && contextTriggered) {
      if (openFromParamsHandledRef.current) return;
      openFromParamsHandledRef.current = true;
      setLockedCategory(params.category || undefined);
      setFormMode(params.editCaseId ? 'edit' : 'create');
      setEditingCaseId(params.editCaseId || null);
      setShowNewCaseForm(true);
      // Consume web query so revisiting /cases doesn't auto-open again.
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.history.replaceState({}, '', pathname || '/cases');
      }
    } else {
      openFromParamsHandledRef.current = false;
    }
  }, [params.openNew, params.category, params.editCaseId, params.source, pathname]);

  // Group cases by category
  const grouped = cases.reduce<Record<string, typeof cases>>((acc, c) => {
    const cat = (c as any).category ?? 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Case OS</Text>
          <Text style={s.sub}>{cases.length} active {cases.length === 1 ? 'case' : 'cases'}</Text>
        </View>
        <TouchableOpacity style={s.newBtn} activeOpacity={0.82} onPress={() => { setLockedCategory(undefined); setEditingCaseId(null); setFormMode('create'); setShowNewCaseForm(true); }}>
          <AppIcon name="plus" size={16} color={Colors.primary} />
          <Text style={s.newTxt}>New Case</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(grouped).map(([cat, catCases]) => (
          <View key={cat} style={s.categoryGroup}>
            {/* Category Header */}
            <TouchableOpacity
              style={s.catHeader}
              onPress={() => toggleCat(cat)}
              activeOpacity={0.8}
            >
              <View style={s.catLeft}>
                <View style={s.catIconWrap}>
                  <AppIcon name={CATEGORY_ICON[cat] ?? 'documents'} size={16} color={Colors.primary} />
                </View>
                <Text style={s.catTitle}>
                  {CATEGORY_LABEL[cat] ?? cat} Cases
                </Text>
                <View style={s.catCount}>
                  <Text style={s.catCountTxt}>{catCases.length}</Text>
                </View>
              </View>
              <View style={{ transform: [{ rotate: collapsedCats.has(cat) ? '90deg' : '-90deg' }] }}>
                <AppIcon name="forward" size={16} color={Colors.textTertiary} />
              </View>
            </TouchableOpacity>

            {/* Case Cards — hidden when category is collapsed */}
            {!collapsedCats.has(cat) && catCases.map((c) => {
              const u = URGENCY[(c as any).urgency] ?? URGENCY.medium;
              const caseAny = c as any;
              const timelineFlow = Array.isArray(caseAny.timelineFlow) ? caseAny.timelineFlow : [];
              const doneCount = timelineFlow.filter((t: any) => t.done).length;
              const progress = timelineFlow.length ? doneCount / timelineFlow.length : 0;
              const hearingTs = caseAny.nextHearing ? new Date(caseAny.nextHearing).getTime() : Number.NaN;
              const now = Date.now();
              const inThreeDays = Number.isFinite(hearingTs) && hearingTs >= now && hearingTs <= now + 3 * 24 * 60 * 60 * 1000;
              const statusText = caseAny.status === 'completed' ? 'Completed' : 'Active';
              const ctaText = getCTA(caseAny.lawyer, caseAny.urgency);
              return (
                <TouchableOpacity
                  key={c.id}
                  style={s.card}
                  activeOpacity={0.86}
                  onPress={() => router.push({ pathname: '/case/[id]', params: { id: c.id } })}
                >
                  {/* Top row: chips + urgency */}
                  <View style={s.topRow}>
                    <View style={s.chipRow}>
                      {c.chips.slice(0, 3).map((chip) => (
                        <View key={chip} style={s.chip}>
                          <Text style={s.chipTxt}>{chip}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={[s.urgencyBadge, { backgroundColor: u.bg }]}>
                      <View style={[s.urgencyDot, { backgroundColor: u.color }]} />
                      <Text style={[s.urgencyTxt, { color: u.color }]}>{u.label}</Text>
                    </View>
                  </View>

                  {/* Case title */}
                  <Text style={s.caseTitle}>{c.title}</Text>
                  <View style={s.statusRow}>
                    <Text style={[s.statusPill, caseAny.status === 'completed' && s.statusCompleted]}>{statusText}</Text>
                    {(caseAny.priority || caseAny.urgency === 'critical') && <Text style={s.priorityPill}>Critical</Text>}
                    {inThreeDays && <Text style={s.upcomingPill}>Upcoming</Text>}
                  </View>

                  {/* Next hearing highlight */}
                  {caseAny.nextHearing && (
                    <View style={s.hearingRow}>
                      <AppIcon name="calendar" size={13} color={Colors.primary} />
                      <Text style={s.hearingTxt}>Next hearing: <Text style={s.hearingDate}>{caseAny.nextHearing}</Text></Text>
                    </View>
                  )}

                  {/* Court + Judge */}
                  {caseAny.court && (
                    <View style={s.courtRow}>
                      <AppIcon name="scale" size={12} color={Colors.textTertiary} />
                      <Text style={s.courtTxt} numberOfLines={1}>{caseAny.court}</Text>
                    </View>
                  )}

                  {/* Meta strip */}
                  <View style={s.metaStrip}>
                    <View style={s.metaItem}>
                      <Text style={s.metaLabel}>Type</Text>
                      <Text style={s.metaValue}>{c.type}</Text>
                    </View>
                    <View style={s.metaDivider} />
                    <View style={s.metaItem}>
                      <Text style={s.metaLabel}>Win Probability</Text>
                      <Text style={[s.metaValue, { color: Colors.success }]}>{c.successProbability}%</Text>
                    </View>
                    <View style={s.metaDivider} />
                    <View style={s.metaItem}>
                      <Text style={s.metaLabel}>Stage</Text>
                      <Text style={s.metaValue} numberOfLines={1}>{c.stage}</Text>
                    </View>
                  </View>
                  <View style={s.progressWrap}>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: `${Math.max(6, Math.round(progress * 100))}%` }]} />
                    </View>
                    <Text style={s.progressTxt}>Progress {Math.round(progress * 100)}%</Text>
                  </View>

                  {/* Stage progress */}
                  <View style={s.stageTrack}>
                    {c.stages.map((st, idx) => (
                      <View key={st} style={[s.stageSegment, idx < c.stages.length - 1 && { flex: 1 }]}>
                        <View style={[s.stageDot, idx <= c.activeStageIndex && s.stageDotActive]}>
                          {idx <= c.activeStageIndex && <View style={s.stageDotInner} />}
                        </View>
                        {idx < c.stages.length - 1 && (
                          <View style={[s.stageLine, idx < c.activeStageIndex && s.stageLineActive]} />
                        )}
                      </View>
                    ))}
                  </View>
                  <View style={s.stageLabelRow}>
                    {c.stages.map((st, idx) => (
                      <Text key={st} style={[s.stageLabel, idx === c.activeStageIndex && s.stageLabelActive]} numberOfLines={1}>
                        {st}
                      </Text>
                    ))}
                  </View>

                  {/* Pending actions count */}
                  {caseAny.pendingActions?.length > 0 && (
                    <View style={s.pendingRow}>
                      <AppIcon name="time" size={13} color={Colors.warning} />
                      <Text style={s.pendingTxt}>
                        {caseAny.pendingActions.length} pending {caseAny.pendingActions.length === 1 ? 'action' : 'actions'}
                      </Text>
                    </View>
                  )}

                  {/* Footer: lawyer + arrow */}
                  <View style={s.cardFooter}>
                    <View style={s.lawyerRow}>
                      <View style={s.lawyerAvatar}>
                        <Text style={s.lawyerInitials}>{c.lawyer.initials}</Text>
                      </View>
                      <View>
                        <Text style={s.lawyerName}>{c.lawyer.name}</Text>
                        <View style={s.lawyerOnlineRow}>
                          <View style={[s.onlineDot, { backgroundColor: c.lawyer.isOnline ? Colors.success : '#6B7280' }]} />
                          <Text style={s.lawyerOnlineTxt}>{c.lawyer.isOnline ? 'Online' : 'Offline'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.viewBtn}>
                      <Text style={s.viewBtnTxt}>{ctaText}</Text>
                      <AppIcon name="forward" size={14} color={Colors.primary} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {cases.length === 0 && (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <AppIcon name="cases" size={34} color={Colors.textTertiary} />
            </View>
            <Text style={s.emptyTitle}>No active cases</Text>
            <Text style={s.emptySub}>Start with NyayaAI to get guidance and create your first case</Text>
            <TouchableOpacity style={s.emptyBtn} activeOpacity={0.85}>
              <AppIcon name="sparkles" size={16} color="#fff" />
              <Text style={s.emptyBtnTxt}>Ask NyayaAI</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom padding to clear tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* New Case Form Sheet */}
      <NewCaseSheet
        visible={showNewCaseForm}
        onClose={() => {
          setShowNewCaseForm(false);
          setLockedCategory(undefined);
          setFormMode('create');
          setEditingCaseId(null);
        }}
        onSubmit={handleAddCase}
        lockedCategory={lockedCategory}
        formMode={formMode}
        initialCaseData={editingCaseId ? (cases as any[]).find((c) => c.id === editingCaseId) : undefined}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgPrimary },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  title:  { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  sub:    { fontSize: 12, color: Colors.textTertiary, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primarySubtle, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(59,91,219,0.25)',
  },
  newTxt: { color: Colors.primary, fontSize: 13, fontWeight: '700' },

  list: { paddingHorizontal: 16, paddingTop: 14, gap: 6 },

  // Category group
  categoryGroup: { marginBottom: 14 },
  catHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 4, marginBottom: 10,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center',
  },
  catTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  catCount: {
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  catCountTxt: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

  // Case card
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  chipRow: { flex: 1, flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginRight: 8 },
  chip: { backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  chipTxt: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },

  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  urgencyDot: { width: 5, height: 5, borderRadius: 3 },
  urgencyTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  caseTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  statusRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  statusPill: {
    backgroundColor: Colors.blueSubtle,
    color: Colors.blue,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusCompleted: { backgroundColor: Colors.successSubtle, color: Colors.success },
  priorityPill: {
    backgroundColor: Colors.dangerSubtle,
    color: Colors.danger,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  upcomingPill: {
    backgroundColor: Colors.warningSubtle,
    color: Colors.warning,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  hearingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  hearingTxt: { fontSize: 12, color: Colors.textSecondary },
  hearingDate: { color: Colors.primary, fontWeight: '700' },

  courtRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  courtTxt: { fontSize: 11, color: Colors.textTertiary, flex: 1 },

  metaStrip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgElevated, borderRadius: 10,
    padding: 10, marginBottom: 14,
  },
  metaItem: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 10, color: Colors.textTertiary, marginBottom: 3 },
  metaValue: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  metaDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  progressWrap: { marginBottom: 12 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.bgElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  progressTxt: { color: Colors.textTertiary, fontSize: 11, marginTop: 6 },

  stageTrack: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  stageSegment: { flexDirection: 'row', alignItems: 'center' },
  stageDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stageDotActive: { backgroundColor: Colors.gold, borderWidth: 2, borderColor: Colors.gold + '44' },
  stageDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.bgPrimary },
  stageLine: { flex: 1, height: 2, backgroundColor: Colors.border },
  stageLineActive: { backgroundColor: Colors.gold },
  stageLabelRow: { flexDirection: 'row', marginBottom: 10 },
  stageLabel: { flex: 1, fontSize: 9, color: Colors.textTertiary, textAlign: 'left' },
  stageLabelActive: { color: Colors.gold, fontWeight: '700' },

  pendingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.warningSubtle, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12,
  },
  pendingTxt: { fontSize: 11, color: Colors.warning, fontWeight: '600' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.borderSubtle, paddingTop: 12,
  },
  lawyerRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  lawyerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A3342' },
  lawyerInitials: { color: '#fff', fontSize: 12, fontWeight: '800' },
  lawyerName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  lawyerOnlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  lawyerOnlineTxt: { fontSize: 10, color: Colors.textTertiary },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primarySubtle, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  viewBtnTxt: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 4,
  },
  emptyBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

// ─── New Case Form Styles ─────────────────────────────────────────────────────
const f = StyleSheet.create({
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  sheetSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },

  label: { fontSize: 11, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  fieldWrap: { marginBottom: 14 },
  input: {
    backgroundColor: Colors.bgElevated, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.textPrimary,
  },
  inputError: { borderColor: Colors.danger },
  inputBox: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBoxPlaceholder: { color: Colors.textTertiary, fontSize: 14 },
  inputBoxValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  segmentBtnActive: { backgroundColor: Colors.primarySubtle },
  segmentTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  segmentTxtActive: { color: Colors.primary, fontWeight: '700' },
  externalWrap: { marginBottom: 12 },
  assignedTick: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.successSubtle,
    marginBottom: 8,
  },
  assignedTickTxt: { color: Colors.success, fontSize: 12, fontWeight: '700' },
  helper: { color: Colors.textSecondary, fontSize: 12, marginBottom: 8 },
  findBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  findBtnTxt: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  recommendWrap: { gap: 8, marginBottom: 12 },
  recommendCard: {
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  recommendCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  recommendName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  recommendMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  statePickerWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.bgElevated,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  stateList: { maxHeight: 220 },
  stateRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  stateRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySubtle,
  },
  stateTxt: { color: Colors.textPrimary, fontSize: 13 },
  stateTxtActive: { color: Colors.primary, fontWeight: '700' },
  noStateTxt: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', paddingVertical: 12 },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  optionChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  optionChipTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  optionChipTxtActive: { color: Colors.primary, fontWeight: '700' },
  errorTxt: { color: Colors.danger, fontSize: 12, marginBottom: 8 },
  autoFillTxt: { color: Colors.blue, fontSize: 12, marginBottom: 12 },

  catRow: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  catChipTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  catChipTxtActive: { color: Colors.primary },
  lockedHint: { color: Colors.warning, fontSize: 12, marginTop: -10, marginBottom: 10 },

  urgRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  urgChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
  },
  urgDot: { width: 7, height: 7, borderRadius: 4 },
  urgTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  submitWrap: {
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 14, height: 52,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  submitBtnDim: { opacity: 0.45 },
  submitTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  dateDoneBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dateDoneTxt: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
});
