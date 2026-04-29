import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import * as DocumentPicker from 'expo-document-picker';
import { useCaseStore } from '../../store/useCaseStore';

type CaseDocType = 'document' | 'audio' | 'video' | 'chat' | 'official';
type RoleType = 'user' | 'lawyer';

const CASE_META: Record<string, { color: string; icon: string; label: string }> = {
  matrimonial: { color: Colors.danger, icon: 'favorite', label: 'Matrimonial' },
  employment: { color: Colors.primary, icon: 'work', label: 'Employment' },
  property: { color: Colors.success, icon: 'home-work', label: 'Property' },
  criminal: { color: Colors.warning, icon: 'gavel', label: 'Criminal' },
  civil: { color: Colors.gold, icon: 'account-balance', label: 'Civil' },
};

const DOC_META: Record<CaseDocType, { label: string; icon: string; color: string }> = {
  document: { label: 'Docs', icon: 'description', color: Colors.primary },
  audio: { label: 'Audio', icon: 'graphic-eq', color: Colors.gold },
  video: { label: 'Video', icon: 'videocam', color: Colors.warning },
  chat: { label: 'Chats', icon: 'chat', color: Colors.blue },
  official: { label: 'Official', icon: 'account-balance', color: Colors.success },
};

export default function DocumentsScreen() {
  const { cases, addDocument, deleteDocument, updateDocument } = useCaseStore();
  const currentRole: RoleType = 'user';

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | CaseDocType>('all');
  const [query, setQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<CaseDocType>('document');
  const [uploadCaseId, setUploadCaseId] = useState<string | null>(null);

  const totalDocuments = useMemo(
    () => cases.reduce((sum, c) => sum + (Array.isArray(c.documents) ? c.documents.length : 0), 0),
    [cases]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    cases.forEach((c) => {
      const key = String(c.category || 'general').toLowerCase();
      const docs = Array.isArray(c.documents) ? c.documents.length : 0;
      counts.set(key, (counts.get(key) || 0) + docs);
    });
    return counts;
  }, [cases]);

  const caseCards = useMemo(
    () =>
      cases
        .filter((c) => selectedCategory === 'all' || String(c.category || '').toLowerCase() === selectedCategory)
        .map((c) => {
          const key = String(c.category || 'general').toLowerCase();
          const meta = CASE_META[key] ?? { color: Colors.primary, icon: 'folder', label: c.category || 'General' };
          return {
            id: c.id,
            name: c.title || `${meta.label} Case`,
            count: Array.isArray(c.documents) ? c.documents.length : 0,
            color: meta.color,
            icon: meta.icon,
            categoryKey: key,
          };
        }),
    [cases, selectedCategory]
  );

  const activeCase = useMemo(
    () => (activeCaseId ? cases.find((c) => c.id === activeCaseId) ?? null : null),
    [cases, activeCaseId]
  );

  const filteredDocs = useMemo(() => {
    if (!activeCase) return [];
    const docs = (activeCase.documents ?? []) as any[];
    const q = query.trim().toLowerCase();
    return docs
      .filter((d) => (selectedFilter === 'all' ? true : d.type === selectedFilter))
      .filter((d) => {
        if (!q) return true;
        const name = String(d.name || '').toLowerCase();
        const tags = Array.isArray(d.tags) ? d.tags.map((t: string) => t.toLowerCase()) : [];
        return name.includes(q) || tags.some((tag: string) => tag.includes(q));
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [activeCase, selectedFilter, query]);

  const ensureUploadCase = useCallback(() => {
    if (activeCaseId) {
      setUploadCaseId(activeCaseId);
      setShowUploadModal(true);
      return;
    }
    if (cases.length === 0) {
      Alert.alert('No Cases', 'Create a case first to upload documents.');
      return;
    }
    setUploadCaseId(cases[0].id);
    setShowUploadModal(true);
  }, [activeCaseId, cases]);

  const handleUpload = useCallback(async () => {
    if (!uploadCaseId) return;
    const targetCase = cases.find((c) => c.id === uploadCaseId);
    if (!targetCase) return;
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (result.canceled) return;
    const file = result.assets?.[0];
    if (!file) return;
    const ext = (file.name?.split('.').pop() || '').toLowerCase();
    let finalType: CaseDocType = uploadType;
    if (uploadType === 'document') {
      if (['mp3', 'wav'].includes(ext)) finalType = 'audio';
      else if (['mp4', 'mov'].includes(ext)) finalType = 'video';
      else if (['jpg', 'jpeg', 'png', 'webp', 'txt'].includes(ext)) finalType = 'chat';
      else if (['pdf', 'doc', 'docx'].includes(ext)) finalType = 'document';
      else finalType = 'official';
    }
    addDocument(uploadCaseId, {
      name: file.name ?? 'Document',
      type: finalType,
      subtype: uploadType,
      format: ext || 'unknown',
      caseId: uploadCaseId,
      caseTag: String(targetCase.chips?.[0] ?? targetCase.title ?? 'General'),
      tags: finalType === 'chat' ? ['Communication Proof'] : finalType === 'official' ? ['Identity Proof'] : finalType === 'video' || finalType === 'audio' ? ['Evidence'] : ['Case Document'],
      uploadedBy: currentRole,
      verificationStatus: finalType === 'official' ? 'verified' : 'pending',
      courtReady: finalType === 'official',
      size: typeof file.size === 'number' ? file.size : Number(file.size) || 0,
      uri: file.uri,
    });
    setShowUploadModal(false);
  }, [uploadCaseId, cases, uploadType, addDocument, currentRole]);

  const handleDelete = useCallback((doc: any) => {
    if (!activeCase?.id) return;
    if (doc.uploadedBy !== currentRole) {
      Alert.alert('Permission denied', 'You can only delete documents uploaded by you.');
      return;
    }
    deleteDocument(activeCase.id, doc.id);
  }, [activeCase, currentRole, deleteDocument]);

  const handleEdit = useCallback((doc: any) => {
    if (!activeCase?.id) return;
    if (doc.uploadedBy !== currentRole) {
      Alert.alert('Read-only', 'Lawyer shared files are read-only for you.');
      return;
    }
    updateDocument(activeCase.id, doc.id, {
      verificationStatus: doc.verificationStatus === 'verified' ? 'pending' : 'verified',
      courtReady: !doc.courtReady,
    });
  }, [activeCase, currentRole, updateDocument]);

  const formatFileSize = (size: unknown): string => {
    const bytes = typeof size === 'number' && Number.isFinite(size) ? size : Number(size);
    if (!Number.isFinite(bytes) || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  };

  const categoryChips = useMemo(() => {
    const chips = [{ key: 'all', label: `All (${totalDocuments})` }];
    Array.from(categoryCounts.entries()).forEach(([key, count]) => {
      const label = CASE_META[key]?.label ?? `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      chips.push({ key, label: `${label} (${count})` });
    });
    return chips;
  }, [categoryCounts, totalDocuments]);

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <Text style={s.title}>Documents</Text>
        <TouchableOpacity style={s.uploadBtn} onPress={ensureUploadCase} activeOpacity={0.85}>
          <MaterialIcons name="add" size={18} color={Colors.primary} />
          <Text style={s.uploadTxt}>Upload</Text>
        </TouchableOpacity>
      </View>

      {!activeCase ? (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.metricsRow}>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>{cases.length}</Text>
              <Text style={s.metricLabel}>Total Cases</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricValue}>{totalDocuments}</Text>
              <Text style={s.metricLabel}>Total Documents</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {categoryChips.map((chip) => (
              <TouchableOpacity
                key={chip.key}
                style={[s.chip, selectedCategory === chip.key && s.chipActive]}
                onPress={() => setSelectedCategory(chip.key)}
                activeOpacity={0.85}
              >
                <Text style={[s.chipTxt, selectedCategory === chip.key && s.chipTxtActive]}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.sectionTitle}>Case Folders</Text>
          <View style={s.folderGrid}>
            {caseCards.map((folder) => (
              <TouchableOpacity key={folder.id} style={s.folderCard} activeOpacity={0.85} onPress={() => setActiveCaseId(folder.id)}>
                <View style={[s.folderIcon, { backgroundColor: folder.color + '22' }]}>
                  <MaterialIcons name={folder.icon as any} size={24} color={folder.color} />
                </View>
                <Text style={s.folderName} numberOfLines={2}>{folder.name}</Text>
                <Text style={s.folderCount}>{folder.count} file{folder.count === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View style={s.caseManagerRoot}>
          <View style={s.caseManagerHeader}>
            <TouchableOpacity style={s.backBtn} onPress={() => setActiveCaseId(null)} activeOpacity={0.85}>
              <MaterialIcons name="arrow-back" size={16} color={Colors.primary} />
              <Text style={s.backTxt}>All Cases</Text>
            </TouchableOpacity>
            <Text style={s.caseTitle} numberOfLines={1}>{activeCase.title}</Text>
          </View>

          <TextInput
            style={s.searchInput}
            placeholder="Search files or tags"
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
            {(['all', 'document', 'audio', 'video', 'chat', 'official'] as const).map((f) => (
              <TouchableOpacity key={f} style={[s.filter, selectedFilter === f && s.filterActive]} onPress={() => setSelectedFilter(f)} activeOpacity={0.85}>
                <Text style={[s.filterTxt, selectedFilter === f && s.filterTxtActive]}>
                  {{ all: 'All', document: 'Docs', audio: 'Audio', video: 'Video', chat: 'Chats', official: 'Official' }[f]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.uploadRow}>
            <TouchableOpacity style={s.addEvidenceBtn} activeOpacity={0.85} onPress={ensureUploadCase}>
              <MaterialIcons name="upload" size={16} color="#fff" />
              <Text style={s.addEvidenceTxt}>Add Evidence</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredDocs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.docListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: doc }) => {
              const type = (doc.type || 'document') as CaseDocType;
              const meta = DOC_META[type] ?? DOC_META.document;
              const canEdit = doc.uploadedBy === currentRole;
              const canDelete = doc.uploadedBy === currentRole;
              const statusText = doc.verificationStatus === 'verified' ? 'Verified' : 'Pending';
              return (
                <View style={s.docRow}>
                  <View style={[s.docIcon, { backgroundColor: meta.color + '22' }]}>
                    <MaterialIcons name={meta.icon as any} size={20} color={meta.color} />
                  </View>
                  <View style={s.docInfo}>
                    <Text style={s.docName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={s.docMeta}>
                      {formatFileSize(doc.size)} · {new Date(doc.createdAt || Date.now()).toLocaleDateString('en-IN')} · Uploaded by {doc.uploadedBy === 'lawyer' ? 'Lawyer' : 'User'}
                    </Text>
                    <View style={s.statusRow}>
                      <Text style={[s.statusBadge, doc.verificationStatus === 'verified' ? s.statusVerified : s.statusPending]}>{statusText}</Text>
                      <Text style={[s.statusBadge, doc.courtReady ? s.statusVerified : s.statusPending]}>{doc.courtReady ? 'Court Ready' : 'Needs Action'}</Text>
                    </View>
                  </View>
                  <View style={s.actionsCol}>
                    {canEdit ? (
                      <TouchableOpacity onPress={() => handleEdit(doc)} hitSlop={8}>
                        <MaterialIcons name="edit" size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => Alert.alert('Download', 'Document download started (mock).')} hitSlop={8}>
                      <MaterialIcons name="download" size={17} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    {canDelete ? (
                      <TouchableOpacity onPress={() => handleDelete(doc)} hitSlop={8}>
                        <MaterialIcons name="delete-outline" size={17} color={Colors.danger} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.empty}>
                <MaterialIcons name="folder-open" size={26} color={Colors.textTertiary} />
                <Text style={s.emptyTitle}>No documents found</Text>
                <TouchableOpacity style={s.emptyBtn} onPress={ensureUploadCase} activeOpacity={0.85}>
                  <Text style={s.emptyBtnTxt}>Upload Document</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}

      {showUploadModal ? (
        <View style={s.modalLayer} pointerEvents="box-none">
          <TouchableOpacity style={s.modalBackdrop} onPress={() => setShowUploadModal(false)} activeOpacity={1} />
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Upload Document</Text>
            <Text style={s.modalLabel}>Assign to case</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.caseChipRow}>
              {cases.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.caseChip, uploadCaseId === c.id && s.caseChipActive]}
                  onPress={() => setUploadCaseId(c.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[s.caseChipTxt, uploadCaseId === c.id && s.caseChipTxtActive]} numberOfLines={1}>
                    {c.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.modalLabel}>File type</Text>
            <View style={s.typeRow}>
              {(Object.keys(DOC_META) as CaseDocType[]).map((t) => (
                <TouchableOpacity key={t} style={[s.typeChip, uploadType === t && s.typeChipActive]} onPress={() => setUploadType(t)} activeOpacity={0.85}>
                  <Text style={[s.typeChipTxt, uploadType === t && s.typeChipTxtActive]}>{DOC_META[t].label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={s.primaryCta} onPress={handleUpload} activeOpacity={0.9}>
              <Text style={s.primaryCtaTxt}>Choose File & Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryCta} onPress={() => setShowUploadModal(false)} activeOpacity={0.85}>
              <Text style={s.secondaryCtaTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title:  { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  uploadBtn:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  uploadTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '600' },
  content:{ paddingHorizontal: 16, paddingBottom: 110 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12, marginTop: 4 },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  metricCard: { flex: 1, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border },
  metricValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  metricLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgSecondary },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  chipTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  chipTxtActive: { color: Colors.primary, fontWeight: '700' },
  folderGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  folderCard:{ width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  folderIcon:{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  folderName:{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  folderCount:{ fontSize: 12, color: Colors.textSecondary },
  caseManagerRoot: { flex: 1, paddingHorizontal: 16, paddingBottom: 90 },
  caseManagerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary + '40', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  backTxt: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  caseTitle: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  searchInput: { backgroundColor: Colors.bgSecondary, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 10, color: Colors.textPrimary, fontSize: 13, marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 2, marginBottom: 10 },
  filter: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  filterTxt: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTxtActive: { color: Colors.primary, fontWeight: '700' },
  uploadRow: { marginBottom: 12 },
  addEvidenceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, height: 46 },
  addEvidenceTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  docListContent: { paddingBottom: 120 },
  docRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 12, marginBottom: 10 },
  docIcon:{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docInfo:{ flex: 1 },
  docName:{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  docMeta:{ fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  statusRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  statusBadge: { fontSize: 10, fontWeight: '700', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusVerified: { color: Colors.success, backgroundColor: Colors.successSubtle },
  statusPending: { color: Colors.warning, backgroundColor: Colors.warningSubtle },
  actionsCol: { alignItems: 'center', gap: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 6, marginBottom: 10 },
  emptyBtn: { height: 36, borderRadius: 10, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary },
  emptyBtnTxt: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  modalLayer: { ...StyleSheet.absoluteFillObject },
  modalBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxWidth: 420, width: '100%', alignSelf: 'center', backgroundColor: Colors.bgSecondary, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderTopWidth: 1, borderTopColor: Colors.border, padding: 16 },
  modalTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 10 },
  modalLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 8 },
  caseChipRow: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  caseChip: { maxWidth: 230, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  caseChipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  caseChipTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  caseChipTxtActive: { color: Colors.primary, fontWeight: '700' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.primarySubtle, borderColor: Colors.primary },
  typeChipTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  typeChipTxtActive: { color: Colors.primary, fontWeight: '700' },
  primaryCta: { height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  primaryCtaTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  secondaryCta: { marginTop: 8, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated },
  secondaryCtaTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
});
