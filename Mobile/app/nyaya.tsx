import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { MOCK_QUICK_PROMPTS } from '../constants/mockData';
import { buildNyayaResponseFromQuery } from '../constants/nyayaLegalIntelligence';
import type { NoticeTemplateId } from '../constants/nyayaLegalNotices';
import { useNyayaStore } from '../store/useNyayaStore';
import { NYAYA_FREE_DAILY_LIMIT, useNyayaCreditsStore } from '../store/useNyayaCreditsStore';

export default function NyayaScreen() {
  const router = useRouter();
  const { query: prefillQuery, prefilledQuestion, autoSend } = useLocalSearchParams<{
    query?: string;
    prefilledQuestion?: string;
    autoSend?: string;
  }>();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const { messages, isLoading, addUserMessage, addAIResponse, setLoading, clearSession } = useNyayaStore();
  const ensureDay = useNyayaCreditsStore((st) => st.ensureDay);
  const consumeQuestion = useNyayaCreditsStore((st) => st.consumeQuestion);
  const canAskQuestion = useNyayaCreditsStore((st) => st.canAskQuestion);
  const questionsRemaining = useNyayaCreditsStore((st) => st.questionsRemaining());
  const freeRemainingToday = useNyayaCreditsStore((st) => st.freeRemainingToday());
  const packBalance = useNyayaCreditsStore((st) => st.packBalance);

  useEffect(() => {
    if (prefillQuery && messages.length === 0) {
      setInput(`My issue: ${prefillQuery}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!prefilledQuestion || autoSend !== '1' || messages.length > 0) return;
    setInput(prefilledQuestion);
    const timer = setTimeout(() => {
      ensureDay();
      if (!canAskQuestion()) {
        Alert.alert(
          'No questions left',
          'You have used today’s allowance and pack credits. Buy credits or try again tomorrow.'
        );
        return;
      }
      handleSend(prefilledQuestion);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledQuestion, autoSend, messages.length]);

  const handleSend = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;
    ensureDay();
    if (!canAskQuestion()) {
      Alert.alert(
        'Limit reached',
        'Buy credits from Profile → Nyaya AI, or wait until tomorrow for your free questions.'
      );
      return;
    }
    if (!consumeQuestion()) {
      Alert.alert('Limit reached', 'Could not deduct a credit. Try buying a pack from Profile.');
      return;
    }
    setInput('');
    addUserMessage(query);
    setLoading(true);
    setTimeout(() => {
      const intel = buildNyayaResponseFromQuery(query);
      addAIResponse(intel);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1600);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const openNotice = (templateId: string | null) => {
    if (!templateId) return;
    router.push({
      pathname: '/nyaya-notice',
      params: { templateId: templateId as NoticeTemplateId },
    } as any);
  };

  const blocked = !canAskQuestion() && !isLoading;

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>NyayaAI</Text>
          <Text style={s.headerSub}>INDIA-FOCUSED LEGAL GUIDANCE</Text>
        </View>
        <TouchableOpacity onPress={clearSession} style={s.newBtn}>
          <Text style={s.newBtnTxt}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={s.creditBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.creditBarLabel}>Questions left today</Text>
          <Text style={s.creditBarValue}>{questionsRemaining}</Text>
          <Text style={s.creditBarSub}>
            Free (up to {NYAYA_FREE_DAILY_LIMIT}/day): {freeRemainingToday} · Pack: {packBalance}
          </Text>
        </View>
        <TouchableOpacity style={s.creditBuy} onPress={() => router.push('/profile/buy-credits')} activeOpacity={0.85}>
          <Text style={s.creditBuyTxt}>Buy</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={s.chipsScroll}
        contentContainerStyle={s.chipsContent}
        keyboardShouldPersistTaps="handled"
      >
        {MOCK_QUICK_PROMPTS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[s.chip, blocked && s.chipDisabled]}
            onPress={() => handleSend(p.prompt)}
            activeOpacity={0.8}
            disabled={blocked || isLoading}
          >
            <Text style={s.chipTxt}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        ref={scrollRef}
        style={s.msgList}
        contentContainerStyle={s.msgContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View style={s.emptyState}>
            <View style={s.emptyIcon}>
              <MaterialIcons name="auto-awesome" size={36} color={Colors.gold} />
            </View>
            <Text style={s.emptyTitle}>Ask NyayaAI</Text>
            <Text style={s.emptySub}>
              Plain language — Hindi or English. You get case understanding, Indian statutes (max 3), next steps, optional
              notice draft, and lawyer matches.
            </Text>
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
                <View style={s.aiCardHeader}>
                  <View style={s.aiIconBox}>
                    <MaterialIcons name="auto-awesome" size={18} color={Colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.aiCardTitle}>{msg.response.issue_title}</Text>
                    <View style={s.catPill}>
                      <Text style={s.catPillTxt}>{msg.response.category_label}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.predictionBlock}>
                  <Text style={s.blockLabel}>ORIENTATION SCORE</Text>
                  <Text style={s.predictionPct}>{msg.response.prediction_range}</Text>
                  <Text style={s.predictionSub}>Mock estimate from similar Indian forums — not a court prediction</Text>
                </View>

                <View style={s.block}>
                  <Text style={s.blockLabel}>YOUR SITUATION</Text>
                  <Text style={s.blockText}>{msg.response.case_understanding}</Text>
                </View>

                <View style={s.block}>
                  <Text style={s.blockLabel}>INDIAN LAWS THAT MAY APPLY (TOP {msg.response.legal_mapping.length})</Text>
                  {msg.response.legal_mapping.map((law, i) => (
                    <View key={i} style={s.lawCard}>
                      <Text style={s.lawAct}>{law.act}</Text>
                      <Text style={s.lawPlain}>{law.plainEnglish}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.block}>
                  <Text style={s.blockLabel}>NEXT STEPS</Text>
                  {msg.response.recommended_actions.map((action, i) => (
                    <View key={i} style={s.actionRow}>
                      <Text style={s.actionNum}>{String(i + 1).padStart(2, '0')}</Text>
                      <Text style={s.actionTxt}>{action}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.timeSensRow}>
                  <MaterialIcons name="schedule" size={14} color={Colors.warning} />
                  <Text style={s.timeSensTxt}>{msg.response.time_sensitivity}</Text>
                </View>

                {msg.response.notice_template_id ? (
                  <TouchableOpacity
                    style={s.noticeBtn}
                    onPress={() => openNotice(msg.response!.notice_template_id)}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="description" size={20} color={Colors.gold} />
                    <Text style={s.noticeBtnTxt}>Generate legal notice</Text>
                    <MaterialIcons name="chevron-right" size={20} color={Colors.gold} />
                  </TouchableOpacity>
                ) : null}

                <View style={s.block}>
                  <Text style={s.blockLabel}>LAWYERS FOR YOU (MOCK)</Text>
                  {msg.response.lawyer_cards.map((lawyer) => (
                    <View key={lawyer.id} style={s.lawyerCard}>
                      <View style={s.lawyerTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={s.lawyerName}>{lawyer.name}</Text>
                          <Text style={s.lawyerSpec}>{lawyer.specialization}</Text>
                          <Text style={s.lawyerMeta}>
                            {lawyer.city}, {lawyer.state} · {lawyer.experienceYears} yrs exp. · ★ {lawyer.rating.toFixed(1)}
                          </Text>
                          <Text style={s.lawyerFee}>{lawyer.feeLabel}</Text>
                        </View>
                        <View style={s.tierPill}>
                          <Text style={s.tierPillTxt}>{lawyer.tier}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={s.consultBtn}
                        onPress={() => router.push(`/lawyer/${lawyer.id}` as any)}
                        activeOpacity={0.85}
                      >
                        <Text style={s.consultBtnTxt}>Consult</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <Text style={s.disclaimer}>{msg.response.disclaimer}</Text>

                <TouchableOpacity style={s.lawyerCta} onPress={() => router.push('/(tabs)/lawyers')} activeOpacity={0.85}>
                  <Text style={s.lawyerCtaTxt}>Browse all lawyers</Text>
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
              <Text style={s.typingTxt}>NyayaAI is mapping Indian law…</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={s.inputBar}>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.bgSecondary }}>
          {blocked ? (
            <Text style={s.limitNote}>You’ve reached today’s limit. Tap Buy to add credits or try again tomorrow.</Text>
          ) : null}
          <View style={s.inputRow}>
            <TextInput
              style={[s.textInput, blocked && s.textInputDisabled]}
              value={input}
              onChangeText={setInput}
              placeholder={blocked ? 'Limit reached — buy credits for more' : 'Describe your issue in plain words…'}
              placeholderTextColor={Colors.textTertiary}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              editable={!blocked && !isLoading}
            />
            <TouchableOpacity style={s.micBtn} disabled={blocked}>
              <MaterialIcons name="mic" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sendBtn, (!input.trim() || blocked) && s.sendBtnDim]}
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading || blocked}
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
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  headerSub: { fontSize: 9, color: Colors.textTertiary, letterSpacing: 0.8 },
  newBtn: { backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  newBtnTxt: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  creditBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSecondary,
  },
  creditBarLabel: { color: Colors.textTertiary, fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  creditBarValue: { color: Colors.gold, fontSize: 20, fontWeight: '800', marginTop: 2 },
  creditBarSub: { color: Colors.textSecondary, fontSize: 10, marginTop: 4 },
  creditBuy: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  creditBuyTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  chipsScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  chipsContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: { backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  chipDisabled: { opacity: 0.45 },
  chipTxt: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  msgList: { flex: 1 },
  msgContent: { padding: 16, gap: 16 },
  emptyState: { alignItems: 'center', paddingTop: 48, gap: 14 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primarySubtle,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  userBubbleTxt: { color: Colors.textPrimary, fontSize: 14, lineHeight: 21 },
  aiCard: { backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.goldSubtle },
  aiCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  aiIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.goldSubtle, alignItems: 'center', justifyContent: 'center' },
  aiCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.gold },
  catPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: Colors.bgTertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillTxt: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  predictionBlock: { backgroundColor: Colors.bgTertiary, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 },
  blockLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  predictionPct: { fontSize: 28, fontWeight: '800', color: Colors.gold },
  predictionSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  block: { marginBottom: 12 },
  blockText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 21 },
  lawCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lawAct: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  lawPlain: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'flex-start' },
  actionNum: { fontSize: 13, fontWeight: '700', color: Colors.primary, width: 22 },
  actionTxt: { fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 },
  timeSensRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, backgroundColor: Colors.warningSubtle, borderRadius: 8, padding: 8 },
  timeSensTxt: { fontSize: 12, color: Colors.warning, flex: 1 },
  noticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + '66',
    backgroundColor: Colors.goldSubtle,
    marginBottom: 12,
  },
  noticeBtnTxt: { color: Colors.gold, fontSize: 14, fontWeight: '800' },
  lawyerCard: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lawyerTop: { flexDirection: 'row', gap: 10 },
  lawyerName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  lawyerSpec: { fontSize: 12, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  lawyerMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  lawyerFee: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  tierPill: { backgroundColor: Colors.primarySubtle, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, alignSelf: 'flex-start' },
  tierPillTxt: { fontSize: 10, fontWeight: '800', color: Colors.primary },
  consultBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  disclaimer: { fontSize: 11, color: Colors.textTertiary, fontStyle: 'italic', lineHeight: 17, marginBottom: 12 },
  lawyerCta: { backgroundColor: Colors.bgTertiary, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  lawyerCtaTxt: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typingDots: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 12 },
  typingTxt: { color: Colors.textSecondary, fontSize: 13 },
  inputBar: { backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.borderSubtle },
  limitNote: { color: Colors.warning, fontSize: 12, paddingHorizontal: 12, paddingTop: 8, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.bgTertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textInputDisabled: { opacity: 0.55 },
  micBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDim: { opacity: 0.4 },
});
