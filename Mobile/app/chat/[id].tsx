import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useChatStore } from '../../store/useChatStore';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [input, setInput] = useState('');
  const thread = useChatStore((s) => s.threads.find((t) => t.id === id));
  const sendMessage = useChatStore((s) => s.sendMessage);

  const messages = useMemo(() => (thread?.messages ?? []).slice().sort((a, b) => a.createdAt - b.createdAt), [thread?.messages]);
  const lawyerName = thread?.lawyerName ?? 'Lawyer';

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back-ios" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{lawyerName}</Text>
          <Text style={s.sub}>Case Chat</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={[s.bubble, item.role === 'user' ? s.userBubble : s.lawyerBubble]}>
            <Text style={s.bubbleTxt}>{item.text}</Text>
          </View>
        )}
      />

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.bgSecondary }}>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textTertiary}
            onSubmitEditing={() => {
              sendMessage({ threadId: id, text: input });
              setInput('');
            }}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && { opacity: 0.45 }]}
            disabled={!input.trim()}
            onPress={() => {
              sendMessage({ threadId: id, text: input });
              setInput('');
            }}
          >
            <MaterialIcons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  title: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  sub: { color: Colors.textTertiary, fontSize: 11 },
  list: { padding: 14, gap: 8, paddingBottom: 20 },
  bubble: { maxWidth: '82%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary + '44' },
  lawyerBubble: { alignSelf: 'flex-start', backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border },
  bubbleTxt: { color: Colors.textPrimary, fontSize: 13, lineHeight: 19 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  input: { flex: 1, backgroundColor: Colors.bgElevated, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});
