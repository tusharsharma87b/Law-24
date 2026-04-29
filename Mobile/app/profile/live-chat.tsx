import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Card, ScreenShell } from './_shared';

type Topic = 'CASE' | 'PAYMENT' | 'TECH' | null;

const AUTO: Record<NonNullable<Topic>, string> = {
  CASE:
    'Thanks for reaching out. For case status and next steps, our Support team reviews every matter within a few hours. I can connect you to a human specialist now.',
  PAYMENT:
    'We have logged a billing context. Refunds and invoices are handled by our Billing team. I can route you to a billing agent for invoice or payment issues.',
  TECH:
    'For app crashes, login issues, or OTP problems, our Technical team can troubleshoot with you in real time. I can escalate this chat to Tech support.',
};

export default function LiveChatScreen() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const pick = (t: NonNullable<Topic>) => {
    setTopic(t);
    setStep(2);
  };

  const escalate = () => {
    if (!topic) return;
    const team = topic === 'CASE' ? 'Support' : topic === 'PAYMENT' ? 'Billing' : 'Tech';
    router.push({ pathname: '/profile/chat-support', params: { team, topic } } as any);
  };

  return (
    <ScreenShell title="Live Chat">
      <Card>
        {step === 1 && (
          <View style={s.block}>
            <Text style={s.question}>What do you need help with?</Text>
            <TouchableOpacity style={s.option} onPress={() => pick('CASE')} activeOpacity={0.85}>
              <Text style={s.optionTxt}>Case issue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.option} onPress={() => pick('PAYMENT')} activeOpacity={0.85}>
              <Text style={s.optionTxt}>Payment issue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.option} onPress={() => pick('TECH')} activeOpacity={0.85}>
              <Text style={s.optionTxt}>Technical issue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && topic && (
          <View style={s.block}>
            <Text style={s.botLabel}>Law24 Assistant</Text>
            <Text style={s.auto}>{AUTO[topic]}</Text>
            <TouchableOpacity style={s.primary} onPress={() => setStep(3)} activeOpacity={0.85}>
              <Text style={s.primaryTxt}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && topic && (
          <View style={s.block}>
            <Text style={s.question}>Need a person?</Text>
            <Text style={s.sub}>
              This is not a lawyer consultation. You will join the internal support queue for Law24 platform help only.
            </Text>
            <TouchableOpacity style={s.primary} onPress={escalate} activeOpacity={0.85}>
              <Text style={s.primaryTxt}>Talk to human support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.secondary} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={s.secondaryTxt}>Done for now</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  block: { gap: 12 },
  question: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  sub: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 8 },
  option: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionTxt: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  botLabel: { color: Colors.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  auto: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  primary: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: { paddingVertical: 12, alignItems: 'center' },
  secondaryTxt: { color: Colors.textTertiary, fontSize: 14, fontWeight: '600' },
});
