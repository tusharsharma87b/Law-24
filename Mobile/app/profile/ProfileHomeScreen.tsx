import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
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
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { sendNotification } from '../../store/useNotificationStore';
import { NYAYA_FREE_DAILY_LIMIT, useNyayaCreditsStore } from '../../store/useNyayaCreditsStore';

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
  const content = (
    <>
      <MaterialIcons name={icon as any} size={18} color={danger ? Colors.danger : Colors.textSecondary} />
      <Text style={[s.rowText, danger && { color: Colors.danger }]}>{label}</Text>
      {right ?? (onPress ? <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} /> : null)}
    </>
  );
  if (!onPress) {
    return <View style={s.row}>{content}</View>;
  }
  return (
    <TouchableOpacity style={s.row} activeOpacity={0.85} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

export function ProfileHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const wallet = useWalletStore();
  const settings = useProfileSettingsStore();
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const questionsRemaining = useNyayaCreditsStore((st) => st.questionsRemaining());
  const freeRemainingToday = useNyayaCreditsStore((st) => st.freeRemainingToday());
  const packBalance = useNyayaCreditsStore((st) => st.packBalance);

  const displayName = user?.name ?? 'Law24 Client';
  const displayEmail = user?.email ?? 'client@law24.in';

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

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={s.headerCard}>
          <Text style={s.name}>{displayName}</Text>
          <Text style={s.email}>{displayEmail}</Text>
          <Text style={s.meta}>Client ID: {user?.clientId ?? '#N/A'}</Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/profile/edit-profile')} activeOpacity={0.85}>
            <Text style={s.primaryTxt}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Wallet</Text>
          <Row
            icon="account-balance-wallet"
            label={`Balance · ₹${wallet.balance.toLocaleString('en-IN')}`}
            onPress={() => router.push('/profile/add-money')}
          />
          <Row icon="receipt-long" label="Invoices" onPress={() => router.push('/profile/invoice-list')} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Nyaya AI</Text>
          <View style={s.creditBanner}>
            <Text style={s.creditLabel}>Questions left today</Text>
            <Text style={s.creditValue}>{questionsRemaining}</Text>
            <Text style={s.creditSub}>
              Free (up to {NYAYA_FREE_DAILY_LIMIT}/day): {freeRemainingToday} · Pack credits: {packBalance}
            </Text>
            <TouchableOpacity style={s.buyBtn} onPress={() => router.push('/profile/buy-credits')} activeOpacity={0.85}>
              <Text style={s.buyBtnTxt}>Buy credits</Text>
            </TouchableOpacity>
          </View>
          <Row icon="auto-awesome" label="Open Nyaya AI" onPress={() => router.push('/nyaya')} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Account</Text>
          <Row icon="person-outline" label="Edit profile" onPress={() => router.push('/profile/edit-profile')} />
          <Row icon="mail-outline" label="Change phone / email" onPress={() => router.push('/profile/update-contact')} />
          <Row icon="password" label="Change password" onPress={() => router.push('/profile/change-password')} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Activity</Text>
          <Row icon="timeline" label="Case history" onPress={() => router.push('/profile/case-timeline')} />
          <Row icon="chat-bubble-outline" label="Chat history" onPress={() => router.push('/profile/chat-history')} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Privacy</Text>
          <Row
            icon="policy"
            label="Data sharing"
            right={
              <Switch value={settings.dataSharingEnabled} onValueChange={handleDataSharingToggle} disabled={savingPrivacy} />
            }
          />
          <Row icon="download" label="Download my data" onPress={() => router.push('/profile/download-data')} />
          <Row icon="delete-outline" label="Delete account" danger onPress={() => router.push('/profile/delete-account')} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Support</Text>
          <Row icon="quiz" label="FAQ" onPress={() => router.push('/profile/faq')} />
          <Row icon="chat" label="Live chat" onPress={() => router.push('/profile/live-chat')} />
          <Row
            icon="phone"
            label="Call support"
            onPress={() => Linking.openURL('tel:+919999999999').catch(() => Alert.alert('Failed', 'Unable to place call.'))}
          />
          <Row
            icon="email"
            label="Email support"
            onPress={() =>
              Linking.openURL('mailto:support@law24.in?subject=Law24%20Support').catch(() =>
                Alert.alert('Failed', 'Unable to open email app.')
              )
            }
          />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>About</Text>
          <Row icon="info-outline" label="About Law24" onPress={() => router.push('/profile/about-us')} />
        </View>

        <TouchableOpacity
          style={s.logout}
          onPress={() => {
            Alert.alert('Log out', 'Sign out of this account on this device?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log out',
                style: 'destructive',
                onPress: () => {
                  logout();
                  router.replace('/(auth)/login');
                },
              },
            ]);
          }}
          activeOpacity={0.85}
        >
          <MaterialIcons name="logout" size={18} color={Colors.danger} />
          <Text style={s.logoutTxt}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  list: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 120, gap: 12 },
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
  creditBanner: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditLabel: { color: Colors.textTertiary, fontSize: 11, fontWeight: '600' },
  creditValue: { color: Colors.gold, fontSize: 26, fontWeight: '800', marginTop: 4 },
  creditSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 6, lineHeight: 16 },
  buyBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buyBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: { backgroundColor: Colors.bgSecondary, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  cardTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  row: {
    minHeight: 44,
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
    marginBottom: 8,
  },
  logoutTxt: { color: Colors.danger, fontSize: 14, fontWeight: '700' },
});
