import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function UpdateContactScreen() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!phone.trim() && !email.trim()) throw new Error('Enter phone or email.');
      await wait(600);
      setOtpSent(true);
      setSuccess('OTP sent successfully. Use 123456 for demo.');
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (otp !== '123456') throw new Error('Invalid OTP.');
      await wait(700);
      if (!user) throw new Error('Session expired.');
      login({ ...user, phone: phone.trim() || user.phone, email: email.trim() || user.email });
      setSuccess('Contact details updated.');
      Alert.alert('Updated', 'Phone/email updated successfully.');
    } catch (e: any) {
      setError(e?.message ?? 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Update Contact">
      <Card>
        <Text style={s.label}>Phone Number</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="10-digit phone" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />
        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="name@email.com" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />

        {!otpSent ? (
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={sendOtp} disabled={loading} activeOpacity={0.85}>
            <Text style={s.btnTxt}>{loading ? 'Sending...' : 'Send OTP'}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={s.label}>Enter OTP</Text>
            <TextInput style={s.input} value={otp} onChangeText={setOtp} placeholder="6-digit OTP" placeholderTextColor={Colors.textTertiary} keyboardType="number-pad" />
            <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={verifyAndUpdate} disabled={loading} activeOpacity={0.85}>
              <Text style={s.btnTxt}>{loading ? 'Verifying...' : 'Verify & Update'}</Text>
            </TouchableOpacity>
          </>
        )}
        <AsyncState loading={loading} error={error} success={success} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgElevated, color: Colors.textPrimary, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { marginTop: 16, height: 44, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

