import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useCaseStore } from '../../store/useCaseStore';
import { useChatStore } from '../../store/useChatStore';
import { Card, ScreenShell } from './_shared';

export default function ProfileChatScreen() {
  const router = useRouter();
  const cases = useCaseStore((state) => state.cases as any[]);
  const threads = useChatStore((state) => state.threads);
  const getOrCreateThread = useChatStore((state) => state.getOrCreateThread);

  const startChat = () => {
    const targetCase = cases.find((c) => c.lawyer?.name);
    if (!targetCase) return;
    const thread = getOrCreateThread({
      caseId: targetCase.id,
      lawyerId: targetCase.lawyer?.id ?? targetCase.lawyer?.lawyerId ?? 'lawyer-default',
      lawyerName: targetCase.lawyer?.name ?? 'Assigned Lawyer',
    });
    router.push(`/chat/${thread.id}` as any);
  };

  return (
    <ScreenShell title="Chat Screen">
      <View style={{ gap: 12 }}>
        <Card>
          <TouchableOpacity style={s.primaryBtn} onPress={startChat} activeOpacity={0.85}>
            <Text style={s.primaryTxt}>Start / Resume Chat</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <FlatList
            data={threads}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.row} onPress={() => router.push(`/chat/${item.id}` as any)} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={s.title}>{item.lawyerName}</Text>
                  <Text style={s.meta}>Case: {item.caseId} • Messages: {item.messages.length}</Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={s.sep} />}
            ListEmptyComponent={<Text style={s.empty}>No active chats.</Text>}
          />
        </Card>
      </View>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  primaryBtn: { height: 42, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  row: { paddingVertical: 10 },
  title: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
  empty: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginVertical: 10 },
});

