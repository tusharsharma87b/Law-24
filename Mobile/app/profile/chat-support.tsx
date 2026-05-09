import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Msg = { id: string; from: 'agent' | 'user'; text: string };

export default function ChatSupportScreen() {
  const { team, topic } = useLocalSearchParams<{ team?: string; topic?: string }>();
  const displayTeam = team ?? 'Support';
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [connecting, setConnecting] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await wait(1200);
      if (cancelled) return;
      setConnecting(false);
      setMessages([
        {
          id: '1',
          from: 'agent',
          text: `You are in queue for the ${displayTeam} team. Reference: ${topic ?? 'GENERAL'}. Average wait under 10 minutes at demo speeds.`,
        },
      ]);
    })();
    return () => {
      cancelled = true;
    };
  }, [displayTeam, topic]);

  const send = async () => {
    const t = input.trim();
    if (!t) return;
    setInput('');
    setMessages((m) => [...m, { id: `u-${Date.now()}`, from: 'user', text: t }]);
    setSending(true);
    try {
      await wait(800);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          from: 'agent',
          text:
            displayTeam === 'Billing'
              ? 'Billing has received your message. We will verify the transaction and reply with next steps.'
              : displayTeam === 'Tech'
                ? 'Tech support suggests: force-close the app, clear cache, and retry OTP. If it persists, we will schedule a callback.'
                : 'Support has noted your case context. A coordinator will review and respond in-app shortly.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenShell title={`${displayTeam} chat`}>
      <Card>
        {connecting ? (
          <View style={s.connectRow}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={s.connectTxt}>Connecting to {displayTeam}…</Text>
          </View>
        ) : null}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[s.bubble, msg.from === 'user' ? s.bubbleUser : s.bubbleAgent]}>
              <Text style={msg.from === 'user' ? s.bubbleUserTxt : s.bubbleAgentTxt}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={Colors.textTertiary}
            editable={!connecting && !sending}
          />
          <TouchableOpacity style={[s.send, sending && { opacity: 0.5 }]} onPress={send} disabled={sending || connecting}>
            <Text style={s.sendTxt}>Send</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  connectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  connectTxt: { color: Colors.textSecondary, fontSize: 13 },
  scroll: { maxHeight: 360 },
  scrollContent: { gap: 10, paddingBottom: 8 },
  bubble: { maxWidth: '92%', padding: 12, borderRadius: 12 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: Colors.primary + '55' },
  bubbleAgent: { alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  bubbleUserTxt: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20 },
  bubbleAgentTxt: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-end' },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgElevated,
  },
  send: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
  sendTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
