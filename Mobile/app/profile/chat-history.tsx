import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useChatStore } from '../../store/useChatStore';
import { useNyayaStore } from '../../store/useNyayaStore';
import { Card, ScreenShell } from './_shared';

export default function ChatHistoryScreen() {
  const router = useRouter();
  const threads = useChatStore((s) => s.threads);
  const nyayaMessages = useNyayaStore((s) => s.messages);

  return (
    <ScreenShell title="Chat history">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={s.list}>
        <Card>
          <Text style={s.sectionTitle}>Nyaya AI</Text>
          <Text style={s.meta}>
            {nyayaMessages.length === 0 ? 'No messages in this session.' : `${nyayaMessages.length} messages in current session.`}
          </Text>
          <TouchableOpacity style={s.btn} onPress={() => router.push('/nyaya')} activeOpacity={0.85}>
            <Text style={s.btnTxt}>Open Nyaya AI</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <Text style={s.sectionTitle}>Lawyer chats</Text>
          {threads.length === 0 ? (
            <Text style={s.meta}>No lawyer conversations yet.</Text>
          ) : (
            threads.map((t) => (
              <TouchableOpacity key={t.id} style={s.row} onPress={() => router.push(`/chat/${t.id}` as any)} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowTitle}>{t.lawyerName}</Text>
                  <Text style={s.meta}>Case {t.caseId}</Text>
                </View>
                <Text style={s.chev}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </Card>
      </ScrollView>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  list: { gap: 12, paddingBottom: 40 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  meta: { color: Colors.textSecondary, fontSize: 13, marginBottom: 10 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  btnTxt: { color: Colors.gold, fontWeight: '700', fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  rowTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  chev: { color: Colors.textTertiary, fontSize: 20, fontWeight: '300' },
});
