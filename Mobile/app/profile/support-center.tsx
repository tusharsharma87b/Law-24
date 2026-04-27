import React, { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import {
  SupportTicket,
  SupportTicketType,
  useSupportEngineStore,
} from '../../store/useSupportEngineStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCaseStore } from '../../store/useCaseStore';
import { ScreenShell } from './_shared';

const TYPE_LABEL: Record<SupportTicketType, string> = {
  LAWYER_ISSUE: 'Lawyer Issue',
  PAYMENT: 'Payment',
  CASE_ISSUE: 'Case Issue',
  GENERAL: 'General',
};

const STATUS_COLOR = {
  OPEN: Colors.warning,
  IN_PROGRESS: Colors.primary,
  RESOLVED: Colors.success,
  ESCALATED: Colors.danger,
} as const;

function hoursLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (60 * 60 * 1000)));
}

export default function SupportCenterScreen() {
  const user = useAuthStore((state) => state.user);
  const cases = useCaseStore((state) => state.cases as any[]);
  const {
    tickets,
    supportChatThinking,
    createTicket,
    sendMessageToTicket,
    assignSupportAgent,
    resolveTicket,
    refreshSLAEscalations,
  } = useSupportEngineStore();

  const [ticketType, setTicketType] = useState<SupportTicketType>('GENERAL');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const selectedCase = cases[0];
  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) || tickets[0] || null,
    [tickets, activeTicketId],
  );

  const onCreate = async () => {
    if (!description.trim()) return;
    setCreating(true);
    try {
      const created = await createTicket({
        ticketType,
        title: `${TYPE_LABEL[ticketType]} Request`,
        description: description.trim(),
        plan: user?.plan,
        caseId: selectedCase?.id,
        caseTitle: selectedCase?.title,
        caseStage: selectedCase?.stage,
        lawyerInactivityHours: ticketType === 'LAWYER_ISSUE' ? 52 : 0,
      });
      setActiveTicketId(created.id);
      setDescription('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScreenShell
      title="Support Center"
      right={
        <TouchableOpacity onPress={refreshSLAEscalations} activeOpacity={0.85}>
          <MaterialIcons name="refresh" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      }
    >
      <View style={s.container}>
        <View style={s.panel}>
          <Text style={s.sectionTitle}>Raise Ticket</Text>
          <View style={s.chips}>
            {(Object.keys(TYPE_LABEL) as SupportTicketType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[s.chip, ticketType === type && s.chipActive]}
                onPress={() => setTicketType(type)}
                activeOpacity={0.85}
              >
                <Text style={[s.chipTxt, ticketType === type && s.chipTxtActive]}>
                  {TYPE_LABEL[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Describe your issue..."
            placeholderTextColor={Colors.textTertiary}
            style={s.input}
          />
          <TouchableOpacity
            style={[s.primaryBtn, creating && { opacity: 0.65 }]}
            onPress={onCreate}
            disabled={creating}
            activeOpacity={0.85}
          >
            <Text style={s.primaryTxt}>{creating ? 'Creating...' : 'Create Ticket + AI Reply'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.panel}>
          <Text style={s.sectionTitle}>Real-Time Ticket Tracker</Text>
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            renderItem={({ item }) => <TicketChip ticket={item} active={activeTicket?.id === item.id} onPress={() => setActiveTicketId(item.id)} />}
          />

          {activeTicket ? (
            <View style={s.ticketDetail}>
              <View style={s.rowBetween}>
                <Text style={s.ticketTitle}>{activeTicket.title}</Text>
                <Text style={[s.badge, { color: STATUS_COLOR[activeTicket.status] }]}>
                  {activeTicket.status}
                </Text>
              </View>
              <Text style={s.meta}>
                Priority: {activeTicket.priority} • SLA: {hoursLeft(activeTicket.slaDeadline)}h left
              </Text>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${activeTicket.progress}%` }]} />
              </View>
              <Text style={s.aiLabel}>AI reply</Text>
              <Text style={s.aiText}>{activeTicket.aiResponse}</Text>

              {!!activeTicket.suggestedActions.length && (
                <>
                  <Text style={s.aiLabel}>Suggested Actions</Text>
                  <View style={s.actions}>
                    {activeTicket.suggestedActions.map((action) => (
                      <TouchableOpacity key={action} style={s.actionPill} activeOpacity={0.85}>
                        <Text style={s.actionTxt}>{action}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {!!activeTicket.recommendations?.length && (
                <>
                  <Text style={s.aiLabel}>Lawyer Recommendations</Text>
                  {activeTicket.recommendations.map((rec) => (
                    <Text key={rec.lawyerId} style={s.meta}>
                      {rec.name} • {rec.rating}⭐ • {rec.successRate}% success • INR {rec.pricePerMinInr}/min
                    </Text>
                  ))}
                </>
              )}

              <View style={s.rowButtons}>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => assignSupportAgent(activeTicket.id)} activeOpacity={0.85}>
                  <Text style={s.secondaryTxt}>Talk to Human</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => resolveTicket(activeTicket.id)} activeOpacity={0.85}>
                  <Text style={s.secondaryTxt}>Mark Resolved</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={s.meta}>No tickets yet.</Text>
          )}
        </View>

        <View style={s.panel}>
          <Text style={s.sectionTitle}>Support Chat (AI + Human)</Text>
          {activeTicket ? (
            <>
              <FlatList
                data={activeTicket.messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
                renderItem={({ item }) => (
                  <View
                    style={[
                      s.msgBubble,
                      item.role === 'user'
                        ? s.msgUser
                        : item.role === 'ai'
                          ? s.msgAI
                          : s.msgAgent,
                    ]}
                  >
                    <Text style={s.msgTxt}>{item.text}</Text>
                  </View>
                )}
              />
              {supportChatThinking && <Text style={s.thinking}>AI is thinking...</Text>}
              <View style={s.chatRow}>
                <TextInput
                  style={s.chatInput}
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Type your message..."
                  placeholderTextColor={Colors.textTertiary}
                />
                <TouchableOpacity
                  style={s.send}
                  onPress={async () => {
                    await sendMessageToTicket({ ticketId: activeTicket.id, text: chatInput });
                    setChatInput('');
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={s.meta}>Create a ticket to start support chat.</Text>
          )}
        </View>
      </View>
    </ScreenShell>
  );
}

function TicketChip({
  ticket,
  active,
  onPress,
}: {
  ticket: SupportTicket;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[stylesChip.chip, active && stylesChip.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[stylesChip.title, active && stylesChip.titleActive]} numberOfLines={1}>
        {ticket.title}
      </Text>
      <Text style={stylesChip.meta}>{ticket.priority}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { gap: 12, paddingBottom: 120 },
  panel: {
    backgroundColor: Colors.bgSecondary,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: Colors.bgElevated },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  chipTxt: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  chipTxtActive: { color: Colors.primary },
  input: { minHeight: 88, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, color: Colors.textPrimary, backgroundColor: Colors.bgElevated, textAlignVertical: 'top' },
  primaryBtn: { height: 42, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  ticketDetail: { gap: 8, marginTop: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  ticketTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },
  badge: { fontSize: 11, fontWeight: '800' },
  meta: { color: Colors.textSecondary, fontSize: 11 },
  progressTrack: { height: 6, borderRadius: 999, backgroundColor: Colors.bgElevated, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  aiLabel: { color: Colors.gold, fontSize: 11, fontWeight: '700' },
  aiText: { color: Colors.textPrimary, fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionPill: { borderWidth: 1, borderColor: Colors.border, borderRadius: 999, backgroundColor: Colors.bgElevated, paddingHorizontal: 10, paddingVertical: 6 },
  actionTxt: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  rowButtons: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, height: 36, borderRadius: 8, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  secondaryTxt: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  msgBubble: { maxWidth: '88%', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  msgUser: { alignSelf: 'flex-end', backgroundColor: Colors.primarySubtle, borderWidth: 1, borderColor: `${Colors.primary}44` },
  msgAI: { alignSelf: 'flex-start', backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  msgAgent: { alignSelf: 'flex-start', backgroundColor: Colors.successSubtle, borderWidth: 1, borderColor: `${Colors.success}66` },
  msgTxt: { color: Colors.textPrimary, fontSize: 12, lineHeight: 18 },
  thinking: { color: Colors.gold, fontSize: 11, fontWeight: '600' },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatInput: { flex: 1, height: 38, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, color: Colors.textPrimary, backgroundColor: Colors.bgElevated },
  send: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
});

const stylesChip = StyleSheet.create({
  chip: { width: 160, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgElevated, padding: 8 },
  chipActive: { borderColor: Colors.primary },
  title: { color: Colors.textPrimary, fontSize: 11, fontWeight: '700' },
  titleActive: { color: Colors.primary },
  meta: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
});

