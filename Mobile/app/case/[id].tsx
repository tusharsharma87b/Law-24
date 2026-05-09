/**
 * Case OS � redesigned for layman users.
 *
 * Design principles:
 *  � One screen = one case in focus
 *  � Show "what to do next" � not just status
 *  � Plain English everywhere, no legal jargon
 *  � Every section has a clear action button
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, TextInput,
  Alert, Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { CaseActionsSheet } from '../../components/case/CaseActionsSheet';
import { ChangeLawyerFlowSheet } from '../../components/lawyer/ChangeLawyerFlowSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { MOCK_CASES } from '../../constants/mockData';
import { getNextStep, useCaseStore, type CaseDocument } from '../../store/useCaseStore';
import { sendNotification } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';

type AnyCase = typeof MOCK_CASES[0] & Record<string, any>;

// --- Helpers ------------------------------------------------------------------

/** Human-readable name for each case (shown in the selector tab) */
function getFriendlyName(c: AnyCase): string {
  const t = c.title.toLowerCase();
  if (t.includes('498a') || t.includes('cruelty'))     return '498A\nHarassment';
  if (t.includes('125') || t.includes('maintenance'))   return 'Maintenance';
  if (t.includes('section 9') || t.includes('restitut')) return 'Living\nTogether';
  if (t.includes('domestic') || t.includes('dv act'))   return 'DV\nViolence';
  if (t.includes('wrongful') || t.includes('terminat')) return 'Job\nTermination';
  if (t.includes('divorce'))                            return 'Divorce';
  if (t.includes('custody'))                            return 'Child\nCustody';
  return (c.chips[0] ?? c.title.split('�')[0].trim()).slice(0, 14);
}

/** Friendly category header � "Matrimonial Cases" not "matrimonial" */
function getCategoryLabel(cat: string): string {
  const map: Record<string, string> = {
    matrimonial: 'Matrimonial Cases',
    employment: 'Employment Cases',
    criminal: 'Criminal Cases',
    property: 'Property Cases',
    civil: 'Civil Cases',
    corporate: 'Corporate Cases',
    cyber: 'Cyber Cases',
    banking: 'Banking Cases',
    consumer: 'Consumer Cases',
    litigation: 'Litigation Cases',
  };
  return map[cat] ?? 'My Cases';
}

/** Days until next hearing � plain language */
function getDaysUntil(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const months: Record<string, number> = {
    Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
  };
  const m = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
  if (!m) return '';
  const target = new Date(Number(m[3]), months[m[2]] ?? 0, Number(m[1]));
  const today  = new Date(); today.setHours(0,0,0,0);
  const diff   = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0)  return 'Passed';
  if (diff === 0) return 'Today!';
  if (diff === 1) return 'Tomorrow!';
  if (diff <= 7)  return `In ${diff} days ?`;
  if (diff <= 30) return `In ${diff} days`;
  return `In ~${Math.round(diff / 30)} months`;
}

/** Urgency label ? colour */
const URG: Record<string, { color: string; bg: string }> = {
  critical: { color: Colors.danger,  bg: Colors.dangerSubtle },
  high:     { color: Colors.warning, bg: Colors.warningSubtle },
  medium:   { color: Colors.blue,    bg: Colors.blueSubtle },
  low:      { color: Colors.success, bg: Colors.successSubtle },
};

/** Priority ? colour */
const PRI = URG;

/** Dot colour for timeline types */
const DOT: Record<string, string> = {
  urgent: Colors.danger, done: Colors.success,
  info: Colors.primary, action: Colors.gold,
  hearing: Colors.warning,
  filing: Colors.primary,
  evidence: Colors.success,
  note: Colors.blue,
  update: Colors.primary,
  document: Colors.blue,
  lawyer: Colors.gold,
  order: Colors.success,
  support: Colors.warning,
};

