import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LegalInsightScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const router = useRouter();

  const insight = useMemo(() => ({
    title: query,
    summary: `Based on Indian law, here's what applies to your situation regarding "${query}".`,
    sections: [
      {
        title: "What it means",
        content: `In simple terms, ${query} refers to the legal recognition of specific rights and obligations defined under the relevant Indian statutes.`,
        icon: "info-outline",
        color: Colors.primary
      },
      {
        title: "Applicable Law",
        content: "Relevant IPC / CrPC sections and judicial precedents that govern this specific legal issue in the Indian judiciary.",
        icon: "gavel",
        color: Colors.gold
      },
      {
        title: "What you should do",
        content: "1. Document all evidence.\n2. Consult a specialized advocate.\n3. Avoid making public statements about the case.",
        icon: "play-circle-outline",
        color: "#10B981"
      },
      {
        title: "Documents required",
        content: "Identification proof, relevant contracts, correspondence (emails/letters), and any formal notices received.",
        icon: "description",
        color: "#6366F1"
      },
      {
        title: "Risks",
        content: "Time-barred limitations, potential civil/criminal liabilities, and legal costs associated with prolonged litigation.",
        icon: "warning",
        color: "#EF4444"
      },
    ],
  }), [query]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Legal Insight</Text>
      </View>

      <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.queryCard}>
          <Text style={s.queryLabel}>LEGAL ANALYSIS FOR</Text>
          <Text style={s.queryTitle}>{insight.title}</Text>
          <Text style={s.info}>
            Follow the steps below or consult a lawyer for faster resolution.
          </Text>
        </View>

        <Text style={s.description}>
          {insight.summary}
        </Text>

        {insight.sections.map((section, idx) => (
          <View key={idx} style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIconBox, { backgroundColor: section.color + '15' }]}>
                <MaterialIcons name={section.icon as any} size={18} color={section.color} />
              </View>
              <Text style={s.cardTitle}>{section.title}</Text>
            </View>
            <Text style={s.cardText}>{section.content}</Text>
          </View>
        ))}

        <View style={s.ctaSection}>
          <Text style={s.ctaHeading}>CHOOSE NEXT STEP</Text>
          
          <TouchableOpacity 
            style={s.aiBtn} 
            onPress={() => router.push({ pathname: '/nyaya', params: { query, autoSend: '1' } })}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#3730A3']}
              style={s.btnGradient}
            >
              <MaterialIcons name="auto-awesome" size={22} color="#fff" />
              <View>
                <Text style={s.btnTitle}>Ask Nyaya AI</Text>
                <Text style={s.btnSub}>Detailed AI research & IPC analysis</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.lawyerBtn} 
            onPress={() => router.push('/(tabs)/lawyers')}
            activeOpacity={0.8}
          >
            <View style={[s.btnIconBox, { backgroundColor: 'rgba(79,110,247,0.1)' }]}>
              <MaterialIcons name="people" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={s.btnTitleDark}>Consult Lawyer</Text>
              <Text style={s.btnSubDark}>Talk to a verified expert now</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  queryCard: { 
    backgroundColor: Colors.bgSecondary, 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  queryLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1, marginBottom: 8 },
  queryTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  info: { fontSize: 13, color: Colors.gold, fontWeight: '500' },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24, paddingHorizontal: 4 },
  card: { 
    backgroundColor: '#1E293B', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cardIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cardText: { fontSize: 14, color: '#CBD5E1', lineHeight: 22 },
  ctaSection: { gap: 16, marginTop: 20 },
  ctaHeading: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 1, marginBottom: 4 },
  aiBtn: { borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  btnTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  btnSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  btnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lawyerBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnTitleDark: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  btnSubDark: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
