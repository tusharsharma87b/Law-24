import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { MOCK_QUICK_PROMPTS, MOCK_AI_RESPONSE } from '../constants/mockData';
import { useNyayaStore } from '../store/useNyayaStore';

export default function NyayaScreen() {
  const router = useRouter();
  const { query: prefillQuery } = useLocalSearchParams<{ query?: string }>();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isLoading, addUserMessage, addAIResponse, setLoading, clearSession } = useNyayaStore();

  // Pre-fill input when navigated from Home smart search (only on fresh session)
  useEffect(() => {
    if (prefillQuery && messages.length === 0) {
      setInput(`My issue: ${prefillQuery}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;
    setInput('');
    addUserMessage(query);
    setLoading(true);
    setTimeout(() => {
      addAIResponse(MOCK_AI_RESPONSE);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1600);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>NyayaAI</Text>
          <Text style={s.headerSub}>YOUR LEGAL ASSISTANT</Text>
        </View>
        <TouchableOpacity onPress={clearSession} style={s.newBtn}>
          <Text style={s.newBtnTxt}>New</Text>
        </TouchableOpacity>
      </View>

      {/* QUICK CHIPS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll} contentContainerStyle={s.chipsContent}>
        {MOCK_QUICK_PROMPTS.map((p) => (
          <TouchableOpacity key={p.id} style={s.chip} onPress={() => handleSend(p.prompt)} activeOpacity={0.8}>
            <Text style={s.chipTxt}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MESSAGES */}
      <ScrollView
        ref={scrollRef}
        style={s.msgList}
        contentContainerStyle={s.msgContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <MaterialIcons name="auto-awesome" size={36} color={Colors.gold} />
            </View>
            <Text style={s.emptyTitle}>Ask NyayaAI</Text>
            <Text style={s.emptySub}>Describe your legal issue in plain language — Hindi or English — and get instant guidance.</Text>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id}>
            {msg.role === 'user' ? (
              <View style={s.userBubble}>
                <Text style={s.userBubbleTxt}>{msg.text}</Text>
              </View>
            ) : msg.response ? (
              <View style={s.aiCard}>
                {/* Header */}
                <View style={s.aiCardHeader}>
                  <View style={s.aiIconBox}>
                    <MaterialIcons name="auto-awesome" size={18} color={Colors.gold} />
                  </View>
                  <Text style={s.aiCardTitle}>{msg.response.issue_title}</Text>
                </View>

                {/* Prediction */}
                <View style={s.predictionBlock}>
                  <Text style={s.blockLabel}>NYAYAAI PREDICTION</Text>
                  <Text style={s.predictionPct}>{msg.response.prediction_range}</Text>
                  <Text style={s.predictionSub}>Based on similar cases in Delhi / Bombay HC</Text>
                </View>

                {/* Legal Basis */}
                <View style={s.block}>
                  <Text style={s.blockLabel}>LEGAL BASIS</Text>
                  <Text style={s.blockText}>{msg.response.legal_basis}</Text>
                  <View style={s.actsRow}>
                    {msg.response.applicable_acts.map((act, i) => (
                      <View key={i} style={s.actChip}>
                        <Text style={s.actChipTxt}>{act}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Actions */}
                <View style={s.block}>
                  <Text style={s.blockLabel}>RECOMMENDED ACTIONS</Text>
                  {msg.response.recommended_actions.map((action, i) => (
                    <View key={i} style={s.actionRow}>
                      <Text style={s.actionNum}>0{i + 1}</Text>
                      <Text style={s.actionTxt}>{action}</Text>
                    </View>
                  ))}
                </View>

                {/* Time sensitivity */}
                <View style={s.timeSensRow}>
                  <MaterialIcons name="schedule" size={14} color={Colors.warning} />
                  <Text style={s.timeSensTxt}>{msg.response.time_sensitivity}</Text>
                </View>

                {/* Disclaimer */}
                <Text style={s.disclaimer}>{msg.response.disclaimer}</Text>

                {/* CTAs */}
                <TouchableOpacity
                  style={s.lawyerCta}
                  onPress={() => router.push('/(tabs)/lawyers')}
                  activeOpacity={0.85}
                >
                  <Text style={s.lawyerCtaTxt}>Consult a Lawyer</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ))}

        {isLoading && (
          <View style={s.loadingRow}>
            <View style={s.aiIconBox}>
              <MaterialIcons name="auto-awesome" size={16} color={Colors.gold} />
            </View>
            <View style={s.typingDots}>
              <ActivityIndicator size="small" color={Colors.gold} />
              <Text style={s.typingTxt}>NyayaAI is analysing…</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* INPUT BAR */}
      <View style={s.inputBar}>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.bgSecondary }}>
          <View style={s.inputRow}>
            <TextInput
              style={s.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Tell your legal issue…"
              placeholderTextColor={Colors.textTertiary}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity style={s.micBtn}>
              <MaterialIcons name="mic" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sendBtn, !input.trim() && s.sendBtnDim]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              activeOpacity={0.85}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backBtn:{ padding: 4 },
  headerCenter:{ flex: 1, alignItems: 'center' },
  headerTitle:{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  headerSub:{ fontSize: 10, color: Colors.textTertiary, letterSpacing: 1 },
  newBtn: { backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  newBtnTxt:{ color: Colors.primary, fontSize: 12, fontWeight: '600' },
  chipsScroll:{ maxHeight: 48, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  chipsContent:{ paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip:   { backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  chipTxt:{ color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  msgList:{ flex: 1 },
  msgContent:{ padding: 16, gap: 16 },
  emptyState:{ alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyIcon:{ width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:{ fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub:{ fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  userBubble:{ alignSelf: 'flex-end', backgroundColor: Colors.primarySubtle, borderRadius: 16, borderBottomRightRadius: 4, padding: 14, maxWidth: '80%', borderWidth: 1, borderColor: Colors.primary + '44' },
  userBubbleTxt:{ color: Colors.textPrimary, fontSize: 14, lineHeight: 21 },
  aiCard: { backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.goldSubtle },
  aiCardHeader:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  aiIconBox:{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  aiCardTitle:{ fontSize: 15, fontWeight: '700', color: Colors.gold, flex: 1 },
  predictionBlock:{ backgroundColor: Colors.bgTertiary, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 14 },
  blockLabel:{ fontSize: 10, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  predictionPct:{ fontSize: 32, fontWeight: '800', color: Colors.gold },
  predictionSub:{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  block:  { marginBottom: 14 },
  blockText:{ fontSize: 13, color: Colors.textPrimary, lineHeight: 21, marginTop: 6 },
  actsRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  actChip:{ backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  actChipTxt:{ fontSize: 11, color: Colors.textSecondary },
  actionRow:{ flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'flex-start' },
  actionNum:{ fontSize: 13, fontWeight: '700', color: Colors.primary, width: 20 },
  actionTxt:{ fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  timeSensRow:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: Colors.warningSubtle, borderRadius: 8, padding: 8 },
  timeSensTxt:{ fontSize: 12, color: Colors.warning, flex: 1 },
  disclaimer:{ fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic', lineHeight: 17, marginBottom: 14 },
  lawyerCta:{ backgroundColor: Colors.primary, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  lawyerCtaTxt:{ color: '#fff', fontSize: 14, fontWeight: '700' },
  loadingRow:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingDots:{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12 },
  typingTxt:{ color: Colors.textSecondary, fontSize: 13 },
  inputBar:{ backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  inputRow:{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  textInput:{ flex: 1, color: Colors.textPrimary, fontSize: 15, maxHeight: 100, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: Colors.bgTertiary, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  micBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sendBtn:{ width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDim:{ opacity: 0.4 },
});
