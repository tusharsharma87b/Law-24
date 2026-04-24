import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalletStore } from '../../store/useWalletStore';
import { Avatar } from '../../components/ui/Avatar';

const PLAN_LABEL: Record<string, string> = {
  free: 'Free Plan', standard: 'Standard Member', premium_pro: 'Premium Pro',
};

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance } = useWalletStore();

  const name = user?.name ?? 'Anjali Singh';
  const email = user?.email ?? 'anjali.singh@law24.in';
  const plan = user?.plan ?? 'free';
  const clientId = user?.clientId ?? '#621';

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* PROFILE HEADER */}
        <View style={s.profileTop}>
          <Avatar name={name} size={80} initials={user?.avatarInitials} verified />
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>{email}</Text>
          <View style={s.badgeRow}>
            <View style={s.planBadge}><Text style={s.planBadgeTxt}>{PLAN_LABEL[plan].toUpperCase()}</Text></View>
            <View style={s.idBadge}><Text style={s.idBadgeTxt}>CLIENT {clientId}</Text></View>
          </View>
        </View>

        {/* SUBSCRIPTION CARD */}
        <View style={s.card}>
          <Text style={s.cardLabel}>CURRENT PLAN</Text>
          <View style={s.cardRow}>
            <View>
              <Text style={s.planName}>{PLAN_LABEL[plan]}</Text>
              <Text style={s.planExpiry}>Expiry: 12 Jan 2027</Text>
            </View>
            <TouchableOpacity style={s.upgradeBtn} onPress={() => router.push('/subscription' as any)}>
              <Text style={s.upgradeTxt}>Upgrade Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WALLET CARD */}
        <View style={s.card}>
          <Text style={s.cardLabel}>WALLET BALANCE</Text>
          <Text style={s.balance}>₹{balance.toLocaleString('en-IN')}</Text>
          <View style={s.walletActions}>
            <TouchableOpacity style={s.walletBtn} activeOpacity={0.8}>
              <MaterialIcons name="add" size={16} color={Colors.primary} />
              <Text style={s.walletBtnTxt}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.walletBtn} activeOpacity={0.8}>
              <MaterialIcons name="receipt-long" size={16} color={Colors.primary} />
              <Text style={s.walletBtnTxt}>Transactions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT ACTIVITY */}
        <Text style={s.sectionTitle}>Recent Activity</Text>
        <View style={s.card}>
          <View style={s.activityRow}>
            <View style={[s.actIcon, { backgroundColor: Colors.primarySubtle }]}>
              <MaterialIcons name="phone" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.actName}>Adv. Rahul Mehta</Text>
              <Text style={s.actTime}>Wednesday, 4:30 PM — 15 mins</Text>
            </View>
            <TouchableOpacity style={s.actBtn}>
              <Text style={s.actBtnTxt}>Call Again</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.divider, { marginVertical: 12 }]} />
          <View style={s.activityRow}>
            <View style={[s.actIcon, { backgroundColor: Colors.goldSubtle }]}>
              <MaterialIcons name="chat" size={18} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.actName}>Adv. Priya Sharma</Text>
              <Text style={s.actTime}>Property dispute — last message 2d ago</Text>
            </View>
            <TouchableOpacity style={s.actBtn}>
              <Text style={s.actBtnTxt}>Open Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SETTINGS LIST */}
        <Text style={s.sectionTitle}>Account</Text>
        {[
          { icon: 'notifications-none', label: 'Notification Settings', route: '/notification-settings' },
          { icon: 'security', label: 'Privacy & Security', route: null },
          { icon: 'help-outline', label: 'Help & Support', route: null },
          { icon: 'info-outline', label: 'About Law24', route: null },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={s.settingRow}
            activeOpacity={0.8}
          >
            <View style={s.settingIcon}>
              <MaterialIcons name={item.icon as any} size={20} color={Colors.textSecondary} />
            </View>
            <Text style={s.settingLabel}>{item.label}</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* LOGOUT */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={18} color={Colors.danger} />
          <Text style={s.logoutTxt}>Log Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Law24 v1.0.0  •  © 2024 Law24 Technologies Pvt. Ltd.</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  profileTop:{ alignItems: 'center', paddingVertical: 24, gap: 8 },
  name:    { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },
  email:   { fontSize: 13, color: Colors.textSecondary },
  badgeRow:{ flexDirection: 'row', gap: 8, marginTop: 4 },
  planBadge:{ backgroundColor: Colors.goldSubtle, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  planBadgeTxt:{ color: Colors.gold, fontSize: 11, fontWeight: '700' },
  idBadge: { backgroundColor: Colors.bgElevated, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  idBadgeTxt:{ color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  card:    { backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  cardLabel:{ fontSize: 10, color: Colors.textTertiary, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName:{ fontSize: 16, fontWeight: '700', color: Colors.gold },
  planExpiry:{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  upgradeBtn:{ backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  upgradeTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '600' },
  balance: { fontSize: 28, fontWeight: '700', color: Colors.gold, marginBottom: 12 },
  walletActions:{ flexDirection: 'row', gap: 10 },
  walletBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.bgElevated, borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  walletBtnTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '600' },
  sectionTitle:{ fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 12, marginTop: 4 },
  activityRow:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  actIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  actTime: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  actBtn:  { backgroundColor: Colors.bgElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  actBtnTxt:{ color: Colors.primary, fontSize: 11, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.borderSubtle },
  settingRow:{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  settingIcon:{ width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  settingLabel:{ flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  logoutBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, marginBottom: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.dangerSubtle, backgroundColor: Colors.dangerSubtle },
  logoutTxt:{ color: Colors.danger, fontSize: 15, fontWeight: '600' },
  version: { color: Colors.textTertiary, fontSize: 11, textAlign: 'center', marginBottom: 8 },
});
