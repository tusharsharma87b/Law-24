/**
 * Department Screen � shows subcategories (as layman problem cards),
 * recommended lawyers, and quick-start actions.
 * Accessed via: Home ? tap a department card ? this screen
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { LEGAL_DEPARTMENTS, getDepartment, type LegalSubcategory } from '../../constants/legalDepartments';
import { DIRECTORY_LAWYERS } from '../../constants/lawyersDirectory';

const URGENCY_CFG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: Colors.danger,  bg: Colors.dangerSubtle,  label: 'URGENT' },
  high:     { color: Colors.warning, bg: Colors.warningSubtle, label: 'HIGH' },
  medium:   { color: Colors.blue,    bg: Colors.blueSubtle,    label: 'MEDIUM' },
  low:      { color: Colors.success, bg: Colors.successSubtle, label: 'ROUTINE' },
};

export default function DepartmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dept = getDepartment(id ?? '');

  const [selectedSub, setSelectedSub] = useState<LegalSubcategory | null>(null);

  // Filter lawyers by department's legal categories
  const matchedLawyers = useMemo(() => {
    if (!dept) return [];
    const cats = new Set(dept.subcategories.map((s) => s.lawyerCategory));
    return DIRECTORY_LAWYERS.filter((l) => {
      const specialization = (l.specialization ?? '').toLowerCase();
      if (!specialization) return false;
      return (
        dept.subcategories.some((s) =>
          specialization.includes(s.lawyerCategory) ||
          s.lawyerCategory.includes(specialization.split(' ')[0] ?? '')
        ) ||
        cats.has(specialization.split(' ')[0] ?? '')
      );
    }).slice(0, 4);
  }, [dept]);

  if (!dept) {
    return (
      <View style={s.root}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.notFound}>
          <Text style={s.notFoundTxt}>Department not found</Text>
        </View>
      </View>
    );
  }

  const handleSubcategoryTap = (sub: LegalSubcategory) => {
    setSelectedSub(selectedSub?.id === sub.id ? null : sub);
  };

  const handleTalkToLawyer = (sub?: LegalSubcategory) => {
    const cat = sub?.lawyerCategory ?? dept.subcategories[0]?.lawyerCategory ?? 'civil';
    router.push({ pathname: '/(tabs)/lawyers', params: { category: cat } });
  };

  const handleAskAI = (sub?: LegalSubcategory) => {
    const query = sub?.problem ?? `Help with ${dept.name}`;
    router.push({ pathname: '/nyaya', params: { query } });
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{dept.name}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* -- Department hero -- */}
        <LinearGradient
          colors={[dept.color + '22', dept.color + '06']}
          style={[s.heroCard, { borderColor: dept.color + '40' }]}
        >
          <View style={[s.heroIconWrap, { backgroundColor: dept.color + '22' }]}>
            <MaterialIcons name={dept.icon as any} size={28} color={dept.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>{dept.name}</Text>
            <Text style={s.heroSub}>{dept.tagline}</Text>
          </View>
        </LinearGradient>

        {/* -- Quick actions -- */}
        <View style={s.quickRow}>
          <TouchableOpacity style={s.quickBtn} onPress={() => handleTalkToLawyer()} activeOpacity={0.85}>
            <MaterialIcons name="people" size={16} color="#fff" />
            <Text style={s.quickBtnTxt}>Find a Lawyer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, s.quickBtnAI]} onPress={() => handleAskAI()} activeOpacity={0.85}>
            <MaterialIcons name="auto-awesome" size={16} color={Colors.gold} />
            <Text style={[s.quickBtnTxt, { color: Colors.gold }]}>Ask NyayaAI</Text>
          </TouchableOpacity>
        </View>

        {/* -- Subcategories (Problems) -- */}
        <Text style={s.sectionLabel}>WHAT IS YOUR PROBLEM?</Text>
        <Text style={s.sectionSub}>Tap to see options � use plain language, no legal knowledge needed</Text>

        {dept.subcategories.map((sub) => {
          const urg = URGENCY_CFG[sub.urgency] ?? URGENCY_CFG.medium;
          const isSelected = selectedSub?.id === sub.id;
          return (
            <View key={sub.id}>
              <TouchableOpacity
                style={[s.subCard, isSelected && { borderColor: dept.color, borderWidth: 2 }]}
                onPress={() => handleSubcategoryTap(sub)}
                activeOpacity={0.86}
              >
                {/* Left: icon */}
                <View style={[s.subIconWrap, { backgroundColor: dept.color + '1A' }]}>
                  <MaterialIcons name={sub.icon as any} size={20} color={dept.color} />
                </View>

                {/* Centre: problem + legal tag */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.subProblem}>{sub.problem}</Text>
                  <Text style={s.subLegal} numberOfLines={1}>{sub.legalTitle}</Text>
                  <Text style={s.subTimeline}>? Typical: {sub.timeline}</Text>
                </View>

                {/* Right: urgency badge */}
                <View style={[s.urgBadge, { backgroundColor: urg.bg }]}>
                  <Text style={[s.urgTxt, { color: urg.color }]}>{urg.label}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded action panel */}
              {isSelected && (
                <View style={[s.expandedPanel, { borderColor: dept.color + '30' }]}>
                  {/* Acts */}
                  <View style={s.actsRow}>
                    {sub.acts.map((act) => (
                      <View key={act} style={s.actChip}>
                        <Text style={s.actTxt} numberOfLines={1}>{act}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={s.caseTypeRow}>
                    <Text style={s.caseTypeLabel}>Case type: </Text>
                    <Text style={s.caseTypeTxt}>{sub.caseType}</Text>
                  </Text>

                  {/* CTA row */}
                  <View style={s.expandedCtas}>
                    <TouchableOpacity
                      style={[s.ctaBtn, { backgroundColor: dept.color }]}
                      onPress={() => handleTalkToLawyer(sub)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="people" size={14} color="#fff" />
                      <Text style={s.ctaBtnTxt}>Talk to Lawyer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.ctaBtnGhost}
                      onPress={() => handleAskAI(sub)}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="auto-awesome" size={14} color={Colors.gold} />
                      <Text style={[s.ctaBtnTxt, { color: Colors.gold }]}>Ask AI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.ctaBtnGhost}
                      onPress={() => router.push('/(tabs)/cases')}
                      activeOpacity={0.85}
                    >
                      <MaterialIcons name="folder-open" size={14} color={Colors.primary} />
                      <Text style={[s.ctaBtnTxt, { color: Colors.primary }]}>My Cases</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* -- Recommended lawyers -- */}
        {matchedLawyers.length > 0 && (
          <View style={s.lawyersSection}>
            <View style={s.lawyersSectionHeader}>
              <Text style={s.sectionLabel}>RECOMMENDED LAWYERS</Text>
              <TouchableOpacity onPress={() => handleTalkToLawyer()} activeOpacity={0.8}>
                <Text style={s.seeAllTxt}>See all ?</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.sectionSub}>Verified lawyers specialising in {dept.name}</Text>
            {matchedLawyers.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={s.lawyerCard}
                onPress={() => router.push({ pathname: '/lawyer/[id]', params: { id: l.profileId } } as any)}
                activeOpacity={0.86}
              >
                <LinearGradient colors={['#4F46E5', '#7C3AED']} style={s.lawyerAvatar}>
                  <Text style={s.lawyerInitials}>{l.initials}</Text>
                </LinearGradient>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.lawyerNameRow}>
                    <Text style={s.lawyerName} numberOfLines={1}>{l.name}</Text>
                    {l.verified && <MaterialIcons name="verified" size={13} color={Colors.primary} />}
                  </View>
                  <Text style={s.lawyerSpec} numberOfLines={1}>{l.specialization}</Text>
                  <View style={s.lawyerMeta}>
                    <MaterialIcons name="star" size={12} color={Colors.gold} />
                    <Text style={s.lawyerRating}>{l.rating}</Text>
                    <View style={s.metaDot} />
                    <Text style={s.lawyerExp}>{l.experience} yrs</Text>
                    <View style={s.metaDot} />
                    <Text style={s.lawyerPrice}>?{l.pricePerMin}/min</Text>
                  </View>
                </View>
                <View style={[s.onlineTag, { backgroundColor: l.online ? Colors.successSubtle : Colors.bgElevated }]}>
                  <View style={[s.onlineDot, { backgroundColor: l.online ? Colors.success : '#6B7280' }]} />
                  <Text style={[s.onlineTxt, { color: l.online ? Colors.success : '#6B7280' }]}>
                    {l.online ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* -- Other departments quick nav -- */}
        <Text style={[s.sectionLabel, { marginTop: 10 }]}>OTHER DEPARTMENTS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.deptRow}>
          {LEGAL_DEPARTMENTS.filter((d) => d.id !== dept.id).map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[s.deptChip, { borderColor: d.color + '44' }]}
              onPress={() => router.push({ pathname: '/department/[id]', params: { id: d.id } })}
              activeOpacity={0.8}
            >
              <MaterialIcons name={d.icon as any} size={14} color={d.color} />
              <Text style={[s.deptChipTxt, { color: d.color }]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bgPrimary },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundTxt: { color: Colors.textSecondary },

  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 18, padding: 16, marginBottom: 16,
    borderWidth: 1,
  },
  heroIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroTitle:  { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  heroSub:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: Colors.primary, borderRadius: 14, height: 46,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  quickBtnAI: { backgroundColor: Colors.goldSubtle, borderWidth: 1.5, borderColor: Colors.gold, shadowColor: 'transparent', elevation: 0 },
  quickBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.textTertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 },
  sectionSub:   { fontSize: 12, color: Colors.textSecondary, marginBottom: 14 },

  // Subcategory cards
  subCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 14,
    marginBottom: 2, borderWidth: 1, borderColor: Colors.border,
  },
  subIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  subProblem: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  subLegal:   { fontSize: 11, color: Colors.textSecondary },
  subTimeline:{ fontSize: 10, color: Colors.textTertiary, marginTop: 4 },
  urgBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0, marginTop: 2 },
  urgTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  // Expanded panel
  expandedPanel: {
    backgroundColor: Colors.bgElevated, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, gap: 10, marginTop: 1,
  },
  actsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  actChip: { backgroundColor: Colors.bgSecondary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.border },
  actTxt: { fontSize: 11, color: Colors.textSecondary },
  caseTypeRow: { fontSize: 12 },
  caseTypeLabel: { color: Colors.textTertiary },
  caseTypeTxt: { color: Colors.primary, fontWeight: '700' },
  expandedCtas: { flexDirection: 'row', gap: 8 },
  ctaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 10, height: 38,
  },
  ctaBtnGhost: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 10, height: 38,
    backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border,
  },
  ctaBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Lawyers section
  lawyersSection: { marginTop: 16 },
  lawyersSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  seeAllTxt: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  lawyerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 13,
    marginTop: 8, borderWidth: 1, borderColor: Colors.border,
  },
  lawyerAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  lawyerInitials: { color: '#fff', fontSize: 14, fontWeight: '800' },
  lawyerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lawyerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  lawyerSpec: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  lawyerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  lawyerRating: { fontSize: 11, fontWeight: '700', color: Colors.gold },
  lawyerExp: { fontSize: 11, color: Colors.textTertiary },
  lawyerPrice: { fontSize: 11, fontWeight: '700', color: Colors.success },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  onlineTag: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineTxt: { fontSize: 10, fontWeight: '700' },

  // Other departments
  deptRow: { flexDirection: 'row', gap: 8, paddingBottom: 4, marginTop: 10 },
  deptChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.bgSecondary, borderWidth: 1,
  },
  deptChipTxt: { fontSize: 12, fontWeight: '600' },
});
