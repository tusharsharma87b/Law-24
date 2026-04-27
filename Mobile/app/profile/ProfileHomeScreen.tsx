import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useCaseStore } from '../../store/useCaseStore';
import { useChatStore } from '../../store/useChatStore';
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { sendNotification } from '../../store/useNotificationStore';
import { SupportTicketType, useSupportEngineStore } from '../../store/useSupportEngineStore';

function Row({
  icon,
  label,
  onPress,
  right,
  danger,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={onPress}>
      <MaterialIcons name={icon as any} size={18} color={danger ? Colors.danger : Colors.textSecondary} />
      <Text style={[s.rowText, danger && { color: Colors.danger }]}>{label}</Text>
      {right ?? <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />}
    </TouchableOpacity>
  );
}

export function ProfileHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const wallet = useWalletStore();
  const { cases } = useCaseStore();
  const { getOrCreateThread } = useChatStore();
  const settings = useProfileSettingsStore();
  const { tickets, createTicket, refreshSLAEscalations } = useSupportEngineStore();
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [newTicketType, setNewTicketType] = useState<SupportTicketType>('GENERAL');
  const [raisingTicket, setRaisingTicket] = useState(false);

  const displayName = user?.name ?? 'Law24 Client';
  const displayEmail = user?.email ?? 'client@law24.in';
  const displayPlan = user?.plan ?? 'free';

  const caseForActions = useMemo(() => (cases as any[])[0], [cases]);
  const topSupportTickets = useMemo(() => tickets.slice(0, 2), [tickets]);

  useEffect(() => {
    refreshSLAEscalations();
    const timer = setInterval(refreshSLAEscalations, 60_000);
    return () => clearInterval(timer);
  }, [refreshSLAEscalations]);

  const handleResumeChat = () => {
    if (!caseForActions?.lawyer) {
      Alert.alert('No Lawyer Assigned', 'Assign a lawyer to resume conversation.');
      return;
    }
    const thread = getOrCreateThread({
      caseId: caseForActions.id,
      lawyerId: caseForActions.lawyer.id ?? caseForActions.lawyer.lawyerId ?? 'lawyer-default',
      lawyerName: caseForActions.lawyer.name ?? 'Assigned Lawyer',
    });
    router.push(`/chat/${thread.id}` as any);
  };

  const handleRebookLawyer = () => {
    if (!caseForActions?.lawyer?.id) {
      Alert.alert('Unavailable', 'No lawyer profile found for rebooking.');
      return;
    }
    router.push(`/lawyer/${caseForActions.lawyer.id}` as any);
  };

  const syncNotificationPref = async (key: 'push' | 'email' | 'sms', value: boolean) => {
    setSavingNotifications(true);
    try {
      await settings.setNotificationPrefs({
        push: key === 'push' ? value : settings.pushNotifications,
        email: key === 'email' ? value : settings.emailNotifications,
        sms: key === 'sms' ? value : settings.smsNotifications,
      });
      sendNotification('general', 'Notification preferences updated.', { title: 'Settings Saved' });
    } catch {
      Alert.alert('Update Failed', 'Could not sync notification preference.');
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleDataSharingToggle = async (next: boolean) => {
    setSavingPrivacy(true);
    try {
      await settings.setDataSharingEnabled(next);
      sendNotification('general', `Data sharing ${next ? 'enabled' : 'disabled'}.`, { title: 'Privacy Updated' });
    } catch {
      Alert.alert('Update Failed', 'Could not update privacy preference.');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const raiseSmartTicket = async () => {
    setRaisingTicket(true);
    try {
      await createTicket({
        ticketType: newTicketType,
        title: `${newTicketType.replace('_', ' ')} Request`,
        description:
          newTicketType === 'LAWYER_ISSUE'
            ? 'Lawyer not responding and hearing update pending.'
            : newTicketType === 'PAYMENT'
              ? 'Payment deducted but invoice not visible.'
              : newTicketType === 'CASE_ISSUE'
                ? 'Need clarity on next legal step.'
                : 'Need general support assistance.',
        plan: user?.plan,
        caseId: caseForActions?.id,
        caseTitle: caseForActions?.title,
        caseStage: caseForActions?.stage,
        lawyerInactivityHours: newTicketType === 'LAWYER_ISSUE' ? 52 : 0,
      });
    } finally {
      setRaisingTicket(false);
    }
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <FlatList
        data={[{ id: 'profile-home' }]}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.list}
        renderItem={() => (
          <View style={{ gap: 12 }}>
            <View style={s.headerCard}>
              <Text style={s.name}>{displayName}</Text>
              <Text style={s.email}>{displayEmail}</Text>
              <Text style={s.meta}>Client ID: {user?.clientId ?? '#N/A'} • Plan: {displayPlan.toUpperCase()}</Text>
              <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/profile/edit-profile')}>
                <Text style={s.primaryTxt}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Plan & Wallet</Text>
              <Row icon="workspace-premium" label="Compare & Upgrade Plans" onPress={() => router.push('/profile/plans')} />
              <Row icon="account-balance-wallet" label={`Wallet Balance: INR ${wallet.balance.toLocaleString('en-IN')}`} onPress={() => router.push('/profile/add-money')} />
              <Row icon="receipt-long" label="Invoice List & Download" onPress={() => router.push('/profile/invoice-list')} />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Account</Text>
              <Row icon="person-outline" label="Edit Profile" onPress={() => router.push('/profile/edit-profile')} />
              <Row icon="mail-outline" label="Update Contact (OTP)" onPress={() => router.push('/profile/update-contact')} />
              <Row icon="password" label="Change Password" onPress={() => router.push('/profile/change-password')} />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Security</Text>
              <Row
                icon="shield"
                label="2FA"
                right={<Switch value={settings.twoFAEnabled} onValueChange={(value) => settings.setTwoFAEnabled(value)} />}
              />
              <Row icon="devices" label="Device Management" onPress={() => router.push('/profile/device-list')} />
              <Row icon="history" label="Login History" onPress={() => router.push('/profile/login-history')} />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Activity</Text>
              <Row icon="chat" label="Resume Last Conversation" onPress={handleResumeChat} />
              <Row icon="support-agent" label="Rebook Lawyer" onPress={handleRebookLawyer} />
              <Row icon="timeline" label="View Case Timeline" onPress={() => router.push('/profile/case-timeline')} />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Notifications</Text>
              <Row
                icon="notifications-active"
                label="Push Notifications"
                right={<Switch value={settings.pushNotifications} onValueChange={(value) => syncNotificationPref('push', value)} disabled={savingNotifications} />}
              />
              <Row
                icon="email"
                label="Email Notifications"
                right={<Switch value={settings.emailNotifications} onValueChange={(value) => syncNotificationPref('email', value)} disabled={savingNotifications} />}
              />
              <Row
                icon="sms"
                label="SMS Notifications"
                right={<Switch value={settings.smsNotifications} onValueChange={(value) => syncNotificationPref('sms', value)} disabled={savingNotifications} />}
              />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Privacy</Text>
              <Row
                icon="policy"
                label="Data Sharing"
                right={<Switch value={settings.dataSharingEnabled} onValueChange={handleDataSharingToggle} disabled={savingPrivacy} />}
              />
              <Row
                icon="download"
                label="Download My Data"
                onPress={() => Alert.alert('Requested', 'Your data export request has been initiated.')}
              />
              <Row
                icon="delete-outline"
                label="Delete Account"
                danger
                onPress={() => router.push('/profile/change-password?intent=delete' as any)}
              />
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Support</Text>
              <View style={s.ticketQuickRow}>
                {(['LAWYER_ISSUE', 'PAYMENT', 'CASE_ISSUE', 'GENERAL'] as SupportTicketType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[s.quickChip, newTicketType === type && s.quickChipActive]}
                    onPress={() => setNewTicketType(type)}
                    activeOpacity={0.85}
                  >
                    <Text style={[s.quickChipTxt, newTicketType === type && s.quickChipTxtActive]}>{type.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[s.primaryBtn, { marginBottom: 8 }, raisingTicket && { opacity: 0.6 }]}
                onPress={raiseSmartTicket}
                disabled={raisingTicket}
              >
                <Text style={s.primaryTxt}>{raisingTicket ? 'AI Creating...' : 'Raise AI-Assisted Ticket'}</Text>
              </TouchableOpacity>
              {topSupportTickets.map((ticket) => (
                <View key={ticket.id} style={s.supportTrackerCard}>
                  <View style={s.supportTopRow}>
                    <Text style={s.supportTitle}>{ticket.title}</Text>
                    <Text style={s.supportStatus}>{ticket.status}</Text>
                  </View>
                  <View style={s.supportProgressTrack}>
                    <View style={[s.supportProgressFill, { width: `${ticket.progress}%` }]} />
                  </View>
                  <Text style={s.supportMeta}>Priority: {ticket.priority} • Actions: {ticket.suggestedActions.slice(0, 2).join(' / ')}</Text>
                </View>
              ))}
              <Row icon="support-agent" label="Open Support Center" onPress={() => router.push('/profile/support-center')} />
              <Row icon="quiz" label="FAQ" onPress={() => router.push('/profile/faq')} />
              <Row icon="chat-bubble-outline" label="Live Chat" onPress={() => router.push('/profile/chat-screen')} />
              <Row icon="phone" label="Call Support" onPress={() => Linking.openURL('tel:+919999999999').catch(() => Alert.alert('Failed', 'Unable to place call.'))} />
              <Row icon="email" label="Email Support" onPress={() => Linking.openURL('mailto:support@law24.in?subject=Support%20Request').catch(() => Alert.alert('Failed', 'Unable to open email app.'))} />
            </View>

            <TouchableOpacity
              style={s.logout}
              onPress={() => {
                Alert.alert('Log Out', 'Do you want to log out from this account?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => {
                      logout();
                      router.replace('/(auth)/login');
                    },
                  },
                ]);
              }}
            >
              <MaterialIcons name="logout" size={18} color={Colors.danger} />
              <Text style={s.logoutTxt}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 130 },
  headerCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
  },
  name: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  email: { color: Colors.textSecondary, fontSize: 13 },
  meta: { color: Colors.textTertiary, fontSize: 12, marginBottom: 8 },
  primaryBtn: { alignSelf: 'flex-start', backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  primaryTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  ticketQuickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  quickChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: Colors.bgElevated },
  quickChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySubtle },
  quickChipTxt: { color: Colors.textSecondary, fontSize: 10, fontWeight: '700' },
  quickChipTxtActive: { color: Colors.primary },
  supportTrackerCard: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgElevated, padding: 10, marginBottom: 8, gap: 6 },
  supportTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  supportTitle: { flex: 1, color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  supportStatus: { color: Colors.gold, fontSize: 10, fontWeight: '800' },
  supportProgressTrack: { height: 5, borderRadius: 999, backgroundColor: Colors.bgSecondary, overflow: 'hidden' },
  supportProgressFill: { height: '100%', backgroundColor: Colors.primary },
  supportMeta: { color: Colors.textSecondary, fontSize: 10 },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  cardTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  row: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    paddingVertical: 8,
  },
  rowText: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  logout: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dangerSubtle,
    borderWidth: 1,
    borderColor: Colors.dangerSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutTxt: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
});

