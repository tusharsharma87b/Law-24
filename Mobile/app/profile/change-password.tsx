import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function ChangePasswordScreen() {
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (currentPwd.length < 6) throw new Error('Current password looks too short.');
      if (newPwd.length < 8) throw new Error('New password must be at least 8 characters.');
      if (newPwd !== confirmPwd) throw new Error('New password and confirmation do not match.');
      await wait(700);
      setSuccess('Password updated successfully.');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (e: any) {
      setError(e?.message ?? 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Change password">
      <Card>
        <Text style={s.label}>Current password</Text>
        <TextInput style={s.input} value={currentPwd} onChangeText={setCurrentPwd} secureTextEntry placeholder="Current password" placeholderTextColor={Colors.textTertiary} />
        <Text style={s.label}>New password</Text>
        <TextInput style={s.input} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="New password" placeholderTextColor={Colors.textTertiary} />
        <Text style={s.label}>Confirm new password</Text>
        <TextInput style={s.input} value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry placeholder="Confirm password" placeholderTextColor={Colors.textTertiary} />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={onChangePassword} disabled={loading} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{loading ? 'Updating…' : 'Update password'}</Text>
        </TouchableOpacity>
        <AsyncState loading={loading} error={error} success={success} loadingLabel="Updating password…" />
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