// --- Case Selector Bar --------------------------------------------------------
function CaseSelector({
  allCases,
  activeId,
  onSelect,
  onAdd,
}: {
  allCases: AnyCase[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
}) {
  const activeCat  = allCases.find((c) => c.id === activeId)?.category ?? '';
  const peers      = allCases.filter((c) => c.category === activeCat);
  const otherCount = allCases.filter((c) => c.category !== activeCat).length;

  return (
    <View style={cs.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cs.row}>
        {peers.map((p) => {
          const active = p.id === activeId;
          const u = URG[p.urgency] ?? URG.medium;
          return (
            <TouchableOpacity
              key={p.id}
              style={[cs.tab, active && cs.tabActive]}
              onPress={() => onSelect(p.id)}
              activeOpacity={0.8}
            >
              {active && <View style={[cs.tabDot, { backgroundColor: u.color }]} />}
              <Text style={[cs.tabTxt, active && cs.tabTxtActive]} numberOfLines={2}>
                {getFriendlyName(p)}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* + Add */}
        <TouchableOpacity style={cs.addTab} onPress={onAdd} activeOpacity={0.8}>
          <MaterialIcons name="add" size={16} color={Colors.primary} />
          <Text style={cs.addTxt}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Show other-category count if any */}
      {otherCount > 0 && (
        <View style={cs.otherPill}>
          <Text style={cs.otherTxt}>{otherCount} other {otherCount === 1 ? 'case' : 'cases'}</Text>
        </View>
      )}
    </View>
  );
}

// --- "What To Do" Tab --------------------------------------------------------
function WhatToDoTab({
  c,
  onGoToDocs,
  onGoToAI,
  onRemind,
}: {
  c: AnyCase;
  onGoToDocs: () => void;
  onGoToAI: () => void;
  onRemind: () => void;
}) {
  const u = URG[c.urgency] ?? URG.medium;
  const days = getDaysUntil(c.nextHearing);
  const dynamicNextStep = getNextStep(c as any);

  return (
    <View style={td.root}>

      {/* -- "Your Next Step" hero card -- */}
      {(c.nextAction || dynamicNextStep) && (
        <LinearGradient
          colors={[u.color + '22', u.color + '08']}
          style={[td.nextCard, { borderColor: u.color + '44' }]}
        >
          <View style={td.nextTop}>
            <View style={[td.nextIcon, { backgroundColor: u.color + '22' }]}>
              <MaterialIcons name="arrow-circle-right" size={22} color={u.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={td.nextLabel}>Your Next Step</Text>
              <Text style={td.nextAction}>{dynamicNextStep}</Text>
            </View>
          </View>
          <TouchableOpacity style={[td.nextBtn, { backgroundColor: u.color }]} onPress={onGoToDocs} activeOpacity={0.85}>
            <MaterialIcons name="upload-file" size={14} color="#fff" />
            <Text style={td.nextBtnTxt}>Upload Documents</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* -- Next Hearing countdown -- */}
      {c.nextHearing && (
        <View style={td.hearingCard}>
          <View style={td.hearingLeft}>
            <MaterialIcons name="event" size={22} color={Colors.primary} />
            <View>
              <Text style={td.hearingLabel}>Next Court Hearing</Text>
              <Text style={td.hearingDate}>{c.nextHearing}</Text>
              {days ? <Text style={[td.hearingCountdown, days.includes('?') && { color: Colors.warning }]}>{days}</Text> : null}
            </View>
          </View>
          <TouchableOpacity style={td.remindBtn} activeOpacity={0.8} onPress={onRemind}>
            <MaterialIcons name="notifications-active" size={13} color={Colors.primary} />
            <Text style={td.remindTxt}>Remind me</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* -- Simple status grid -- */}
      <View style={td.statusGrid}>
        {[
          { icon: 'emoji-events', color: Colors.gold, top: `${c.successProbability}%`, bot: 'Winning Chance' },
          { icon: 'timeline',     color: Colors.primary, top: c.stage ?? 'Filing', bot: 'Current Stage' },
          { icon: 'folder',       color: Colors.success, top: c.caseNumber ?? 'Pending', bot: 'Case Number' },
          { icon: 'update',       color: Colors.blue, top: c.nextHearing ?? '�', bot: 'Next Hearing' },
        ].map((st) => (
          <View key={st.bot} style={td.statusCard}>
            <View style={[td.statusIcon, { backgroundColor: st.color + '1A' }]}>
              <MaterialIcons name={st.icon as any} size={16} color={st.color} />
            </View>
            <Text style={td.statusTop} numberOfLines={1}>{st.top}</Text>
            <Text style={td.statusBot}>{st.bot}</Text>
          </View>
        ))}
      </View>

      {/* -- Pending actions � plain language -- */}
      {c.pendingActions?.length > 0 && (
        <View style={td.section}>
          <Text style={td.sectionTitle}>Things You Must Do</Text>
          <Text style={td.sectionSub}>Complete these before your next court date</Text>
          {(c.pendingActions as any[]).map((pa: any) => {
            const p = PRI[pa.priority] ?? PRI.medium;
            return (
              <View key={pa.id} style={td.actionRow}>
                <View style={[td.actionDot, { backgroundColor: p.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={td.actionTask}>{pa.task}</Text>
                  <Text style={td.actionDue}>Complete by {pa.due}</Text>
                </View>
                <View style={[td.actionTag, { backgroundColor: p.bg }]}>
                  <Text style={[td.actionTagTxt, { color: p.color }]}>
                    {pa.priority === 'critical' ? 'Must do' : pa.priority === 'high' ? 'Important' : 'Optional'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* -- AI guidance � plain language -- */}
      {c.aiStrategy && (
        <View style={td.aiCard}>
          <View style={td.aiHeader}>
            <MaterialIcons name="auto-awesome" size={17} color={Colors.gold} />
            <Text style={td.aiTitle}>What Should You Do?</Text>
          </View>
          <Text style={td.aiText}>{c.aiStrategy}</Text>
          {c.aiSteps && (
            <View style={td.stepsBlock}>
              {(c.aiSteps as string[]).slice(0, 3).map((step: string, i: number) => (
                <View key={i} style={td.stepRow}>
                  <View style={td.stepNum}><Text style={td.stepNumTxt}>{i + 1}</Text></View>
                  <Text style={td.stepTxt}>{step.replace(/^\d+\.\s*/, '')}</Text>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={td.aiCta} onPress={onGoToAI} activeOpacity={0.85}>
            <MaterialIcons name="chat" size={13} color={Colors.primary} />
            <Text style={td.aiCtaTxt}>Ask more questions</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* -- Similar outcomes -- */}
      {c.similarCases?.length > 0 && (
        <View style={td.section}>
          <Text style={td.sectionTitle}>Cases Like Yours</Text>
          <Text style={td.sectionSub}>How similar cases have ended</Text>
          <View style={td.similarRow}>
            {(c.similarCases as any[]).map((sc: any, i: number) => {
              const isGood = ['Won', 'Acquitted', 'Resolved'].includes(sc.result);
              return (
                <View key={i} style={[td.simCard, { borderColor: isGood ? Colors.success : Colors.gold }]}>
                  <Text style={[td.simResult, { color: isGood ? Colors.success : Colors.gold }]}>{sc.result}</Text>
                  <Text style={td.simProb}>{sc.probability}</Text>
                  <Text style={td.simNote}>{sc.note}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* -- Quick action buttons -- */}
      <View style={td.quickGrid}>
        {[
          { icon: 'upload-file', label: 'Upload Docs',  color: Colors.primary, action: onGoToDocs },
          { icon: 'auto-awesome', label: 'Ask AI',      color: Colors.gold,    action: onGoToAI },
        ].map((q) => (
          <TouchableOpacity key={q.label} style={[td.quickBtn, { borderColor: q.color + '44' }]} onPress={q.action} activeOpacity={0.85}>
            <MaterialIcons name={q.icon as any} size={18} color={q.color} />
            <Text style={[td.quickBtnTxt, { color: q.color }]}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// --- Events / Timeline Tab ----------------------------------------------------
function EventsTab({ c }: { c: AnyCase }) {
  const events = ([...(c.events ?? [])] as any[]).sort((a, b) => {
    const ta = new Date(a.date || 0).getTime();
    const tb = new Date(b.date || 0).getTime();
    return tb - ta;
  });
  return (
    <View style={ev.root}>
      <Text style={ev.intro}>What has happened in your case, in order of time.</Text>
      {!events.length && (
        <View style={ev.empty}>
          <MaterialIcons name="history" size={36} color={Colors.textTertiary} />
          <Text style={ev.emptyTxt}>Generating complete case history...</Text>
        </View>
      )}
      {events.map((e, idx) => (
        <View key={e.id} style={ev.row}>
          <View style={ev.lineCol}>
            <View style={[ev.dot, { backgroundColor: DOT[e.type] ?? Colors.primary }]} />
            {idx < events.length - 1 && <View style={ev.line} />}
          </View>
          <View style={ev.content}>
            <Text style={ev.date}>{e.date}</Text>
            <View style={[ev.card, e.type === 'hearing' && ev.urgentCard]}>
              <Text style={ev.title}>{e.title}</Text>
              <Text style={ev.desc}>{e.description ?? e.desc}</Text>
              {e.action && (
                <View style={ev.actionBanner}>
                  <MaterialIcons name="schedule" size={12} color={Colors.warning} />
                  <Text style={ev.actionBannerTxt}>{e.action}</Text>
                </View>
              )}
              {e.people?.length > 0 && (
                <View style={ev.peopleRow}>
                  {e.people.map((p: string) => (
                    <View key={p} style={ev.personChip}>
                      <MaterialIcons name="person" size={10} color={Colors.textTertiary} />
                      <Text style={ev.personTxt}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// --- Evidence & Documents Tab -------------------------------------------------
const DOC_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  document: { label: 'Documents', icon: 'description', color: Colors.primary },
  audio: { label: 'Audio', icon: 'graphic-eq', color: Colors.gold },
  video: { label: 'Video', icon: 'videocam', color: Colors.warning },
  chat: { label: 'Chats', icon: 'chat', color: Colors.blue },
  official: { label: 'Official', icon: 'account-balance', color: Colors.success },
  affidavit: { label: 'Affidavit', icon: 'verified-user', color: Colors.primary },
};
const FILE_TYPES = {
  DOCUMENT: 'document',
  AUDIO: 'audio',
  VIDEO: 'video',
  CHAT: 'chat',
  OFFICIAL: 'official',
} as const;
const EVIDENCE_FOLDERS = [
  'Case Documents',
  'Evidence Files',
  'Court Submissions',
  'Personal Uploads',
  'Lawyer Shared',
] as const;
type EvidenceFolder = (typeof EVIDENCE_FOLDERS)[number];
const EVIDENCE_TAG_SUGGESTIONS = ['Identity Proof', 'Financial Evidence', 'Abuse Evidence', 'Communication Proof'];
const UPLOAD_OPTIONS: { id: 'document' | 'video' | 'audio' | 'chat' | 'official'; label: string; icon: string }[] = [
  { id: 'document', label: 'Upload Document', icon: 'description' },
  { id: 'video', label: 'Upload Video Evidence', icon: 'videocam' },
  { id: 'audio', label: 'Upload Audio Recording', icon: 'graphic-eq' },
  { id: 'chat', label: 'Upload Chat / Screenshot', icon: 'chat' },
  { id: 'official', label: 'Upload Official Record', icon: 'account-balance' },
];

const FOLDER_ICON: Record<EvidenceFolder, string> = {
  'Case Documents': 'folder',
  'Evidence Files': 'video-library',
  'Court Submissions': 'gavel',
  'Personal Uploads': 'person',
  'Lawyer Shared': 'group',
};

const FOLDER_COLOR: Record<EvidenceFolder, string> = {
  'Case Documents': Colors.primary,
  'Evidence Files': Colors.gold,
  'Court Submissions': Colors.warning,
  'Personal Uploads': Colors.success,
  'Lawyer Shared': Colors.blue,
};

function inferFolderFromDoc(doc: any): EvidenceFolder {
  if (doc.folder && EVIDENCE_FOLDERS.includes(doc.folder)) return doc.folder as EvidenceFolder;
  if (doc.uploadedBy === 'lawyer') return 'Lawyer Shared';
  if (doc.courtReady || doc.type === 'official') return 'Court Submissions';
  if (doc.type === 'video' || doc.type === 'audio' || doc.type === 'chat') return 'Evidence Files';
  if (doc.type === 'document') return 'Case Documents';
  return 'Personal Uploads';
}

function formatFileSize(size: unknown): string {
  const bytes = typeof size === 'number' && Number.isFinite(size) ? size : Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return '�';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function DocsTab({
  c,
  onUpload,
  onView,
  onDelete,
  onToggleCourtReady,
}: {
  c: AnyCase;
  onUpload: (kind: 'document' | 'video' | 'audio' | 'chat' | 'official', folder: EvidenceFolder) => void;
  onView: (doc: any) => void;
  onDelete: (docId: string) => void;
  onToggleCourtReady: (docId: string, value: boolean) => void;
}) {
  const currentRole: 'user' | 'lawyer' = 'user';
  const [selectedFolder, setSelectedFolder] = useState<EvidenceFolder | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all'|'document'|'audio'|'video'|'chat'|'official'>('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date'|'type'|'verified'>('date');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<EvidenceFolder>('Evidence Files');
  const evidenceData = useMemo(
    () => {
      const docs = (c.documents ?? []) as any[];
      return docs.map((item) => ({
        ...item,
        type: String(item.type || item.fileType || '')
          .toLowerCase()
          .replace('documents', 'document')
          .replace('videos', 'video')
          .replace('audios', 'audio')
          .replace('chats', 'chat'),
        folder: inferFolderFromDoc(item),
        uploadedBy: item.uploadedBy === 'lawyer' ? 'lawyer' : 'user',
      }));
    },
    [c.documents]
  );
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const folderCounts = useMemo(
    () =>
      EVIDENCE_FOLDERS.map((folder) => ({
        folder,
        count: evidenceData.filter((d) => d.folder === folder).length,
      })),
    [evidenceData]
  );

  useEffect(() => {
    const q = query.trim().toLowerCase();
    let rows = selectedFolder ? evidenceData.filter((item) => item.folder === selectedFolder) : evidenceData;
    rows = selectedFilter === 'all'
      ? rows
      : rows.filter((item) => item.type === selectedFilter);
    if (q) {
      rows = rows.filter((item) =>
        String(item.name || '').toLowerCase().includes(q) ||
        (item.tags ?? []).some((t: string) => String(t).toLowerCase().includes(q))
      );
    }
    rows = [...rows].sort((a, b) => {
      if (sortBy === 'type') return String(a.type).localeCompare(String(b.type));
      if (sortBy === 'verified') return String(a.verificationStatus).localeCompare(String(b.verificationStatus));
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    setFilteredData(rows);
  }, [selectedFilter, selectedFolder, evidenceData, query, sortBy]);

  const canDelete = (doc: any) => doc.uploadedBy === currentRole;
  const canEdit = (doc: any) => doc.uploadedBy === currentRole;

  if (!selectedFolder) {
    return (
      <View style={dc.root}>
        <Text style={dc.sectionTitle}>Folders</Text>
        <View style={dc.folderGrid}>
          {folderCounts.map(({ folder, count }) => (
            <TouchableOpacity
              key={folder}
              style={dc.folderCard}
              activeOpacity={0.85}
              onPress={() => {
                setSelectedFolder(folder);
                setUploadFolder(folder);
              }}
            >
              <View style={[dc.folderIcon, { backgroundColor: FOLDER_COLOR[folder] + '22' }]}>
                <MaterialIcons name={FOLDER_ICON[folder] as any} size={24} color={FOLDER_COLOR[folder]} />
              </View>
              <Text style={dc.folderName}>{folder}</Text>
              <Text style={dc.folderCount}>{count} file{count === 1 ? '' : 's'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={dc.uploadRow}>
          <TouchableOpacity
            style={dc.uploadBtn}
            activeOpacity={0.85}
            onPress={() => {
              setUploadFolder('Evidence Files');
              setShowUploadModal(true);
            }}
          >
            <MaterialIcons name="upload" size={16} color="#fff" />
            <Text style={dc.uploadBtnTxt}>Add Evidence</Text>
          </TouchableOpacity>
        </View>

        <Text style={dc.sectionTitle}>Recent Documents</Text>
        <View style={dc.docList}>
          {evidenceData.slice(0, 6).map((doc) => {
            const meta = DOC_TYPE_META[doc.type] ?? DOC_TYPE_META.document;
            return (
              <View key={doc.id} style={dc.docRowMini}>
                <View style={[dc.docIcon, { backgroundColor: meta.color + '1A' }]}>
                  <MaterialIcons name={meta.icon as any} size={20} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={dc.docName} numberOfLines={1}>{doc.name}</Text>
                  <Text style={dc.docMeta}>
                    {formatFileSize(doc.size)} � {new Date(doc.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => onView(doc)} hitSlop={8}>
                  <MaterialIcons name="open-in-new" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        {showUploadModal && (
          <View style={dc.uploadModalLayer} pointerEvents="box-none">
            <TouchableOpacity style={dc.uploadModalBackdrop} onPress={() => setShowUploadModal(false)} activeOpacity={1} />
            <View style={dc.uploadModalSheet}>
              <Text style={dc.uploadModalTitle}>Upload Evidence</Text>
              <Text style={dc.modalSub}>Choose folder</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dc.folderChipRow}>
                {EVIDENCE_FOLDERS.map((fdr) => (
                  <TouchableOpacity
                    key={fdr}
                    style={[dc.folderChip, uploadFolder === fdr && dc.folderChipActive]}
                    onPress={() => setUploadFolder(fdr)}
                    activeOpacity={0.85}
                  >
                    <Text style={[dc.folderChipTxt, uploadFolder === fdr && dc.folderChipTxtActive]}>{fdr}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {UPLOAD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={dc.uploadOption}
                  onPress={() => {
                    setShowUploadModal(false);
                    onUpload(opt.id, uploadFolder);
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name={opt.icon as any} size={18} color={Colors.primary} />
                  <Text style={dc.uploadOptionTxt}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={dc.closeUploadBtn} onPress={() => setShowUploadModal(false)} activeOpacity={0.85}>
                <Text style={dc.closeUploadTxt}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={dc.root}>
      <View style={dc.folderHeader}>
        <TouchableOpacity style={dc.backFolderBtn} onPress={() => setSelectedFolder(null)} activeOpacity={0.85}>
          <MaterialIcons name="arrow-back" size={16} color={Colors.primary} />
          <Text style={dc.backFolderTxt}>Folders</Text>
        </TouchableOpacity>
        <Text style={dc.folderHeaderTitle}>{selectedFolder}</Text>
      </View>
      <TextInput
        style={dc.searchInput}
        placeholder="Search files or tags"
        placeholderTextColor={Colors.textTertiary}
        value={query}
        onChangeText={setQuery}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dc.filterRow} style={{ marginBottom: 10 }}>
        {(['all','document','audio','video','chat','official'] as const).map((f) => (
          <TouchableOpacity key={f} style={[dc.filter, selectedFilter === f && dc.filterActive]} onPress={() => setSelectedFilter(f)} activeOpacity={0.8}>
            <Text style={[dc.filterTxt, selectedFilter === f && dc.filterTxtActive]}>
              {{ all:'All', document:'Documents', audio:'Audio', video:'Video', chat:'Chats', official:'Official' }[f]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={dc.sortRow}>
        {(['date', 'type', 'verified'] as const).map((srt) => (
          <TouchableOpacity key={srt} style={[dc.sortChip, sortBy === srt && dc.sortChipActive]} onPress={() => setSortBy(srt)} activeOpacity={0.85}>
            <Text style={[dc.sortChipTxt, sortBy === srt && dc.sortChipTxtActive]}>{srt === 'date' ? 'Date' : srt === 'type' ? 'Type' : 'Verified'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={dc.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={10}
        extraData={selectedFilter}
        ListHeaderComponent={
          <View style={dc.uploadRow}>
            <TouchableOpacity
              style={dc.uploadBtn}
              activeOpacity={0.85}
              onPress={() => {
                setUploadFolder(selectedFolder);
                setShowUploadModal(true);
              }}
            >
              <MaterialIcons name="upload" size={16} color="#fff" />
              <Text style={dc.uploadBtnTxt}>Add Evidence</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item: doc }) => {
          const meta = DOC_TYPE_META[doc.type] ?? DOC_TYPE_META.document;
          const statusVerified = doc.verificationStatus === 'verified';
          return (
            <View style={dc.docCard}>
              <View style={[dc.docIcon, { backgroundColor: meta.color + '1A' }]}>
                <MaterialIcons name={meta.icon as any} size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={dc.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={dc.docMeta}>
                  {formatFileSize(doc.size)} � {new Date(doc.createdAt || Date.now()).toLocaleDateString('en-IN')} � Uploaded by {doc.uploadedBy === 'lawyer' ? 'Lawyer' : 'User'}
                </Text>
                <View style={dc.tagRow}>
                  {(doc.tags ?? []).slice(0, 3).map((t: string) => (
                    <Text key={t} style={dc.tagChip}>{t}</Text>
                  ))}
                </View>
                <View style={dc.statusRow}>
                  <Text style={[dc.statusBadge, statusVerified ? dc.statusVerified : dc.statusPending]}>
                    {statusVerified ? 'Verified' : 'Pending'}
                  </Text>
                  <Text style={[dc.statusBadge, doc.courtReady ? dc.statusVerified : dc.statusPending]}>
                    {doc.courtReady ? 'Court Ready' : 'Needs Action'}
                  </Text>
                </View>
                {canEdit(doc) ? (
                  <TouchableOpacity
                    style={dc.toggleReadyBtn}
                    onPress={() => onToggleCourtReady(doc.id, !doc.courtReady)}
                    activeOpacity={0.8}
                  >
                    <Text style={dc.toggleReadyTxt}>{doc.courtReady ? 'Mark Needs Action' : 'Mark as Court Ready'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={dc.readOnlyPill}>
                    <Text style={dc.readOnlyTxt}>Read-only (shared by lawyer)</Text>
                  </View>
                )}
              </View>
              <View style={dc.docActions}>
                {canEdit(doc) ? (
                  <TouchableOpacity hitSlop={8} onPress={() => onToggleCourtReady(doc.id, !doc.courtReady)}>
                    <MaterialIcons name="edit" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity hitSlop={8} onPress={() => onView(doc)}>
                  <MaterialIcons name="open-in-new" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity hitSlop={8} onPress={() => onView(doc)}>
                  <MaterialIcons name="download" size={17} color={Colors.textSecondary} />
                </TouchableOpacity>
                {canDelete(doc) ? (
                  <TouchableOpacity hitSlop={8} onPress={() => onDelete(doc.id)}>
                    <MaterialIcons name="delete-outline" size={17} color={Colors.danger} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={filteredData.length === 0 ? (
          <View style={dc.empty}>
            <MaterialIcons name="folder-open" size={26} color={Colors.textTertiary} />
            <Text style={dc.emptyTitle}>No Documents found</Text>
            <TouchableOpacity style={dc.emptyBtn} onPress={() => setShowUploadModal(true)} activeOpacity={0.85}>
              <Text style={dc.emptyBtnTxt}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      />

      {showUploadModal && (
        <View style={dc.uploadModalLayer} pointerEvents="box-none">
          <TouchableOpacity style={dc.uploadModalBackdrop} onPress={() => setShowUploadModal(false)} activeOpacity={1} />
          <View style={dc.uploadModalSheet}>
            <Text style={dc.uploadModalTitle}>Upload Evidence</Text>
            <Text style={dc.modalSub}>Choose folder</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dc.folderChipRow}>
              {EVIDENCE_FOLDERS.map((fdr) => (
                <TouchableOpacity
                  key={fdr}
                  style={[dc.folderChip, uploadFolder === fdr && dc.folderChipActive]}
                  onPress={() => setUploadFolder(fdr)}
                  activeOpacity={0.85}
                >
                  <Text style={[dc.folderChipTxt, uploadFolder === fdr && dc.folderChipTxtActive]}>{fdr}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {UPLOAD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={dc.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  onUpload(opt.id, uploadFolder);
                }}
                activeOpacity={0.85}
              >
                <MaterialIcons name={opt.icon as any} size={18} color={Colors.primary} />
                <Text style={dc.uploadOptionTxt}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <Text style={dc.tagHint}>Suggested tags: {EVIDENCE_TAG_SUGGESTIONS.join(' � ')}</Text>
            <TouchableOpacity style={dc.closeUploadBtn} onPress={() => setShowUploadModal(false)} activeOpacity={0.85}>
              <Text style={dc.closeUploadTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// --- Ask AI Tab ---------------------------------------------------------------
function AskAITab({ c }: { c: AnyCase }) {
  const router = useRouter();
  const questions = [
    `What should I do before ${c.nextHearing ?? 'my next hearing'}?`,
    `What documents do I still need?`,
    `How strong is my case right now?`,
    'Explain what happened in simple words',
    'What will the judge look at?',
    `How long will ${c.title.split('�')[0].trim()} take?`,
  ];
  return (
    <View style={ai.root}>
      <View style={ai.banner}>
        <View style={ai.bannerIcon}><MaterialIcons name="auto-awesome" size={22} color={Colors.gold} /></View>
        <View style={{ flex: 1 }}>
          <Text style={ai.bannerTitle}>Ask Anything About Your Case</Text>
          <Text style={ai.bannerSub}>AI trained on Indian law � answers in plain English</Text>
        </View>
      </View>
      <Text style={ai.stratLabel}>AI says right now:</Text>
      <Text style={ai.stratText}>{c.aiStrategy}</Text>
      <Text style={ai.qLabel}>COMMON QUESTIONS</Text>
      {questions.map((q, i) => (
        <TouchableOpacity
          key={i}
          style={ai.qBtn}
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/nyaya', params: { prefilledQuestion: q, autoSend: '1' } })}
        >
          <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.primary} />
          <Text style={ai.qTxt}>{q}</Text>
          <MaterialIcons name="north-east" size={13} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={ai.openBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/nyaya')}
      >
        <LinearGradient colors={[Colors.primary, '#7C3AED']} start={{x:0,y:0}} end={{x:1,y:0}} style={ai.openGrad}>
          <MaterialIcons name="auto-awesome" size={15} color="#fff" />
          <Text style={ai.openTxt}>Open Full AI Chat</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// --- Your Lawyer Tab ----------------------------------------------------------
function YourLawyerTab({
  c,
  caseId,
  onOpenProfile,
  walletBalance,
  caseTitle,
  caseCategory,
  activeReviewTicket,
  onCreateReviewTicket,
  onAssignPlatformLawyer,
  onAddOwnLawyer,
}: {
  c: AnyCase;
  caseId: string;
  onOpenProfile: (lawyerId: string) => void;
  walletBalance: number;
  caseTitle: string;
  caseCategory: string;
  activeReviewTicket: any;
  onCreateReviewTicket: (payload: { reason: string; note: string; type: 'LAWYER_CHANGE_REQUEST' }) => Promise<void>;
  onAssignPlatformLawyer: (payload: { lawyer: any; extraChargeInr: number }) => Promise<void>;
  onAddOwnLawyer: (payload: { name: string; phone: string; email: string; firm?: string }) => Promise<void>;
}) {
  const router = useRouter();
  const getOrCreateThread = useChatStore((s) => s.getOrCreateThread);
  const l = c.lawyer as any;
  const [callLoading, setCallLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  const phone = String(l?.phone ?? l?.contact?.phone ?? '').replace(/[^\d+]/g, '');
  const lawyerId = String(l?.id ?? l?.lawyerId ?? `lawyer-${(l?.name ?? 'unknown').replace(/\s+/g, '-').toLowerCase()}`);

  const handleCall = async () => {
    if (callLoading) return;
    if (!phone) {
      Alert.alert('Phone Missing', 'Lawyer phone number is not available right now.');
      return;
    }
    setCallLoading(true);
    try {
      await Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert('Unable to Call', 'Could not open dialer. Please try again.');
    } finally {
      setCallLoading(false);
    }
  };

  const handleMessage = async () => {
    if (chatLoading) return;
    setChatLoading(true);
    try {
      const thread = getOrCreateThread({
        caseId,
        lawyerId,
        lawyerName: l?.name ?? 'Lawyer',
      });
      router.push({ pathname: '/chat/[id]', params: { id: thread.id, lawyerId, lawyerName: l?.name ?? 'Lawyer', caseId } });
    } catch {
      Alert.alert('Chat Failed', 'Unable to open chat. Please retry.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <View style={lw.root}>
      <TouchableOpacity style={lw.card} activeOpacity={0.92} onPress={() => onOpenProfile(lawyerId)}>
        <LinearGradient colors={['#4F46E5','#7C3AED']} style={lw.avatar}>
          <Text style={lw.avatarTxt}>{l?.initials ?? 'LA'}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <View style={lw.nameRow}>
            <Text style={lw.name}>{l?.name ?? 'Your Lawyer'}</Text>
            {l?.verified && <MaterialIcons name="verified" size={14} color={Colors.primary} />}
          </View>
          <Text style={lw.desig}>{l?.designation ?? 'Advocate'}</Text>
          <View style={lw.ratingRow}>
            <MaterialIcons name="star" size={12} color={Colors.gold} />
            <Text style={lw.rating}>{l?.rating?.average ?? '�'}</Text>
            <Text style={lw.ratingCount}>({l?.rating?.totalReviews ?? 0} reviews)</Text>
            <View style={lw.metaDot} />
            <Text style={lw.exp}>{l?.experienceYears ?? 0} years experience</Text>
          </View>
          <View style={lw.onlineRow}>
            <View style={[lw.onlineDot, { backgroundColor: l?.isOnline ? Colors.success : '#6B7280' }]} />
            <Text style={lw.onlineTxt}>{l?.isOnline ? 'Available now' : 'Not available right now'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* CTA row */}
      <View style={lw.ctaRow}>
        <TouchableOpacity style={[lw.callBtn, callLoading && lw.disabledBtn]} activeOpacity={0.85} onPress={handleCall} disabled={callLoading}>
          <MaterialIcons name="phone" size={16} color="#fff" />
          <Text style={lw.callTxt}>{callLoading ? 'Opening...' : 'Call Lawyer'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[lw.chatBtn, chatLoading && lw.disabledBtn]} activeOpacity={0.85} onPress={handleMessage} disabled={chatLoading}>
          <MaterialIcons name="chat" size={16} color={Colors.primary} />
          <Text style={lw.chatTxt}>{chatLoading ? 'Opening...' : 'Send Message'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={lw.statsRow}>
        {[
          { v: `${l?.cases?.winRatePercent ?? '�'}%`, l: 'Win Rate' },
          { v: `${l?.cases?.total ?? '�'}+`, l: 'Cases Handled' },
          { v: `${l?.experienceYears ?? '�'} yrs`, l: 'Experience' },
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

      {/* Court + specializations */}
      {l?.courts?.length > 0 && (
        <View style={lw.courtsBlock}>
          <Text style={lw.blockLabel}>PRACTICES IN</Text>
          {l.courts.slice(0, 3).map((ct: any) => (
            <View key={ct.name} style={lw.courtRow}>
              <MaterialIcons name="account-balance" size={14} color={Colors.primary} />
              <Text style={lw.courtName}>{ct.name}</Text>
              <Text style={lw.courtSince}>since {ct.since}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Change lawyer */}
      <View style={lw.changeBox}>
        {activeReviewTicket && (
          <View style={lw.reviewBadge}>
            <Text style={lw.reviewBadgeTxt}>
              Review in progress (ETA: 48h) � {activeReviewTicket.status}
            </Text>
          </View>
        )}
        <Text style={lw.changeTitle}>Not comfortable with your lawyer?</Text>
        <Text style={lw.changeSub}>You can request a change. Our team will assign a better-suited lawyer within 48 hours.</Text>
        <TouchableOpacity style={lw.changeBtn} activeOpacity={0.82} onPress={() => setChangeOpen(true)}>
          <MaterialIcons name="swap-horiz" size={15} color={Colors.warning} />
          <Text style={lw.changeTxt}>Request Lawyer Change</Text>
        </TouchableOpacity>
        <TouchableOpacity style={lw.escalateBtn} activeOpacity={0.82} onPress={() => setChangeOpen(true)}>
          <MaterialIcons name="support-agent" size={14} color={Colors.primary} />
          <Text style={lw.escalateTxt}>Escalate / Change / Add Lawyer</Text>
        </TouchableOpacity>
      </View>

      <ChangeLawyerFlowSheet
        visible={changeOpen}
        onClose={() => setChangeOpen(false)}
        caseId={caseId}
        caseTitle={caseTitle}
        caseCategory={caseCategory}
        walletBalance={walletBalance}
        currentLawyer={l}
        activeReviewTicket={activeReviewTicket}
        onCreateReviewTicket={onCreateReviewTicket}
        onAssignPlatformLawyer={onAssignPlatformLawyer}
        onAddOwnLawyer={onAddOwnLawyer}
      />
    </View>
  );
}

// --- Main Screen --------------------------------------------------------------
const TABS = [
  { key: 'todo',    label: 'What To Do' },
  { key: 'events',  label: 'Events' },
  { key: 'docs',    label: 'Evidence & Documents' },
  { key: 'ai',      label: 'Ask AI' },
  { key: 'lawyer',  label: 'Your Lawyer' },
];

export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const {
    cases,
    setSelectedSubCase,
    addReminder,
    addDocument,
    deleteDocument,
    updateDocument,
    updateCaseStage,
    createLawyerReviewTicket,
    closeLawyerReviewTicket,
    refreshLawyerReviewSLAs,
    addEvent,
    assignLawyer,
    deductWalletForCase,
    user,
  } = useCaseStore();
  const allCases = cases as AnyCase[];

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/cases');
  };

  const [activeCaseId, setActiveCaseId] = useState(id ?? '');
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const activeCase = useMemo(
    () => (allCases.find((c) => c.id === activeCaseId) ?? MOCK_CASES.find((c) => c.id === id) ?? MOCK_CASES[0]) as AnyCase,
    [activeCaseId, allCases, id],
  );

  const handleSelectCase = useCallback((caseId: string) => {
    setActiveCaseId(caseId);
    setSelectedSubCase(caseId);
    setActiveTab(0);
  }, [setSelectedSubCase]);

  const handleRemind = useCallback(() => {
    if (!activeCase?.id || !activeCase?.nextHearing) return;
    addReminder({
      caseId: activeCase.id,
      date: activeCase.nextHearing,
      triggered: false,
    });
    Alert.alert('Reminder Set', 'You will be reminded before the next hearing.');
  }, [activeCase, addReminder]);

  const handleUploadDocument = useCallback(async (kind: 'document' | 'video' | 'audio' | 'chat' | 'official', folder: EvidenceFolder) => {
    if (!activeCase?.id) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return;
    const file = result.assets?.[0];
    if (!file) return;
    const ext = (file.name?.split('.').pop() || '').toLowerCase();
    let inferredType: 'document' | 'audio' | 'video' | 'chat' | 'official' = kind;
    if (kind === FILE_TYPES.DOCUMENT) {
      if (['mp3', 'wav'].includes(ext)) inferredType = FILE_TYPES.AUDIO;
      else if (['mp4', 'mov'].includes(ext)) inferredType = FILE_TYPES.VIDEO;
      else if (['jpg', 'jpeg', 'png', 'webp', 'txt'].includes(ext)) inferredType = FILE_TYPES.CHAT;
      else if (['pdf', 'doc', 'docx'].includes(ext)) inferredType = FILE_TYPES.DOCUMENT;
      else inferredType = FILE_TYPES.OFFICIAL;
    }
    const needs65B = inferredType === 'audio' || inferredType === 'video' || inferredType === 'chat';
    addDocument(activeCase.id, {
      name: file.name ?? 'Document',
      type: inferredType,
      subtype: kind,
      format: ext || 'unknown',
      caseId: activeCase.id,
      caseTag: String(activeCase.chips?.[0] ?? activeCase.title ?? 'General'),
      tags: inferredType === 'chat' ? ['Communication Proof'] : inferredType === 'official' ? ['Identity Proof'] : inferredType === 'video' || inferredType === 'audio' ? ['Abuse Evidence'] : ['Financial Evidence'],
      uploadedBy: 'user',
      folder,
      verificationStatus: inferredType === 'official' ? 'verified' : 'pending',
      courtReady: inferredType === 'official',
      size: file.size ?? 0,
      uri: file.uri,
    });
    if (needs65B) {
      Alert.alert('Section 65B Note', 'This may require Section 65B Certificate for court admissibility');
    }
  }, [activeCase, addDocument]);

  const handleViewDocument = useCallback(async (doc: CaseDocument) => {
    if (!doc?.uri) return;
    try {
      await Linking.openURL(doc.uri);
    } catch {
      Alert.alert('Unable to open', 'This document cannot be opened right now.');
    }
  }, []);

  const handleDeleteDocument = useCallback((docId: string) => {
    if (!activeCase?.id) return;
    const targetDoc = (activeCase.documents ?? []).find((item: any) => item.id === docId);
    if (!targetDoc) return;
    if (targetDoc.uploadedBy === 'lawyer') {
      Alert.alert('Permission denied', 'You can only delete documents uploaded by you.');
      return;
    }
    deleteDocument(activeCase.id, docId);
  }, [activeCase, deleteDocument]);

  const handleToggleCourtReady = useCallback((docId: string, value: boolean) => {
    if (!activeCase?.id) return;
    updateDocument(activeCase.id, docId, { courtReady: value, verificationStatus: value ? 'verified' : 'pending' });
  }, [activeCase, updateDocument]);

  const handleStagePress = useCallback((stageName: string) => {
    if (!activeCase?.id) return;
    updateCaseStage(activeCase.id, stageName);
  }, [activeCase, updateCaseStage]);

  useEffect(() => {
    refreshLawyerReviewSLAs();
    const timer = setInterval(() => refreshLawyerReviewSLAs(), 60_000);
    return () => clearInterval(timer);
  }, [refreshLawyerReviewSLAs]);

  const handleOpenLawyerProfile = useCallback((lawyerId: string) => {
    router.push({ pathname: '/lawyer/[id]', params: { id: lawyerId } } as any);
  }, [router]);

  const handleCreateReviewTicket = useCallback(async ({ reason, note, type }: { reason: string; note: string; type: 'LAWYER_CHANGE_REQUEST' }) => {
    if (!activeCase?.id) throw new Error('Missing case');
    const ticketId = createLawyerReviewTicket({
      caseId: activeCase.id,
      lawyerId: activeCase?.lawyer?.id ?? (activeCase?.lawyer as any)?.lawyerId,
      reason,
      note,
    });
    if (!ticketId) throw new Error('Review already in progress');
    addEvent(activeCase.id, {
      title: 'Lawyer Change Requested',
      description: `${type}: ${reason}${note ? ` - ${note}` : ''}`,
      date: new Date().toISOString(),
      type: 'support',
    });
    sendNotification(
      'lawyer',
      `Your lawyer review request is under process for ${activeCase.title}`,
      {
        title: 'Request Submitted',
        priority: 'medium',
        targetRoute: '/(tabs)/cases',
        targetParams: { caseId: activeCase.id, ticketId: ticketId ?? '' },
      },
    );
  }, [activeCase, createLawyerReviewTicket, addEvent]);

  const handleAssignPlatformLawyer = useCallback(async ({ lawyer, extraChargeInr }: { lawyer: any; extraChargeInr: number }) => {
    if (!activeCase?.id) throw new Error('Missing case');
    if (extraChargeInr > 0) {
      const ok = deductWalletForCase(activeCase.id, extraChargeInr);
      if (!ok) {
        throw new Error('Insufficient wallet');
      }
    }
    const initials = String(lawyer.name || 'LA')
      .replace(/^Adv\.\s*/i, '')
      .split(' ')
      .slice(0, 2)
      .map((p: string) => p[0]?.toUpperCase() ?? '')
      .join('');
    assignLawyer(activeCase.id, {
      id: lawyer.id,
      name: lawyer.name,
      initials,
      isOnline: lawyer.isOnline,
      experienceYears: 5 + (lawyer.id.length % 10),
      designation: `${lawyer.specialization || 'Advocate'} Specialist`,
      contact: { phone: lawyer.phone ?? '9999999999' },
      phone: lawyer.phone ?? '9999999999',
      rate: lawyer.price,
      price: lawyer.price,
      rating: { average: lawyer.rating, totalReviews: 120 },
      courts: [{ name: lawyer.court, since: '2018' }],
      cases: { winRatePercent: Math.round((lawyer.rating / 5) * 100), total: 120 + lawyer.id.length * 3 },
    });
    sendNotification(
      'lawyer',
      `${lawyer.name} has been assigned to your case`,
      { title: 'Lawyer Assigned', priority: 'medium', targetRoute: '/case/[id]', targetParams: { id: activeCase.id } },
    );
    closeLawyerReviewTicket(activeCase.id);
    addEvent(activeCase.id, {
      title: 'Lawyer Review Completed',
      description: 'Lawyer review completed and ticket closed.',
      date: new Date().toISOString(),
      type: 'support',
    });
    sendNotification(
      'lawyer',
      `Your request has been resolved for ${activeCase.title}`,
      { title: 'Review Resolved', priority: 'medium', targetRoute: '/case/[id]', targetParams: { id: activeCase.id } },
    );
  }, [activeCase, deductWalletForCase, assignLawyer, closeLawyerReviewTicket, addEvent]);

  const handleAddOwnLawyer = useCallback(async ({ name, phone, email, firm }: { name: string; phone: string; email: string; firm?: string }) => {
    if (!activeCase?.id) throw new Error('Missing case');
    const ticketId = createLawyerReviewTicket({
      caseId: activeCase.id,
      lawyerId: activeCase?.lawyer?.id ?? (activeCase?.lawyer as any)?.lawyerId,
      reason: 'Own lawyer added',
      note: `${name} (${phone})`,
    });
    addEvent(activeCase.id, {
      title: 'Own Lawyer Added for Verification',
      description: `${name} (${phone})${firm ? ` � ${firm}` : ''}${email ? ` � ${email}` : ''}`,
      date: new Date().toISOString(),
      type: 'support',
    });
    sendNotification(
      'lawyer',
      `Own lawyer details submitted for verification in ${activeCase.title}`,
      {
        title: 'Verification Pending',
        priority: 'medium',
        targetRoute: '/(tabs)/cases',
        targetParams: { caseId: activeCase.id, ticketId: ticketId ?? '' },
      },
    );
  }, [activeCase, createLawyerReviewTicket, addEvent]);

  const activeReviewTicket = useMemo(
    () =>
      (activeCase?.tickets ?? []).find(
        (t: any) => t.type === 'lawyer_review' && ['OPEN', 'IN_REVIEW', 'ESCALATED'].includes(t.status),
      ) ?? null,
    [activeCase],
  );

  const categoryLabel  = getCategoryLabel(activeCase.category ?? '');
  const categoryCount  = allCases.filter((c) => c.category === activeCase.category).length;
  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* -- Header -- */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.backPill} hitSlop={10} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back-ios" size={13} color={Colors.textSecondary} />
          <Text style={s.backTxt}>Cases</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>{categoryLabel}</Text>
          <Text style={s.headerSub}>{categoryCount} {categoryCount === 1 ? 'case' : 'cases'} active</Text>
        </View>
        <TouchableOpacity style={s.moreBtn} hitSlop={10} onPress={() => setActionsSheetOpen(true)} activeOpacity={0.8}>
          <MaterialIcons name="more-vert" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* -- Case Selector -- */}
      <CaseSelector
        allCases={allCases}
        activeId={activeCaseId}
        onSelect={handleSelectCase}
        onAdd={() => router.push({ pathname: '/(tabs)/cases', params: { openNew: '1', source: 'case_selector_add', category: activeCase.category } })}
      />

      {/* -- Stage progress strip -- */}
      <View style={s.stageStrip}>
        <View style={s.stageTrack}>
          {activeCase.stages.map((st, idx) => (
            <TouchableOpacity key={st} style={s.stageSegment} activeOpacity={0.85} onPress={() => handleStagePress(st)}>
              <View style={[s.stageDot, idx <= activeCase.activeStageIndex && s.stageDotActive]}>
                {idx < activeCase.activeStageIndex && <MaterialIcons name="check" size={7} color="#fff" />}
                {idx === activeCase.activeStageIndex && <View style={s.stageDotPulse} />}
              </View>
              {idx < activeCase.stages.length - 1 && (
                <View style={[s.stageLine, idx < activeCase.activeStageIndex && s.stageLineActive]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.stageLabelRow}>
          {activeCase.stages.map((st, idx) => (
            <Text key={st} style={[
              s.stageLbl,
              idx < activeCase.activeStageIndex && s.stageLblDone,
              idx === activeCase.activeStageIndex && s.stageLblActive,
            ]} numberOfLines={1}>{st}</Text>
          ))}
        </View>
      </View>

      {/* -- Tab Bar (always visible/clickable) -- */}
      <View style={s.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabContent}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === idx && s.tabActive]}
              onPress={() => setActiveTab(idx)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabTxt, activeTab === idx && s.tabTxtActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === 2 ? (
        // Docs tab contains a FlatList (Add Evidence list), so keep it out of any parent vertical ScrollView.
        <View style={s.docsContainer}>
          <View style={s.docsBody}>
            <DocsTab c={activeCase} onUpload={handleUploadDocument} onView={handleViewDocument} onDelete={handleDeleteDocument} onToggleCourtReady={handleToggleCourtReady} />
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* -- Tab Content -- */}
          <View style={s.tabBody}>
            {activeTab === 0 && <WhatToDoTab c={activeCase} onGoToDocs={() => setActiveTab(2)} onGoToAI={() => setActiveTab(3)} onRemind={handleRemind} />}
            {activeTab === 1 && <EventsTab c={activeCase} />}
            {activeTab === 3 && <AskAITab c={activeCase} />}
            {activeTab === 4 && (
              <YourLawyerTab
                c={activeCase}
                caseId={activeCase.id}
                caseTitle={activeCase.title}
                caseCategory={activeCase.category}
                walletBalance={user.walletBalance}
                activeReviewTicket={activeReviewTicket}
                onOpenProfile={handleOpenLawyerProfile}
                onCreateReviewTicket={handleCreateReviewTicket}
                onAssignPlatformLawyer={handleAssignPlatformLawyer}
                onAddOwnLawyer={handleAddOwnLawyer}
              />
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      )}

      {/* -- Case Actions bottom sheet (3-dot menu) -- */}
      <CaseActionsSheet
        visible={actionsSheetOpen}
        onClose={() => setActionsSheetOpen(false)}
        caseId={activeCaseId}
        caseTitle={activeCase.title}
        onEditCaseDetails={(caseId) => {
          router.push({
            pathname: '/(tabs)/cases',
            params: { openNew: '1', source: 'edit_case', editCaseId: caseId, category: activeCase.category },
          });
        }}
      />
    </View>
  );
}

// --- Main Styles --------------------------------------------------------------
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.bgElevated, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border, flexShrink: 0 },
  backTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  moreBtn: { padding: 4, width: 32, alignItems: 'flex-end', flexShrink: 0 },

  stageStrip: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle, backgroundColor: Colors.bgPrimary },
  stageTrack: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stageSegment: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stageDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stageDotActive: { backgroundColor: Colors.gold },
  stageDotPulse: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.bgPrimary },
  stageLine: { flex: 1, height: 2, backgroundColor: Colors.border },
  stageLineActive: { backgroundColor: Colors.gold },
  stageLabelRow: { flexDirection: 'row' },
  stageLbl: { flex: 1, fontSize: 9, color: Colors.textTertiary, textAlign: 'center' },
  stageLblDone: { color: Colors.textTertiary },
  stageLblActive: { color: Colors.gold, fontWeight: '800' },

  tabBar: {
    backgroundColor: Colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 20,
    elevation: 12,
  },
  tabContent: { paddingHorizontal: 12, gap: 2 },
  tab: { paddingHorizontal: 14, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  tabTxtActive: { color: Colors.primary, fontWeight: '700' },
  tabBody: { padding: 16 },
  docsContainer: { flex: 1 },
  docsBody: { flex: 1, padding: 16 },
});

// --- Case Selector Styles -----------------------------------------------------
const cs = StyleSheet.create({
  wrap: { backgroundColor: Colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle, paddingTop: 10 },
  row: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 110 },
  tabActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  tabDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  tabTxt: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabTxtActive: { color: Colors.primary },
  addTab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed', backgroundColor: Colors.primarySubtle },
  addTxt: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  otherPill: { alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8 },
  otherTxt: { fontSize: 10, color: Colors.textTertiary },
});

// --- What To Do Tab Styles ----------------------------------------------------
const td = StyleSheet.create({
  root: { gap: 14 },
  nextCard: { borderRadius: 18, padding: 16, gap: 14, borderWidth: 1 },
  nextTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  nextIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nextLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  nextAction: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 22 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, height: 44 },
  nextBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  hearingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(59,91,219,0.25)' },
  hearingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hearingLabel: { fontSize: 11, color: Colors.textSecondary },
  hearingDate: { fontSize: 17, fontWeight: '800', color: Colors.primary, marginTop: 2 },
  hearingCountdown: { fontSize: 12, fontWeight: '700', color: Colors.success, marginTop: 2 },
  remindBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  remindTxt: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusCard: { flex: 1, minWidth: '44%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 12, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.border },
  statusIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statusTop: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  statusBot: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', letterSpacing: 0.2 },

  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  sectionSub: { fontSize: 12, color: Colors.textSecondary, marginTop: -4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: Colors.border },
  actionDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  actionTask: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  actionDue: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  actionTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  actionTagTxt: { fontSize: 10, fontWeight: '700' },

  aiCard: { backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: Colors.gold, borderWidth: 1, borderColor: Colors.goldSubtle, gap: 10 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiTitle: { fontSize: 15, fontWeight: '800', color: Colors.gold },
  aiText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  stepsBlock: { gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumTxt: { fontSize: 10, fontWeight: '700', color: Colors.gold },
  stepTxt: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 19 },
  aiCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: Colors.primarySubtle, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  aiCtaTxt: { fontSize: 12, fontWeight: '700', color: Colors.primary },

  similarRow: { flexDirection: 'row', gap: 10 },
  simCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 12, borderWidth: 1.5, gap: 5 },
  simResult: { fontSize: 11, fontWeight: '800' },
  simProb: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  simNote: { fontSize: 11, color: Colors.textSecondary, lineHeight: 16 },

  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.bgSecondary, borderRadius: 14, height: 48, borderWidth: 1 },
  quickBtnTxt: { fontSize: 13, fontWeight: '700' },
});

// --- Events Styles ------------------------------------------------------------
const ev = StyleSheet.create({
  root: { gap: 0 },
  intro: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyTxt: { fontSize: 13, color: Colors.textSecondary },
  row: { flexDirection: 'row', gap: 14 },
  lineCol: { alignItems: 'center', width: 20 },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 16 },
  line: { flex: 1, width: 2, backgroundColor: Colors.borderSubtle, marginVertical: 4 },
  content: { flex: 1, paddingBottom: 16 },
  date: { fontSize: 11, color: Colors.textTertiary, marginTop: 14, marginBottom: 6 },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: Colors.border, gap: 7 },
  urgentCard: { borderColor: Colors.danger, borderWidth: 1.5, backgroundColor: 'rgba(248,81,73,0.04)' },
  title: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  desc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  actionBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningSubtle, borderRadius: 7, padding: 7 },
  actionBannerTxt: { color: Colors.warning, fontSize: 11, fontWeight: '600' },
  peopleRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  personChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  personTxt: { fontSize: 10, color: Colors.textTertiary },
});

// --- Docs Styles --------------------------------------------------------------
const dc = StyleSheet.create({
  root: { gap: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  folderCard: { width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  folderIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  folderName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  folderCount: { fontSize: 12, color: Colors.textSecondary },
  docList: { gap: 8, marginBottom: 14 },
  docRowMini: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 11, borderWidth: 1, borderColor: Colors.border },
  folderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backFolderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primarySubtle, borderRadius: 999, borderWidth: 1, borderColor: Colors.primary + '44', paddingHorizontal: 10, paddingVertical: 6 },
  backFolderTxt: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  folderHeaderTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  searchInput: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 13,
    marginBottom: 10,
  },
  uploadRow: { marginBottom: 14 },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 50, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  uploadBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  filterTxt: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  filterTxtActive: { color: Colors.primary, fontWeight: '700' },
  sortRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sortChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary },
  sortChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  sortChipTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  sortChipTxtActive: { color: Colors.primary, fontWeight: '700' },
  // Extra bottom room keeps last rows tappable above the global floating action button.
  listContent: { paddingBottom: 130 },
  docCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: 13, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  docIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4, marginTop: 2 },
  docName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  docMeta: { fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 6 },
  tagChip: { fontSize: 10, color: Colors.primary, fontWeight: '700', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: Colors.primarySubtle },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  statusBadge: { fontSize: 10, fontWeight: '700', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusVerified: { color: Colors.success, backgroundColor: Colors.successSubtle },
  statusPending: { color: Colors.warning, backgroundColor: Colors.warningSubtle },
  toggleReadyBtn: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  toggleReadyTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, marginBottom: 10 },
  emptyBtn: { height: 36, borderRadius: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary },
  emptyBtnTxt: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  emptyTxt: { fontSize: 13, color: Colors.textSecondary },
  uploadModalLayer: { ...StyleSheet.absoluteFillObject },
  uploadModalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  uploadModalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  uploadModalTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  uploadOption: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, borderRadius: 10, paddingHorizontal: 10, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  uploadOptionTxt: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  modalSub: { color: Colors.textSecondary, fontSize: 11, marginBottom: 8 },
  folderChipRow: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  folderChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  folderChipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  folderChipTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  folderChipTxtActive: { color: Colors.primary, fontWeight: '700' },
  readOnlyPill: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 9, paddingVertical: 4 },
  readOnlyTxt: { color: Colors.textTertiary, fontSize: 10, fontWeight: '600' },
  tagHint: { color: Colors.textTertiary, fontSize: 11, marginTop: 8, lineHeight: 17 },
  closeUploadBtn: { marginTop: 12, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  closeUploadTxt: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
});

// --- AI Tab Styles ------------------------------------------------------------
const ai = StyleSheet.create({
  root: { gap: 13 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.goldSubtle },
  bannerIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: '800', color: Colors.gold },
  bannerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
  stratLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase' },
  stratText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: Colors.goldSubtle },
  qLabel: { fontSize: 10, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase' },
  qBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  qTxt: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  openBtn: { borderRadius: 13, overflow: 'hidden', marginTop: 4 },
  openGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15 },
  openTxt: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

// --- Lawyer Styles ------------------------------------------------------------
const lw = StyleSheet.create({
  root: { gap: 14 },
  card: { flexDirection: 'row', gap: 14, backgroundColor: Colors.bgSecondary, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  desig: { fontSize: 11, color: Colors.textSecondary, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rating: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  ratingCount: { fontSize: 10, color: Colors.textTertiary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textTertiary },
  exp: { fontSize: 10, color: Colors.textTertiary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 11, color: Colors.textSecondary },
  ctaRow: { flexDirection: 'row', gap: 10 },
  callBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: Colors.primary, borderRadius: 13, height: 50, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  callTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primarySubtle, borderRadius: 13, height: 50, borderWidth: 1.5, borderColor: Colors.primary },
  chatTxt: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  statLbl: { fontSize: 10, color: Colors.textSecondary, marginTop: 3 },
  statDiv: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  courtsBlock: { gap: 8 },
  blockLabel: { fontSize: 9, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.8, textTransform: 'uppercase' },
  courtRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: Colors.bgSecondary, borderRadius: 10, padding: 11, borderWidth: 1, borderColor: Colors.border },
  courtName: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  courtSince: { fontSize: 11, color: Colors.textTertiary },
  changeBox: { backgroundColor: Colors.warningSubtle, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.warning + '30', gap: 6 },
  reviewBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary + '40', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 2 },
  reviewBadgeTxt: { color: Colors.primary, fontSize: 10, fontWeight: '700' },
  changeTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  changeSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginTop: 4, borderWidth: 1, borderColor: Colors.warning + '40' },
  changeTxt: { fontSize: 12, fontWeight: '700', color: Colors.warning },
  disabledBtn: { opacity: 0.55 },
  escalateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9, backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary + '44' },
  escalateTxt: { fontSize: 11, fontWeight: '700', color: Colors.primary },
});
