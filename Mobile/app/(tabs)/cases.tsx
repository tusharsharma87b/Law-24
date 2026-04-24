import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { useCaseStore } from '../../store/useCaseStore';

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

const CATEGORY_ICON: Record<string, string> = {
  matrimonial: 'family-restroom',
  employment:  'work',
  criminal:    'gavel',
  property:    'home-work',
  civil:       'account-balance',
};

export default function CasesScreen() {
  const router = useRouter();
  const { cases } = useCaseStore();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
        <TouchableOpacity style={s.newBtn} activeOpacity={0.82}>
          <MaterialIcons name="add" size={16} color={Colors.primary} />
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
              onPress={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
              activeOpacity={0.8}
            >
              <View style={s.catLeft}>
                <View style={s.catIconWrap}>
                  <MaterialIcons
                    name={(CATEGORY_ICON[cat] ?? 'folder') as any}
                    size={16}
                    color={Colors.primary}
                  />
                </View>
                <Text style={s.catTitle}>
                  {CATEGORY_LABEL[cat] ?? cat} Cases
                </Text>
                <View style={s.catCount}>
                  <Text style={s.catCountTxt}>{catCases.length}</Text>
                </View>
              </View>
              <MaterialIcons
                name={expandedCategory === cat ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>

            {/* Case Cards */}
            {catCases.map((c) => {
              const u = URGENCY[(c as any).urgency] ?? URGENCY.medium;
              const caseAny = c as any;
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

                  {/* Next hearing highlight */}
                  {caseAny.nextHearing && (
                    <View style={s.hearingRow}>
                      <MaterialIcons name="event" size={13} color={Colors.primary} />
                      <Text style={s.hearingTxt}>Next hearing: <Text style={s.hearingDate}>{caseAny.nextHearing}</Text></Text>
                    </View>
                  )}

                  {/* Court + Judge */}
                  {caseAny.court && (
                    <View style={s.courtRow}>
                      <MaterialIcons name="account-balance" size={12} color={Colors.textTertiary} />
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
                      <MaterialIcons name="pending-actions" size={13} color={Colors.warning} />
                      <Text style={s.pendingTxt}>
                        {caseAny.pendingActions.length} pending {caseAny.pendingActions.length === 1 ? 'action' : 'actions'}
                      </Text>
                    </View>
                  )}

                  {/* Footer: lawyer + arrow */}
                  <View style={s.cardFooter}>
                    <View style={s.lawyerRow}>
                      <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        style={s.lawyerAvatar}
                      >
                        <Text style={s.lawyerInitials}>{c.lawyer.initials}</Text>
                      </LinearGradient>
                      <View>
                        <Text style={s.lawyerName}>{c.lawyer.name}</Text>
                        <View style={s.lawyerOnlineRow}>
                          <View style={[s.onlineDot, { backgroundColor: c.lawyer.isOnline ? Colors.success : '#6B7280' }]} />
                          <Text style={s.lawyerOnlineTxt}>{c.lawyer.isOnline ? 'Online' : 'Offline'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={s.viewBtn}>
                      <Text style={s.viewBtnTxt}>View</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
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
              <MaterialIcons name="work-outline" size={36} color={Colors.textTertiary} />
            </View>
            <Text style={s.emptyTitle}>No active cases</Text>
            <Text style={s.emptySub}>Start with NyayaAI to get guidance and create your first case</Text>
            <TouchableOpacity style={s.emptyBtn} activeOpacity={0.85}>
              <MaterialIcons name="auto-awesome" size={16} color="#fff" />
              <Text style={s.emptyBtnTxt}>Ask NyayaAI</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom padding to clear tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
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
  lawyerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
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
