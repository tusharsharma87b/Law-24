import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_CASES } from '../../constants/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type CaseData = typeof MOCK_CASES[0];
type Document = { id: string; name: string; category: 'court' | 'personal' | 'evidence'; uploadedBy: string; date: string; size: string };
type TimelineEvent = { id: string; date: string; time: string; type: 'urgent' | 'done' | 'info' | 'action'; title: string; desc: string; action?: string; people: string[] };
type PendingAction = { id: string; task: string; due: string; priority: 'critical' | 'high' | 'medium' };

const TABS = ['Overview', 'Timeline', 'Documents', 'AI Chat', 'Lawyer'];

const URGENCY_CFG: Record<string, { color: string; bg: string }> = {
  critical: { color: Colors.danger,  bg: Colors.dangerSubtle },
  high:     { color: Colors.warning, bg: Colors.warningSubtle },
  medium:   { color: Colors.blue,    bg: Colors.blueSubtle },
  low:      { color: Colors.success, bg: Colors.successSubtle },
};

const DOT_COLOR: Record<string, string> = {
  urgent: Colors.danger, done: Colors.success, info: Colors.primary, action: Colors.gold,
};

const DOC_CAT_ICON: Record<string, string> = {
  court: 'account-balance', personal: 'person', evidence: 'find-in-page',
};

