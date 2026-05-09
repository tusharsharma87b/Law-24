import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { buildNyayaResponseFromQuery } from '../constants/nyayaLegalIntelligence';
import { useNyayaStore } from '../store/useNyayaStore';
import { useNyayaCreditsStore } from '../store/useNyayaCreditsStore';

const { width } = Dimensions.get('window');

const QUICK_OPTIONS = [
  { id: 'fir', title: 'FIR help', prompt: 'How do I file an FIR for theft?' },
  { id: 'divorce', title: 'Divorce process', prompt: 'What is the process for mutual consent divorce in India?' },
  { id: 'salary', title: 'Salary not paid', prompt: 'My employer is not paying my salary. What legal action can I take?' },
];

export default function NyayaScreen() {
  const router = useRouter();
  const { query: prefillQuery, aiPrompt, autoSend } = useLocalSearchParams<{
    query?: string;
    aiPrompt?: string;
    autoSend?: string;
  }>();
  
  const [input, setInput] = useState('');
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false);
  const scrollRef = useRef<FlatList>(null);
  
  const { messages, isLoading, addUserMessage, addAIResponse, setLoading, clearSession } = useNyayaStore();
  const ensureDay = useNyayaCreditsStore((st) => st.ensureDay);
  const consumeQuestion = useNyayaCreditsStore((st) => st.consumeQuestion);
  const canAskQuestion = useNyayaCreditsStore((st) => st.canAskQuestion);

  // Handle auto-triggering
  useEffect(() => {
    if (autoSend !== '1' || hasAutoTriggered || messages.length > 0) return;
    const initialQuery = aiPrompt || prefillQuery;
    if (!initialQuery) return;

    setHasAutoTriggered(true);
    setInput(initialQuery);

    const timer = setTimeout(() => {
      handleSend(initialQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [prefillQuery, aiPrompt, autoSend, messages.length, hasAutoTriggered]);

  const handleSend = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;

    ensureDay();
    if (!canAskQuestion()) {
      Alert.alert('Limit reached', 'You have used your free questions. Buy more credits in Profile.');
      return;
    }
    if (!consumeQuestion()) return;

    setInput('');
    addUserMessage(query);
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = buildNyayaResponseFromQuery(query);
      addAIResponse(response);
      setLoading(false);
    }, 1500);
  };

  // Safe auto-scroll
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Nyaya AI</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Always Online</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearSession} style={styles.clearBtn}>
            <MaterialIcons name="refresh" size={22} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={scrollRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={messages.length === 0 && !isLoading ? (
            <View style={styles.welcomeContainer}>
              <View style={styles.aiIconLarge}>
                <MaterialIcons name="auto-awesome" size={40} color={Colors.gold} />
              </View>
              <Text style={styles.welcomeTitle}>Hi 👋 How can I help you?</Text>
              <Text style={styles.welcomeSub}>I can help you understand legal procedures, your rights, and guide you through your situation.</Text>
              
              <View style={styles.quickOptions}>
                {QUICK_OPTIONS.map(opt => (
                  <TouchableOpacity 
                    key={opt.id} 
                    style={styles.quickOpt}
                    onPress={() => handleSend(opt.prompt)}
                  >
                    <Text style={styles.quickOptTxt}>{opt.title}</Text>
                    <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          renderItem={({ item }) => (
            <View 
              style={[
                styles.message,
                item.role === 'user' ? styles.userMsg : styles.aiMsg
              ]}
            >
              <Text style={styles.msgText}>
                {item.text}
              </Text>
              <Text style={styles.time}>{item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          )}
          ListFooterComponent={isLoading ? (
            <View style={[styles.message, styles.aiMsg]}>
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={Colors.gold} />
                <Text style={styles.loadingText}>Nyaya is thinking...</Text>
              </View>
            </View>
          ) : null}
          onContentSizeChange={() => messages.length > 0 && scrollRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputBar}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type your legal query..."
              placeholderTextColor="#94A3B8"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]} 
              onPress={() => handleSend()}
              disabled={!input.trim()}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050A14' },
  header: { backgroundColor: '#0D1117', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerContent: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backBtn: { padding: 4 },
  headerTitleWrap: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 6 },
  onlineText: { fontSize: 11, color: '#22C55E', fontWeight: '500' },
  clearBtn: { padding: 4 },
  container: { flex: 1 },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 32 },
  welcomeContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  aiIconLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(245,166,35,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 12 },
  welcomeSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  quickOptions: { width: '100%', gap: 12 },
  quickOpt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1117', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  quickOptTxt: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500' },
  message: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  aiMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  msgText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  inputBar: { 
    padding: 16, 
    backgroundColor: '#0F172A', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  inputRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    backgroundColor: '#1A2130', 
    borderRadius: 24, 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    gap: 10 
  },
  input: { flex: 1, color: '#fff', fontSize: 15, maxHeight: 100, paddingTop: 8, paddingBottom: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
