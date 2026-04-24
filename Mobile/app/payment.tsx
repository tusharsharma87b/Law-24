import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { MOCK_LAWYERS } from '../constants/mockData';
import { useWalletStore } from '../store/useWalletStore';
import { Avatar } from '../components/ui/Avatar';

const UPI_APPS = [
  { id: 'gpay', label: 'GPay', color: '#4285F4', icon: 'google' as const },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F', icon: 'mobile-phone' as const },
  { id: 'paytm', label: 'Paytm', color: '#00BAF2', icon: 'money' as const },
  { id: 'bhim', label: 'BHIM', color: '#FF6B35', icon: 'flag' as const },
];

type PayMethod = 'upi' | 'wallet' | 'netbanking' | 'card';

export default function PaymentScreen() {
  const router = useRouter();
  const { lawyerId, type } = useLocalSearchParams<{ lawyerId?: string; type?: string }>();
  const [method, setMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [promo, setPromo] = useState('');
  const [processing, setProcessing] = useState(false);

  const lawyer = MOCK_LAWYERS.find((l) => l.id === lawyerId) ?? MOCK_LAWYERS[0];
  const { balance, deduct } = useWalletStore();

  const isChat = type === 'chat';
  const amount = isChat ? 250 : lawyer.fees.call30minInr;
  const gst = Math.round(amount * 0.18);
  const total = amount + gst;
  const canPayWallet = balance >= total;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (method === 'wallet') deduct(total);
      Alert.alert(
        '✅ Payment Successful',
        `${isChat ? 'Chat session initiated' : 'Call booked successfully'}. ₹${total.toLocaleString('en-IN')} paid.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    }, 1800);
  };

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Secure Payment</Text>
        <View style={s.lockRow}>
          <MaterialIcons name="lock" size={14} color={Colors.success} />
        </View>
      </View>

      <View style={s.razorpayBadge}>
        <MaterialIcons name="security" size={13} color={Colors.success} />
        <Text style={s.razorpayTxt}>256-bit encrypted  ·  powered by Razorpay</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ORDER SUMMARY */}
        <View style={s.orderCard}>
          <Text style={s.sectionTitle}>Order Summary</Text>
          <View style={s.lawyerRow}>
            <Avatar name={lawyer.name} size={44} initials={lawyer.initials} color={lawyer.avatarColor} verified />
            <View style={{ flex: 1 }}>
              <Text style={s.lawyerName}>{lawyer.name}</Text>
              <Text style={s.consultType}>{isChat ? `Chat Consultation · ₹${lawyer.fees.chatPerMinuteInr}/min` : '30-min Video Call'}</Text>
            </View>
          </View>
          <View style={s.divider} />
          <View style={s.lineItem}>
            <Text style={s.lineLabel}>{isChat ? 'Minimum wallet load (10 min)' : '30-min Video Call'}</Text>
            <Text style={s.lineVal}>₹{amount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={s.lineItem}>
            <Text style={s.lineLabel}>GST (18%)</Text>
            <Text style={s.lineVal}>₹{gst}</Text>
          </View>
          <View style={[s.divider, { marginVertical: 8 }]} />
          <View style={s.lineItem}>
            <Text style={[s.lineLabel, { fontWeight: '700', color: Colors.textPrimary }]}>Total</Text>
            <Text style={[s.lineVal, { fontSize: 18, color: Colors.gold }]}>₹{total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <Text style={s.sectionTitle}>Payment Method</Text>

        {/* METHOD TABS */}
        <View style={s.methodTabs}>
          {([['upi', 'UPI'], ['wallet', 'Wallet'], ['netbanking', 'Net Banking'], ['card', 'Card']] as [PayMethod, string][]).map(([key, label]) => (
            <TouchableOpacity key={key} style={[s.methodTab, method === key && s.methodTabActive]} onPress={() => setMethod(key)} activeOpacity={0.8}>
              <Text style={[s.methodTabTxt, method === key && s.methodTabTxtActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* UPI */}
        {method === 'upi' && (
          <View style={s.methodCard}>
            <Text style={s.methodSub}>Quick Pay</Text>
            <View style={s.upiApps}>
              {UPI_APPS.map((app) => (
                <TouchableOpacity key={app.id} style={s.upiApp} activeOpacity={0.8}>
                  <View style={[s.upiIconWrap, { backgroundColor: app.color + '22' }]}>
                    <FontAwesome name={app.icon} size={20} color={app.color} />
                  </View>
                  <Text style={s.upiAppLabel}>{app.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.methodSub}>Or enter UPI ID</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.upiInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="yourname@upi"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
              />
            </View>
          </View>
        )}

        {/* WALLET */}
        {method === 'wallet' && (
          <View style={s.methodCard}>
            <View style={s.walletRow}>
              <MaterialIcons name="account-balance-wallet" size={24} color={Colors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={s.walletBal}>₹{balance.toLocaleString('en-IN')}</Text>
                <Text style={s.walletSub}>Law24 Wallet Balance</Text>
              </View>
              {canPayWallet ? (
                <View style={s.sufficientBadge}><Text style={s.sufficientTxt}>Sufficient</Text></View>
              ) : (
                <TouchableOpacity style={s.addMoneyBtn}>
                  <Text style={s.addMoneyTxt}>Add ₹{(total - balance).toLocaleString('en-IN')}</Text>
                </TouchableOpacity>
              )}
            </View>
            {!canPayWallet && (
              <View style={s.insufficientBanner}>
                <MaterialIcons name="warning" size={14} color={Colors.warning} />
                <Text style={s.insufficientTxt}>Insufficient wallet balance. Please add money to continue.</Text>
              </View>
            )}
          </View>
        )}

        {/* NET BANKING */}
        {method === 'netbanking' && (
          <View style={s.methodCard}>
            <Text style={s.methodSub}>Popular Banks</Text>
            {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((bank) => (
              <TouchableOpacity key={bank} style={s.bankRow} activeOpacity={0.8}>
                <View style={s.bankIcon}>
                  <MaterialIcons name="account-balance" size={18} color={Colors.primary} />
                </View>
                <Text style={s.bankName}>{bank}</Text>
                <MaterialIcons name="chevron-right" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CARD */}
        {method === 'card' && (
          <View style={s.methodCard}>
            <View style={s.cardField}>
              <Text style={s.cardLabel}>Card Number</Text>
              <TextInput style={s.cardInput} placeholder="1234  5678  9012  3456" placeholderTextColor={Colors.textTertiary} keyboardType="number-pad" />
            </View>
            <View style={s.cardRow2}>
              <View style={[s.cardField, { flex: 1 }]}>
                <Text style={s.cardLabel}>Expiry</Text>
                <TextInput style={s.cardInput} placeholder="MM / YY" placeholderTextColor={Colors.textTertiary} keyboardType="number-pad" />
              </View>
              <View style={[s.cardField, { flex: 1 }]}>
                <Text style={s.cardLabel}>CVV</Text>
                <TextInput style={s.cardInput} placeholder="•••" placeholderTextColor={Colors.textTertiary} keyboardType="number-pad" secureTextEntry />
              </View>
            </View>
          </View>
        )}

        {/* PROMO CODE */}
        <View style={s.promoRow}>
          <TextInput
            style={s.promoInput}
            value={promo}
            onChangeText={setPromo}
            placeholder="Enter promo code"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={s.promoApply}>
            <Text style={s.promoApplyTxt}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* CHAT NOTE */}
        {isChat && (
          <View style={s.chatNote}>
            <MaterialIcons name="info-outline" size={14} color={Colors.info} />
            <Text style={s.chatNoteTxt}>No charges until you connect. Amount deducted per minute of chat.</Text>
          </View>
        )}

        {/* PAY BUTTON */}
        <TouchableOpacity
          style={[s.payBtn, processing && s.payBtnDim, (method === 'wallet' && !canPayWallet) && s.payBtnDisabled]}
          onPress={handlePay}
          disabled={processing || (method === 'wallet' && !canPayWallet)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="lock" size={16} color="#fff" />
          <Text style={s.payBtnTxt}>
            {processing ? 'Processing…' : `Pay Securely — ₹${total.toLocaleString('en-IN')}`}
          </Text>
        </TouchableOpacity>

        <Text style={s.terms}>By paying, you agree to our Terms of Service and Refund Policy.</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bgPrimary },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle:{ flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  lockRow: { padding: 4 },
  razorpayBadge:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  razorpayTxt:{ fontSize: 11, color: Colors.textSecondary },
  content: { padding: 16, gap: 16 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  orderCard:{ backgroundColor: Colors.bgSecondary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border },
  lawyerRow:{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  lawyerName:{ fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  consultType:{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderSubtle, marginBottom: 8 },
  lineItem:{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  lineLabel:{ fontSize: 13, color: Colors.textSecondary },
  lineVal: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  methodTabs:{ flexDirection: 'row', backgroundColor: Colors.bgSecondary, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.border },
  methodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 9 },
  methodTabActive:{ backgroundColor: Colors.primary },
  methodTabTxt:{ fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  methodTabTxtActive:{ color: '#fff', fontWeight: '700' },
  methodCard:{ backgroundColor: Colors.bgSecondary, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  methodSub:{ fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  upiApps:{ flexDirection: 'row', justifyContent: 'space-between' },
  upiApp: { alignItems: 'center', gap: 6 },
  upiIconWrap:{ width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  upiAppLabel:{ fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  inputRow:{ flexDirection: 'row' },
  upiInput:{ flex: 1, backgroundColor: Colors.bgTertiary, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 46, color: Colors.textPrimary, fontSize: 14 },
  walletRow:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletBal:{ fontSize: 22, fontWeight: '800', color: Colors.gold },
  walletSub:{ fontSize: 12, color: Colors.textSecondary },
  sufficientBadge:{ backgroundColor: Colors.successSubtle, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  sufficientTxt:{ color: Colors.success, fontSize: 12, fontWeight: '600' },
  addMoneyBtn:{ backgroundColor: Colors.primarySubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  addMoneyTxt:{ color: Colors.primary, fontSize: 12, fontWeight: '700' },
  insufficientBanner:{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.warningSubtle, borderRadius: 8, padding: 10 },
  insufficientTxt:{ color: Colors.warning, fontSize: 12, flex: 1 },
  bankRow:{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  bankIcon:{ width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center' },
  bankName:{ flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  cardField:{ gap: 6 },
  cardLabel:{ fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  cardInput:{ backgroundColor: Colors.bgTertiary, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 46, color: Colors.textPrimary, fontSize: 15 },
  cardRow2:{ flexDirection: 'row', gap: 12 },
  promoRow:{ flexDirection: 'row', gap: 10 },
  promoInput:{ flex: 1, backgroundColor: Colors.bgTertiary, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 46, color: Colors.textPrimary, fontSize: 14 },
  promoApply:{ backgroundColor: Colors.bgElevated, borderRadius: 10, paddingHorizontal: 16, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  promoApplyTxt:{ color: Colors.primary, fontSize: 13, fontWeight: '700' },
  chatNote:{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.blueSubtle, borderRadius: 10, padding: 12 },
  chatNoteTxt:{ fontSize: 12, color: Colors.info, flex: 1, lineHeight: 18 },
  payBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, height: 56 },
  payBtnDim:{ opacity: 0.7 },
  payBtnDisabled:{ opacity: 0.4 },
  payBtnTxt:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  terms:{ fontSize: 11, color: Colors.textTertiary, textAlign: 'center' },
});
