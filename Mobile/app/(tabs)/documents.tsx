import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const FOLDERS = [
  { id: 'f1', name: 'Case — Matrimonial', count: 12, color: Colors.danger },
  { id: 'f2', name: 'Case — Employment', count: 5, color: Colors.primary },
  { id: 'f3', name: 'Personal Documents', count: 8, color: Colors.gold },
  { id: 'f4', name: 'Property Papers', count: 3, color: Colors.success },
];

const RECENT_DOCS = [
  { id: 'd1', name: 'Termination Letter.pdf', size: '245 KB', date: '18 Apr', icon: 'picture-as-pdf', color: Colors.danger },
  { id: 'd2', name: 'Employment Contract.pdf', size: '1.2 MB', date: '15 Apr', icon: 'picture-as-pdf', color: Colors.danger },
  { id: 'd3', name: 'Court Order - 12 Apr.pdf', size: '380 KB', date: '12 Apr', icon: 'picture-as-pdf', color: Colors.danger },
  { id: 'd4', name: 'Affidavit Draft.docx', size: '88 KB', date: '10 Apr', icon: 'description', color: Colors.primary },
];

export default function DocumentsScreen() {
  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <Text style={s.title}>Documents</Text>
        <TouchableOpacity style={s.uploadBtn}>
          <MaterialIcons name="add" size={18} color={Colors.primary} />
          <Text style={s.uploadTxt}>Upload</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* FOLDERS */}
        <Text style={s.sectionTitle}>Folders</Text>
        <View style={s.folderGrid}>
          {FOLDERS.map((f) => (
            <TouchableOpacity key={f.id} style={s.folderCard} activeOpacity={0.8}>
              <View style={[s.folderIcon, { backgroundColor: f.color + '22' }]}>
                <MaterialIcons name="folder" size={28} color={f.color} />
              </View>
              <Text style={s.folderName} numberOfLines={2}>{f.name}</Text>
              <Text style={s.folderCount}>{f.count} files</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT */}
        <Text style={s.sectionTitle}>Recent Documents</Text>
        <View style={s.docList}>
          {RECENT_DOCS.map((d) => (
            <TouchableOpacity key={d.id} style={s.docRow} activeOpacity={0.8}>
              <View style={[s.docIcon, { backgroundColor: d.color + '22' }]}>
                <MaterialIcons name={d.icon as any} size={22} color={d.color} />
              </View>
              <View style={s.docInfo}>
                <Text style={s.docName} numberOfLines={1}>{d.name}</Text>
                <Text style={s.docMeta}>{d.size}  ·  {d.date}</Text>
              </View>
              <MaterialIcons name="more-vert" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  title:  { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  uploadBtn:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  uploadTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '600' },
  content:{ paddingHorizontal: 16 },
  sectionTitle:{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12, marginTop: 4 },
  folderGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  folderCard:{ width: '47%', backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  folderIcon:{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  folderName:{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  folderCount:{ fontSize: 12, color: Colors.textSecondary },
  docList:{ gap: 10, marginBottom: 24 },
  docRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  docIcon:{ width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docInfo:{ flex: 1 },
  docName:{ fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  docMeta:{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