const DOC_CAT_COLOR: Record<string, string> = {
  court: Colors.primary, personal: Colors.gold, evidence: Colors.success,
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ caseData }: { caseData: CaseData }) {
  const c = caseData as any;
  const urg = URGENCY_CFG[caseData.urgency] ?? URGENCY_CFG.medium;

  return (
    <View style={ov.root}>

      {/* ── Next hearing highlight ── */}
      {c.nextHearing && (
        <LinearGradient colors={['rgba(59,91,219,0.15)', 'rgba(59,91,219,0.05)']} style={ov.hearingCard}>
          <View style={ov.hearingLeft}>
            <MaterialIcons name="event" size={20} color={Colors.primary} />
            <View>
              <Text style={ov.hearingLabel}>Next Hearing</Text>
              <Text style={ov.hearingDate}>{c.nextHearing}</Text>
            </View>
          </View>
          <TouchableOpacity style={ov.reminderBtn} activeOpacity={0.8}>
            <MaterialIcons name="notifications-active" size={14} color={Colors.primary} />
            <Text style={ov.reminderTxt}>Remind me</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* ── Stats 2×2 grid ── */}
      <View style={ov.statsGrid}>
        {[
          { v: `${caseData.successProbability}%`, l: 'Win Probability', icon: 'emoji-events', color: Colors.gold },
          { v: caseData.stage, l: 'Current Stage', icon: 'timeline', color: Colors.primary },
          { v: c.caseNumber ?? 'N/A', l: 'Case No.', icon: 'folder', color: Colors.success },
          { v: c.filedDate ?? 'N/A', l: 'Filed On', icon: 'calendar-today', color: Colors.blue },
        ].map((st) => (
          <View key={st.l} style={ov.statCard}>
            <View style={[ov.statIcon, { backgroundColor: st.color + '1A' }]}>
              <MaterialIcons name={st.icon as any} size={16} color={st.color} />
            </View>
            <Text style={ov.statVal} numberOfLines={2}>{st.v}</Text>
            <Text style={ov.statLbl}>{st.l}</Text>
          </View>
        ))}
      </View>

      {/* ── Court & Judge ── */}
      {c.court && (
        <View style={ov.courtCard}>
          <View style={ov.courtRow}>
            <MaterialIcons name="account-balance" size={15} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={ov.courtLabel}>Court</Text>
              <Text style={ov.courtValue}>{c.court}</Text>
            </View>
          </View>
          {c.judge && (
            <View style={[ov.courtRow, { marginTop: 8 }]}>
              <MaterialIcons name="person-outline" size={15} color={Colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={ov.courtLabel}>Presiding Judge</Text>
                <Text style={ov.courtValue}>{c.judge}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Pending Actions ── */}
      {c.pendingActions?.length > 0 && (
        <View style={ov.section}>
          <View style={ov.sectionHeader}>
            <MaterialIcons name="pending-actions" size={16} color={Colors.warning} />
            <Text style={ov.sectionTitle}>Pending Actions</Text>
            <View style={ov.badge}>
              <Text style={ov.badgeTxt}>{c.pendingActions.length}</Text>
            </View>
          </View>
          {(c.pendingActions as PendingAction[]).map((pa) => {
            const pCfg = URGENCY_CFG[pa.priority] ?? URGENCY_CFG.medium;
            return (
              <View key={pa.id} style={ov.actionItem}>
                <View style={[ov.actionDot, { backgroundColor: pCfg.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={ov.actionTask}>{pa.task}</Text>
                  <Text style={ov.actionDue}>Due: {pa.due}</Text>
                </View>
                <View style={[ov.priorityTag, { backgroundColor: pCfg.bg }]}>
                  <Text style={[ov.priorityTxt, { color: pCfg.color }]}>
                    {pa.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── AI Strategy ── */}
      <View style={ov.aiCard}>
        <View style={ov.aiHeader}>
          <MaterialIcons name="auto-awesome" size={18} color={Colors.gold} />
          <Text style={ov.aiTitle}>NyayaAI Strategy</Text>
        </View>
        <Text style={ov.aiText}>{caseData.aiStrategy}</Text>
        {c.aiSteps && (
          <View style={ov.stepsBlock}>
            {(c.aiSteps as string[]).map((step, i) => (
              <View key={i} style={ov.stepRow}>
                <View style={ov.stepNum}><Text style={ov.stepNumTxt}>{i + 1}</Text></View>
                <Text style={ov.stepTxt}>{step.replace(/^\d+\.\s*/, '')}</Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity style={ov.aiCta} activeOpacity={0.85}>
          <MaterialIcons name="chat" size={14} color={Colors.primary} />
          <Text style={ov.aiCtaTxt}>Ask AI follow-up</Text>
        </TouchableOpacity>
      </View>

      {/* ── Similar Cases (Premium Insight) ── */}
      {c.similarCases?.length > 0 && (
        <View style={ov.section}>
          <View style={ov.sectionHeader}>
            <MaterialIcons name="insights" size={16} color={Colors.gold} />
            <Text style={ov.sectionTitle}>Similar Case Outcomes</Text>
          </View>
          <View style={ov.similarRow}>
            {(c.similarCases as { result: string; probability: string; note: string }[]).map((sc, i) => (
              <View key={i} style={[ov.similarCard, { borderColor: sc.result === 'Won' ? Colors.success : Colors.gold }]}>
                <View style={[ov.similarResultPill, { backgroundColor: sc.result === 'Won' ? Colors.successSubtle : Colors.goldSubtle }]}>
                  <Text style={[ov.similarResult, { color: sc.result === 'Won' ? Colors.success : Colors.gold }]}>{sc.result}</Text>
                </View>
                <Text style={ov.similarProb}>{sc.probability}</Text>
                <Text style={ov.similarNote}>{sc.note}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Quick Actions ── */}
      <View style={ov.quickGrid}>
        {[
          { icon: 'upload-file', label: 'Add Docs', sub: `${c.documents?.length ?? 0} uploaded`, color: Colors.primary },
          { icon: 'phone',       label: 'Call Lawyer', sub: c.lawyer?.name?.split(' ').pop() ?? 'Lawyer', color: Colors.success },
          { icon: 'folder-open', label: 'View Docs',  sub: 'All files', color: Colors.gold },
          { icon: 'edit',        label: 'Next Step',  sub: caseData.nextAction?.slice(0, 18) ?? 'Pending', color: Colors.danger },
        ].map((q) => (
          <TouchableOpacity key={q.label} style={ov.quickCard} activeOpacity={0.8}>
            <View style={[ov.quickIcon, { backgroundColor: q.color + '1A' }]}>
              <MaterialIcons name={q.icon as any} size={18} color={q.color} />
            </View>
            <Text style={ov.quickLabel}>{q.label}</Text>
            <Text style={ov.quickSub} numberOfLines={1}>{q.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
function TimelineTab({ caseData }: { caseData: CaseData }) {
  const events = ((caseData as any).timeline ?? []) as TimelineEvent[];
  return (
    <View style={tl.root}>
      {events.map((ev, idx) => (
        <View key={ev.id} style={tl.row}>
          <View style={tl.lineCol}>
            <View style={[tl.dot, { backgroundColor: DOT_COLOR[ev.type] }]}>
              <View style={tl.dotInner} />
            </View>
            {idx < events.length - 1 && <View style={tl.line} />}
          </View>
          <View style={tl.content}>
            <Text style={tl.date}>{ev.date}  ·  {ev.time}</Text>
            <View style={[tl.card, ev.type === 'urgent' && tl.urgentCard]}>
              <View style={tl.cardHeader}>
                <View style={[tl.typeDot, { backgroundColor: DOT_COLOR[ev.type] + '33' }]}>
                  <View style={[tl.typeDotInner, { backgroundColor: DOT_COLOR[ev.type] }]} />
                </View>
                <Text style={tl.title}>{ev.title}</Text>
              </View>
              <Text style={tl.desc}>{ev.desc}</Text>
              {ev.action && (
                <View style={tl.actionRow}>
                  <MaterialIcons name="schedule" size={12} color={Colors.warning} />
                  <Text style={tl.actionTxt}>{ev.action}</Text>
                </View>
              )}
              <View style={tl.peopleRow}>
                {ev.people.map((p) => (
                  <View key={p} style={tl.personChip}>
                    <MaterialIcons name="person" size={10} color={Colors.textTertiary} />
                    <Text style={tl.personTxt}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────────
function DocsTab({ caseData }: { caseData: CaseData }) {
  const [activeDocCat, setActiveDocCat] = useState<'all' | 'court' | 'personal' | 'evidence'>('all');
  const docs = ((caseData as any).documents ?? []) as Document[];
  const cats = ['all', 'court', 'personal', 'evidence'] as const;
  const filtered = activeDocCat === 'all' ? docs : docs.filter((d) => d.category === activeDocCat);

  return (
    <View style={dc.root}>
      {/* Upload buttons */}
      <View style={dc.uploadRow}>
        <TouchableOpacity style={[dc.uploadBtn, { borderColor: Colors.primary }]} activeOpacity={0.82}>
          <MaterialIcons name="upload" size={16} color={Colors.primary} />
          <Text style={[dc.uploadTxt, { color: Colors.primary }]}>Upload Document</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[dc.uploadBtn, dc.lawyerUploadBtn]} activeOpacity={0.82}>
          <MaterialIcons name="gavel" size={16} color={Colors.gold} />
          <Text style={[dc.uploadTxt, { color: Colors.gold }]}>Lawyer Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dc.catRow} style={{ marginBottom: 16 }}>
        {cats.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[dc.catChip, activeDocCat === cat && dc.catChipActive]}
            onPress={() => setActiveDocCat(cat)}
            activeOpacity={0.8}
          >
            {cat !== 'all' && (
              <MaterialIcons
                name={DOC_CAT_ICON[cat] as any}
                size={12}
                color={activeDocCat === cat ? Colors.primary : Colors.textTertiary}
              />
            )}
            <Text style={[dc.catTxt, activeDocCat === cat && dc.catTxtActive]}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Document list */}
      {filtered.map((doc) => (
        <View key={doc.id} style={dc.docCard}>
          <View style={[dc.docIcon, { backgroundColor: DOC_CAT_COLOR[doc.category] + '1A' }]}>
            <MaterialIcons
              name={DOC_CAT_ICON[doc.category] as any}
              size={20}
              color={DOC_CAT_COLOR[doc.category]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={dc.docName}>{doc.name}</Text>
            <Text style={dc.docMeta}>
              {doc.size}  ·  {doc.date}  ·  By {doc.uploadedBy === 'lawyer' ? 'Lawyer' : 'You'}
            </Text>
          </View>
          <View style={dc.docActions}>
            <TouchableOpacity hitSlop={8} style={dc.docActionBtn}>
              <MaterialIcons name="download" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {doc.uploadedBy === 'lawyer' && (
              <TouchableOpacity hitSlop={8} style={dc.docActionBtn}>
                <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={dc.empty}>
          <MaterialIcons name="folder-open" size={36} color={Colors.textTertiary} />
          <Text style={dc.emptyTxt}>No documents in this category</Text>
        </View>
      )}

      {/* Permission notice */}
      <View style={dc.permNotice}>
        <MaterialIcons name="info-outline" size={13} color={Colors.textTertiary} />
        <Text style={dc.permTxt}>If your lawyer deletes a document, you will be notified for approval</Text>
      </View>
    </View>
  );
}

// ─── AI Chat Tab ──────────────────────────────────────────────────────────────
function AIChatTab({ caseData }: { caseData: CaseData }) {
  const c = caseData as any;
  const prompts = [
    `What documents do I need for the next hearing?`,
    `What is the current strategy for my ${c.category} case?`,
    `How likely am I to win based on current evidence?`,
    `What should I do before ${c.nextHearing ?? 'the next hearing'}?`,
    'Explain my case timeline in simple terms',
  ];

  return (
    <View style={ai.root}>
      <View style={ai.header}>
        <View style={ai.avatarWrap}>
          <MaterialIcons name="auto-awesome" size={22} color={Colors.gold} />
        </View>
        <View>
          <Text style={ai.title}>NyayaAI Case Advisor</Text>
          <Text style={ai.sub}>Trained on your case context</Text>
        </View>
      </View>

      <View style={ai.strategyPreview}>
        <Text style={ai.strategyLabel}>Current strategy insight</Text>
        <Text style={ai.strategyText} numberOfLines={3}>{caseData.aiStrategy}</Text>
      </View>

      <Text style={ai.suggestLabel}>SUGGESTED QUESTIONS</Text>
      {prompts.map((p, i) => (
        <TouchableOpacity key={i} style={ai.promptBtn} activeOpacity={0.8}>
          <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.primary} />
          <Text style={ai.promptTxt}>{p}</Text>
          <MaterialIcons name="north-east" size={14} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={ai.openChatBtn} activeOpacity={0.85}>
        <LinearGradient colors={[Colors.primary, '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ai.openChatGrad}>
          <MaterialIcons name="auto-awesome" size={16} color="#fff" />
          <Text style={ai.openChatTxt}>Open Full AI Chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Lawyer Tab ───────────────────────────────────────────────────────────────
function LawyerTab({ caseData }: { caseData: CaseData }) {
  const lawyer = caseData.lawyer;
  const l = lawyer as any;
  return (
    <View style={lw.root}>
      {/* Lawyer profile card */}
      <View style={lw.profileCard}>
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={lw.avatar}>
          <Text style={lw.avatarTxt}>{l.initials ?? 'LA'}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={lw.nameRow}>
            <Text style={lw.name}>{l.name ?? 'Your Lawyer'}</Text>
            {l.verified && <MaterialIcons name="verified" size={16} color={Colors.primary} />}
          </View>
          <Text style={lw.designation} numberOfLines={1}>{l.designation ?? 'Advocate'}</Text>
          <View style={lw.metaRow}>
            <MaterialIcons name="star" size={12} color={Colors.gold} />
            <Text style={lw.rating}>{l.rating?.average ?? '—'}</Text>
            <Text style={lw.reviews}>({l.rating?.totalReviews ?? 0} reviews)</Text>
            <View style={lw.dot} />
            <Text style={lw.exp}>{l.experienceYears ?? 0} yrs exp</Text>
          </View>
          <View style={lw.onlineRow}>
            <View style={[lw.onlineDot, { backgroundColor: l.isOnline ? Colors.success : '#6B7280' }]} />
            <Text style={lw.onlineTxt}>{l.isOnline ? 'Online now' : 'Currently offline'}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={lw.statsRow}>
        {[
          { v: `${l.cases?.winRatePercent ?? '—'}%`, l: 'Win Rate' },
          { v: `${l.cases?.total ?? '—'}+`, l: 'Cases' },
          { v: `${l.experienceYears ?? '—'} yrs`, l: 'Experience' },
        ].map((st, i, arr) => (
          <React.Fragment key={st.l}>
            <View style={lw.statItem}>
              <Text style={lw.statVal}>{st.v}</Text>
              <Text style={lw.statLbl}>{st.l}</Text>
            </View>
            {i < arr.length - 1 && <View style={lw.statDiv} />}
          </React.Fragment>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={lw.ctaRow}>
        <TouchableOpacity style={lw.callBtn} activeOpacity={0.85}>
          <MaterialIcons name="phone" size={16} color="#fff" />
          <Text style={lw.callTxt}>Call Lawyer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={lw.chatBtn} activeOpacity={0.85}>
          <MaterialIcons name="chat" size={16} color={Colors.primary} />
          <Text style={lw.chatTxt}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Change lawyer */}
      <View style={lw.changeSection}>
        <Text style={lw.changeSectionTitle}>Not satisfied?</Text>
        <Text style={lw.changeSectionSub}>You can request a change of lawyer. A ticket will be raised for review.</Text>
        <TouchableOpacity style={lw.changeBtn} activeOpacity={0.82}>
          <MaterialIcons name="swap-horiz" size={16} color={Colors.warning} />
          <Text style={lw.changeBtnTxt}>Request Lawyer Change</Text>
        </TouchableOpacity>
      </View>

      {/* Specializations */}
      {l.specializations?.length > 0 && (
        <View style={lw.specsBlock}>
          <Text style={lw.specsTitle}>SPECIALIZES IN</Text>
          <View style={lw.specsRow}>
            {l.specializations.map((sp: string) => (
              <View key={sp} style={lw.specChip}>
                <Text style={lw.specTxt}>{sp}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const caseData = MOCK_CASES.find((c) => c.id === id) ?? MOCK_CASES[0];
  const c = caseData as any;
  const urg = URGENCY_CFG[caseData.urgency] ?? URGENCY_CFG.medium;

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{caseData.title}</Text>
        <TouchableOpacity style={s.moreBtn} hitSlop={10}>
          <MaterialIcons name="more-vert" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* ── Hero overview block ── */}
        <View style={s.hero}>
          {/* Chips + urgency */}
          <View style={s.topRow}>
            <View style={s.chipRow}>
              {caseData.chips.map((ch) => (
                <View key={ch} style={s.chip}><Text style={s.chipTxt}>{ch}</Text></View>
              ))}
            </View>
            <View style={[s.urgBadge, { backgroundColor: urg.bg }]}>
              <View style={[s.urgDot, { backgroundColor: urg.color }]} />
              <Text style={[s.urgTxt, { color: urg.color }]}>{caseData.urgency.toUpperCase()}</Text>
            </View>
          </View>

          {/* Stage progress */}
          <View style={s.stageTrack}>
            {caseData.stages.map((st, idx) => (
              <View key={st} style={s.stageSegment}>
                <View style={[s.stageDot, idx <= caseData.activeStageIndex && s.stageDotActive]}>
                  {idx <= caseData.activeStageIndex && <View style={s.stageDotInner} />}
                </View>
                {idx < caseData.stages.length - 1 && (
                  <View style={[s.stageLine, idx < caseData.activeStageIndex && s.stageLineActive]} />
                )}
              </View>
            ))}
          </View>
          <View style={s.stageLabelRow}>
            {caseData.stages.map((st, idx) => (
              <Text key={st} style={[s.stageLbl, idx === caseData.activeStageIndex && s.stageLblActive]} numberOfLines={1}>{st}</Text>
            ))}
          </View>
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
          {activeTab === 0 && <OverviewTab caseData={caseData as any} />}
          {activeTab === 1 && <TimelineTab caseData={caseData as any} />}
          {activeTab === 2 && <DocsTab caseData={caseData as any} />}
          {activeTab === 3 && <AIChatTab caseData={caseData as any} />}
          {activeTab === 4 && <LawyerTab caseData={caseData as any} />}
        </View>

        {/* Bottom clearance for OS chrome */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

// ─── Main Styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bgPrimary },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  moreBtn: { padding: 4, width: 32, alignItems: 'flex-end' },

  hero: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, gap: 10, backgroundColor: Colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chipRow: { flex: 1, flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginRight: 8 },
  chip: { backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  chipTxt: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' },
  urgBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  urgDot: { width: 5, height: 5, borderRadius: 3 },
  urgTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },

  stageTrack: { flexDirection: 'row', alignItems: 'center' },
  stageSegment: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stageDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stageDotActive: { backgroundColor: Colors.gold },
  stageDotInner: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.bgPrimary },
  stageLine: { flex: 1, height: 2, backgroundColor: Colors.border },
  stageLineActive: { backgroundColor: Colors.gold },
  stageLabelRow: { flexDirection: 'row' },
  stageLbl: { flex: 1, fontSize: 9, color: Colors.textTertiary },
  stageLblActive: { color: Colors.gold, fontWeight: '700' },

  tabBar: { backgroundColor: Colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabContent: { paddingHorizontal: 16, gap: 4 },
  tab: { paddingHorizontal: 14, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primary, fontWeight: '700' },
  tabBody: { padding: 16 },
});

// ─── Overview Tab Styles ──────────────────────────────────────────────────────
const ov = StyleSheet.create({
  root: { gap: 16 },

  hearingCard: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(59,91,219,0.25)' },
  hearingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hearingLabel: { fontSize: 11, color: Colors.textSecondary },
  hearingDate: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  reminderBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  reminderTxt: { fontSize: 11, fontWeight: '600', color: Colors.primary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flex: 1, minWidth: '44%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border },
  statIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  statLbl: { fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.3, textAlign: 'center' },

  courtCard: { backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 0 },
  courtRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  courtLabel: { fontSize: 10, color: Colors.textTertiary, marginBottom: 3 },
  courtValue: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  badge: { backgroundColor: Colors.warningSubtle, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: Colors.warning },

  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  actionDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  actionTask: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  actionDue: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  priorityTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  priorityTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  aiCard: { backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.gold, borderWidth: 1, borderColor: Colors.goldSubtle, gap: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiTitle: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  aiText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 21 },
  stepsBlock: { gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumTxt: { fontSize: 10, fontWeight: '700', color: Colors.gold },
  stepTxt: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  aiCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  aiCtaTxt: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  similarRow: { flexDirection: 'row', gap: 10 },
  similarCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 12, borderWidth: 1.5, gap: 6 },
  similarResultPill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  similarResult: { fontSize: 11, fontWeight: '800' },
  similarProb: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  similarNote: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  quickIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  quickSub: { fontSize: 11, color: Colors.textSecondary },
});

// ─── Timeline Styles ──────────────────────────────────────────────────────────
const tl = StyleSheet.create({
  root: { gap: 0 },
  row: { flexDirection: 'row', gap: 14 },
  lineCol: { alignItems: 'center', width: 20 },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 16, alignItems: 'center', justifyContent: 'center' },
  dotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', opacity: 0.7 },
  line: { flex: 1, width: 2, backgroundColor: Colors.borderSubtle, marginVertical: 4 },
  content: { flex: 1, paddingBottom: 20 },
  date: { fontSize: 11, color: Colors.textTertiary, marginTop: 14, marginBottom: 7 },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  urgentCard: { borderColor: Colors.danger, borderWidth: 1.5, backgroundColor: 'rgba(248,81,73,0.04)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeDotInner: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  desc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningSubtle, borderRadius: 8, padding: 8 },
  actionTxt: { color: Colors.warning, fontSize: 12, fontWeight: '600' },
  peopleRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  personChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 4 },
  personTxt: { fontSize: 11, color: Colors.textTertiary },
});

// ─── Documents Styles ─────────────────────────────────────────────────────────
const dc = StyleSheet.create({
  root: { gap: 0 },
  uploadRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, paddingVertical: 11, borderWidth: 1.5, borderStyle: 'dashed' },
  lawyerUploadBtn: { borderColor: Colors.gold, backgroundColor: Colors.goldSubtle },
  uploadTxt: { fontSize: 12, fontWeight: '700' },
  catRow: { gap: 8, flexDirection: 'row', paddingBottom: 2 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  catTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  catTxtActive: { color: Colors.primary, fontWeight: '700' },
  docCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  docIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  docMeta: { fontSize: 11, color: Colors.textTertiary, marginTop: 3 },
  docActions: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  docActionBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTxt: { fontSize: 13, color: Colors.textSecondary },
  permNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, backgroundColor: Colors.bgElevated, borderRadius: 10, padding: 12, marginTop: 8 },
  permTxt: { flex: 1, fontSize: 11, color: Colors.textTertiary, lineHeight: 17 },
});

// ─── AI Chat Styles ───────────────────────────────────────────────────────────
const ai = StyleSheet.create({
  root: { gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.goldSubtle },
  avatarWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  sub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  strategyPreview: { backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: Colors.gold, borderWidth: 1, borderColor: Colors.goldSubtle },
  strategyLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  strategyText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 19 },
  suggestLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  promptBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  promptTxt: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  openChatBtn: { marginTop: 6, borderRadius: 14, overflow: 'hidden' },
  openChatGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  openChatTxt: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

// ─── Lawyer Tab Styles ────────────────────────────────────────────────────────
const lw = StyleSheet.create({
  root: { gap: 16 },
  profileCard: { flexDirection: 'row', gap: 14, backgroundColor: Colors.bgSecondary, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  designation: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rating: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  reviews: { fontSize: 11, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  exp: { fontSize: 11, color: Colors.textTertiary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 11, color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  statLbl: { fontSize: 10, color: Colors.textSecondary, marginTop: 3 },
  statDiv: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  ctaRow: { flexDirection: 'row', gap: 10 },
  callBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 50, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  callTxt: { fontSize: 15, fontWeight: '800', color: '#fff' },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.primarySubtle, borderRadius: 14, height: 50, borderWidth: 1.5, borderColor: Colors.primary },
  chatTxt: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  changeSection: { backgroundColor: Colors.warningSubtle, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.warning + '30', gap: 6 },
  changeSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  changeSectionSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 19 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.warning + '40', marginTop: 4 },
  changeBtnTxt: { fontSize: 13, fontWeight: '700', color: Colors.warning },

  specsBlock: { gap: 8 },
  specsTitle: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  specChip: { backgroundColor: Colors.primarySubtle, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(59,91,219,0.25)' },
  specTxt: { fontSize: 11, fontWeight: '600', color: Colors.primary },
});
