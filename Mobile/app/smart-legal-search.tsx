import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { mockAIResponse } from '../utils/mockAI';

type AiAnalyzeResponse = {
  featuredAnswer: string;
  caseTypes: string[];
  explanation: string;
  solutionSteps?: string[];
  legalSections: {
    title: string;
    description: string;
  }[];
  recommendedLawyers: {
    id?: string;
    name: string;
    specialization?: string;
    rating: number;
    city: string;
  }[];
  relatedSearches: string[];
};

export default function SmartLegalSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; ai?: string }>();
  const query = typeof params.q === 'string' ? params.q : '';

  const ai = useMemo<AiAnalyzeResponse | null>(() => {
    if (typeof params.ai !== 'string' || !params.ai) return null;
    try {
      return JSON.parse(params.ai) as AiAnalyzeResponse;
    } catch {
      return null;
    }
  }, [params.ai]);

  if (!ai) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.topTitle}>Smart legal search</Text>
        </View>
        <View style={s.emptyWrap}>
          <Text style={s.emptyTitle}>No results found. Try a different query.</Text>
          <Text style={s.emptySub}>Please go back and submit another search.</Text>
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
          <Text style={s.topTitle}>Smart legal search</Text>
          <Text style={s.queryEcho} numberOfLines={2}>“{query}”</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.sectionLabel}>Featured Answer</Text>
          <Text style={s.body}>{ai.featuredAnswer}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.sectionLabel}>Case Types</Text>
          <View style={s.chipRow}>
            {ai.caseTypes.map((t) => (
              <View key={t} style={s.chip}>
                <Text style={s.chipTxt}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionLabel}>Explanation</Text>
          <Text style={s.body}>{ai.explanation}</Text>
        </View>

        {Array.isArray(ai.solutionSteps) && ai.solutionSteps.length > 0 && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>What You Should Do (Step-by-step)</Text>
            {ai.solutionSteps.map((step, idx) => (
              <View key={`${step}-${idx}`} style={s.stepRow}>
                <View style={s.stepNumWrap}>
                  <Text style={s.stepNum}>{idx + 1}</Text>
                </View>
                <Text style={s.stepTxt}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.sectionLabel}>Legal Sections</Text>
          {ai.legalSections.map((law) => (
            <View key={law.title} style={s.lawBlock}>
              <Text style={s.lawTitle}>{law.title}</Text>
              <Text style={s.lawDesc}>{law.description}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.sectionLabel}>Recommended Lawyers</Text>
          {ai.recommendedLawyers.map((lawyer) => (
            <View key={lawyer.id} style={s.lawyerRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.lawyerName}>{lawyer.name}</Text>
                <Text style={s.lawyerMeta}>
                  {lawyer.specialization ? `${lawyer.specialization} · ` : ''}★{lawyer.rating} · {lawyer.city}
                </Text>
              </View>
              <TouchableOpacity
                style={s.consultBtn}
                onPress={() => router.push('/(tabs)/lawyers')}
                activeOpacity={0.85}
              >
                <Text style={s.consultTxt}>Consult</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.sectionLabel}>Related Searches</Text>
          {ai.relatedSearches.map((r) => (
            <TouchableOpacity
              key={r}
              style={s.relatedRow}
              onPress={() =>
                router.replace({
                  pathname: '/smart-legal-search',
                  params: {
                    q: r,
                    ai: JSON.stringify(mockAIResponse(r)),
                  },
                } as any)
              }
              activeOpacity={0.8}
            >
              <MaterialIcons name="subdirectory-arrow-right" size={18} color={Colors.primary} />
              <Text style={s.relatedTxt}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.textTertiary, marginBottom: 8, letterSpacing: 0.6 },
  body: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipTxt: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  lawBlock: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: 8,
  },
  lawTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  lawDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 3, lineHeight: 18 },
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
  lawyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  lawyerName: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  lawyerMeta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  consultBtn: {
    borderRadius: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  consultTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  relatedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  relatedTxt: { color: Colors.primary, fontSize: 13, fontWeight: '600', flex: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  emptySub: { color: Colors.textSecondary, fontSize: 13 },
});
