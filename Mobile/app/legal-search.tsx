import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { resolveSearchIntent } from '../constants/searchIntentMap';
import {
  buildSmartLegalSearchResult,
  type SearchUiLang,
  type SmartLegalSearchResult,
} from '../constants/smartLegalSearch';
import type { NoticeTemplateId } from '../constants/nyayaLegalNotices';

const DIR_FROM_CASE: Record<string, string> = {
  employment: 'employment',
  matrimonial: 'family',
  property: 'property',
  criminal: 'criminal',
  consumer: 'consumer',
  general: 'civil',
};

function useQueryParam(): string {
  const { q } = useLocalSearchParams<{ q?: string }>();
  if (typeof q === 'string') return q.trim();
  if (Array.isArray(q)) return (q[0] ?? '').trim();
  return '';
}

export default function LegalSearchScreen() {
  const router = useRouter();
  const rawQ = useQueryParam();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SmartLegalSearchResult | null>(null);
  const [uiLang, setUiLang] = useState<SearchUiLang>('en');

  useEffect(() => {
    if (!rawQ) {
      setLoading(false);
      setResult(null);
      return;
    }
    setLoading(true);
    setResult(null);
    const t = setTimeout(() => {
      const r = buildSmartLegalSearchResult(rawQ);
      setResult(r);
      setUiLang(r.detectedLang === 'hi' ? 'hi' : 'en');
      setLoading(false);
    }, 420);
    return () => clearTimeout(t);
  }, [rawQ]);

  const lawyerCategory = useMemo(() => {
    if (!result) return undefined;
    const fromIntent = resolveSearchIntent(result.query);
    if (fromIntent) return fromIntent;
    return DIR_FROM_CASE[result.intel.case_type_key] as any;
  }, [result]);

  const openNotice = () => {
    if (!result?.noticeTemplateId) return;
    router.push({
      pathname: '/nyaya-notice',
      params: { templateId: result.noticeTemplateId as NoticeTemplateId },
    } as any);
  };

  const onRelated = (text: string) => {
    router.replace({ pathname: '/legal-search', params: { q: text } } as any);
  };

  if (!rawQ) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>Legal search</Text>
        </View>
        <View style={s.emptyWrap}>
          <MaterialIcons name="travel-explore" size={48} color={Colors.textTertiary} />
          <Text style={s.emptyTitle}>Ask anything legal</Text>
          <Text style={s.emptySub}>Go back to home and type your issue in Hindi or English.</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={s.primaryBtnTxt}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.topTitle} numberOfLines={1}>
            Smart legal search
          </Text>
          <Text style={s.queryEcho} numberOfLines={2}>
            �{rawQ}�
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={s.loadingTxt}>Understanding your issue�</Text>
        </View>
      ) : result ? (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.card}>
            <View style={s.cardHead}>
              <MaterialIcons name="stars" size={20} color={Colors.gold} />
              <Text style={s.cardHeadTxt}>Featured answer</Text>
            </View>
            <Text style={s.snippet}>{uiLang === 'hi' ? result.featuredHi : result.featuredEn}</Text>
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Case types</Text>
            <View style={s.chipRow}>
              {result.caseTypes.map((c) => (
                <View key={c.key + c.label} style={s.typeChip}>
                  <Text style={s.typeChipTxt}>{c.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <View style={s.langRow}>
              <Text style={s.sectionLabel}>Explanation</Text>
              <View style={s.langToggle}>
                <TouchableOpacity
                  style={[s.langBtn, uiLang === 'en' && s.langBtnOn]}
                  onPress={() => setUiLang('en')}
                  activeOpacity={0.85}
                >
                  <Text style={[s.langBtnTxt, uiLang === 'en' && s.langBtnTxtOn]}>English</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.langBtn, uiLang === 'hi' && s.langBtnOn]}
                  onPress={() => setUiLang('hi')}
                  activeOpacity={0.85}
                >
                  <Text style={[s.langBtnTxt, uiLang === 'hi' && s.langBtnTxtOn]}>?????</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={s.body}>{uiLang === 'hi' ? result.explanationHi : result.explanationEn}</Text>
            {result.detectedLang === 'mixed' ? (
              <Text style={s.detected}>Detected: mixed Hindi�English input</Text>
            ) : null}
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Legal sections (India)</Text>
            {result.legalSections.map((law, i) => (
              <View key={i} style={s.lawBlock}>
                <Text style={s.lawTitle}>{law.act}</Text>
                <Text style={s.lawSub}>{law.plainEnglish}</Text>
              </View>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Steps to take</Text>
            {result.steps.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNumWrap}>
                  <Text style={s.stepNum}>{i + 1}</Text>
                </View>
                <Text style={s.stepTxt}>{step}</Text>
              </View>
            ))}
          </View>

          {result.noticeTemplateId ? (
            <TouchableOpacity style={s.noticeCta} onPress={openNotice} activeOpacity={0.85}>
              <MaterialIcons name="description" size={22} color={Colors.gold} />
              <Text style={s.noticeCtaTxt}>Generate legal notice</Text>
              <MaterialIcons name="chevron-right" size={22} color={Colors.gold} />
            </TouchableOpacity>
          ) : null}

          <View style={s.card}>
            <Text style={s.sectionLabel}>Lawyers for this issue</Text>
            {result.lawyers.map((law) => (
              <View key={law.id} style={s.lawyerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.lawyerName}>{law.name}</Text>
                  <Text style={s.lawyerMeta}>
                    {law.tier} � ?{law.rating.toFixed(1)} � {law.city}
                  </Text>
                  <Text style={s.lawyerSpec}>{law.specialization}</Text>
                </View>
                <TouchableOpacity
                  style={s.consultMini}
                  onPress={() => router.push({ pathname: '/lawyer/[id]', params: { id: law.id } } as any)}
                  activeOpacity={0.85}
                >
                  <Text style={s.consultMiniTxt}>Consult</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={s.card}>
            <Text style={s.sectionLabel}>Related searches</Text>
            {result.relatedQueries.map((rel) => (
              <TouchableOpacity key={rel} style={s.relatedRow} onPress={() => onRelated(rel)} activeOpacity={0.8}>
                <MaterialIcons name="subdirectory-arrow-right" size={18} color={Colors.primary} />
                <Text style={s.relatedTxt}>{rel}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.actions}>
            <TouchableOpacity
              style={s.actionPrimary}
              onPress={() => router.push({ pathname: '/(tabs)/cases', params: { openNew: '1' } } as any)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="create-new-folder" size={20} color="#fff" />
              <Text style={s.actionPrimaryTxt}>Start case</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionSecondary}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/lawyers',
                  params: lawyerCategory ? { category: lawyerCategory } : {},
                } as any)
              }
              activeOpacity={0.85}
            >
              <MaterialIcons name="support-agent" size={20} color={Colors.primary} />
              <Text style={s.actionSecondaryTxt}>Talk to lawyer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionSecondary}
              onPress={() =>
                router.push({
                  pathname: '/nyaya',
                  params: { prefilledQuestion: `Follow-up on: ${result.query}. Please go deeper on remedies and documents.` },
                } as any)
              }
              activeOpacity={0.85}
            >
              <MaterialIcons name="chat" size={20} color={Colors.primary} />
              <Text style={s.actionSecondaryTxt}>Ask follow-up</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.disclaimer}>{result.intel.disclaimer}</Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      ) : (
        <View style={s.emptyWrap}>
          <Text style={s.emptyTitle}>Could not build results</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.back()}>
            <Text style={s.primaryBtnTxt}>Go back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 4,
  },
  backBtn: { padding: 8 },
  topTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  queryEcho: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingTxt: { color: Colors.textSecondary, fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardHeadTxt: { fontSize: 12, fontWeight: '800', color: Colors.gold, letterSpacing: 0.5 },
  snippet: { fontSize: 14, color: Colors.textPrimary, lineHeight: 22, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 0.6, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipTxt: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  langToggle: { flexDirection: 'row', backgroundColor: Colors.bgElevated, borderRadius: 10, padding: 2 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  langBtnOn: { backgroundColor: Colors.primary },
  langBtnTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  langBtnTxtOn: { color: '#fff' },
  body: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },
  detected: { fontSize: 11, color: Colors.textTertiary, marginTop: 8, fontStyle: 'italic' },
  lawBlock: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  lawTitle: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  lawSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  stepRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'flex-start' },
  stepNumWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  stepTxt: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  noticeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.gold + '55',
    backgroundColor: Colors.goldSubtle,
  },
  noticeCtaTxt: { color: Colors.gold, fontSize: 15, fontWeight: '800' },
  lawyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: 10,
  },
  lawyerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  lawyerMeta: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  lawyerSpec: { fontSize: 11, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  consultMini: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  consultMiniTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  relatedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  relatedTxt: { flex: 1, fontSize: 13, color: Colors.primary, fontWeight: '600' },
  actions: { gap: 10, marginTop: 4 },
  actionPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  actionPrimaryTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  actionSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.bgSecondary,
  },
  actionSecondaryTxt: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
  disclaimer: { fontSize: 10, color: Colors.textTertiary, fontStyle: 'italic', lineHeight: 16, marginTop: 8 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  primaryBtn: { marginTop: 12, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
