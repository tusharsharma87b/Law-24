import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import {
  NOTICE_TEMPLATES,
  buildNoticeBody,
  defaultNoticeFields,
  mockNoticePdfFilename,
  type NoticeFields,
  type NoticeTemplateId,
} from '../constants/nyayaLegalNotices';

const IDS: NoticeTemplateId[] = [
  'salary_recovery',
  'divorce_maintenance',
  'property_dispute',
  'consumer_complaint',
  'tenant_eviction',
  'fraud_recovery',
];

function parseTemplateId(raw?: string): NoticeTemplateId {
  if (raw && IDS.includes(raw as NoticeTemplateId)) return raw as NoticeTemplateId;
  return 'salary_recovery';
}

export default function NyayaNoticeScreen() {
  const router = useRouter();
  const { templateId: rawId } = useLocalSearchParams<{ templateId?: string }>();
  const templateId = useMemo(() => parseTemplateId(rawId), [rawId]);
  const meta = NOTICE_TEMPLATES[templateId];

  const [fields, setFields] = useState<NoticeFields>(() => defaultNoticeFields(templateId));
  const [busy, setBusy] = useState<'pdf' | 'send' | null>(null);

  useEffect(() => {
    setFields(defaultNoticeFields(templateId));
  }, [templateId]);

  const body = useMemo(() => buildNoticeBody(templateId, fields), [templateId, fields]);

  const set = (k: keyof NoticeFields, v: string | number) => {
    setFields((f) => ({ ...f, [k]: v }));
  };

  const onDownloadPdf = () => {
    setBusy('pdf');
    setTimeout(() => {
      setBusy(null);
      Alert.alert(
        'Download (demo)',
        `A PDF would be generated: ${mockNoticePdfFilename(templateId)}\n\nIn production this would open your device share sheet or save to Files.`
      );
    }, 600);
  };

  const onSend = () => {
    setBusy('send');
    setTimeout(() => {
      setBusy(null);
      Alert.alert('Sent (demo)', 'Notice would be sent by email / WhatsApp / registered post per your choice.');
    }, 600);
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.85}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>
          Legal notice
        </Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.meta}>{meta.title}</Text>
        <Text style={s.hint}>Edit all fields. Have a lawyer review before sending in real matters.</Text>

        <Text style={s.label}>Your name</Text>
        <TextInput style={s.input} value={fields.senderName} onChangeText={(t) => set('senderName', t)} placeholderTextColor={Colors.textTertiary} />

        <Text style={s.label}>Your address</Text>
        <TextInput style={[s.input, s.tall]} value={fields.senderAddress} onChangeText={(t) => set('senderAddress', t)} multiline placeholderTextColor={Colors.textTertiary} />

        <Text style={s.label}>Receiver name</Text>
        <TextInput style={s.input} value={fields.receiverName} onChangeText={(t) => set('receiverName', t)} placeholderTextColor={Colors.textTertiary} />

        <Text style={s.label}>Receiver address</Text>
        <TextInput style={[s.input, s.tall]} value={fields.receiverAddress} onChangeText={(t) => set('receiverAddress', t)} multiline placeholderTextColor={Colors.textTertiary} />

        <Text style={s.label}>Subject</Text>
        <TextInput style={s.input} value={fields.subject} onChangeText={(t) => set('subject', t)} placeholderTextColor={Colors.textTertiary} />

        <Text style={s.label}>Compliance period (days)</Text>
        <TextInput
          style={s.input}
          value={String(fields.complianceDays)}
          onChangeText={(t) => {
            const n = parseInt(t.replace(/\D/g, ''), 10);
            set('complianceDays', Number.isFinite(n) ? Math.min(30, Math.max(7, n)) : 15);
          }}
          keyboardType="number-pad"
          placeholderTextColor={Colors.textTertiary}
        />

        <Text style={s.label}>Preview</Text>
        <View style={s.preview}>
          <Text style={s.previewTxt}>{body}</Text>
        </View>

        <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={onDownloadPdf} disabled={busy !== null} activeOpacity={0.85}>
          <MaterialIcons name="picture-as-pdf" size={20} color="#fff" />
          <Text style={s.btnTxt}>{busy === 'pdf' ? 'Preparing…' : 'Download PDF (mock)'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.btn, s.btnSecondary]} onPress={onSend} disabled={busy !== null} activeOpacity={0.85}>
          <MaterialIcons name="send" size={20} color={Colors.primary} />
          <Text style={[s.btnTxt, { color: Colors.primary }]}>{busy === 'send' ? 'Sending…' : 'Send (mock)'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },
  meta: { fontSize: 15, fontWeight: '700', color: Colors.gold, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  label: { fontSize: 12, color: Colors.textTertiary, marginBottom: 6, marginTop: 10, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgSecondary,
  },
  tall: { minHeight: 72, textAlignVertical: 'top' },
  preview: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  previewTxt: { fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginTop: 14,
  },
  btnPrimary: { backgroundColor: Colors.primary },
  btnSecondary: { backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.primary },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
