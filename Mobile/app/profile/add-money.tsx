import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useWalletStore } from '../../store/useWalletStore';
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function AddMoneyScreen() {
  const balance = useWalletStore((state) => state.balance);
  const addMoney = useWalletStore((state) => state.addMoney);
  const addInvoice = useProfileSettingsStore((state) => state.addInvoice);
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onPay = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) throw new Error('Enter a valid amount.');
      await wait(900);
      addMoney(value);
      addInvoice({
        id: `INV-${Date.now()}`,
        title: 'Wallet Top-up',
        amount: value,
        createdAt: new Date().toISOString(),
        status: 'PAID',
        downloadUrl: 'https://example.com/invoice/wallet-topup.pdf',
      });
      setSuccess(`INR ${value} added successfully.`);
    } catch (e: any) {
      setError(e?.message ?? 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Add Money">
      <Card>
        <Text style={s.balance}>Current Balance: INR {balance.toLocaleString('en-IN')}</Text>
        <Text style={s.label}>Amount (INR)</Text>
        <TextInput
          style={s.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor={Colors.textTertiary}
        />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={onPay} disabled={loading}>
          <Text style={s.btnTxt}>{loading ? 'Processing Payment...' : 'Pay & Add Money'}</Text>
        </TouchableOpacity>
        <AsyncState loading={loading} error={error} success={success} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  balance: { color: Colors.gold, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgElevated, color: Colors.textPrimary, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { marginTop: 14, height: 44, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

