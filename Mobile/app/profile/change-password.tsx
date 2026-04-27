import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const logout = useAuthStore((state) => state.logout);
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
      if (currentPwd.length < 6) throw new Error('Current password is invalid.');
      if (newPwd.length < 8) throw new Error('New password must be at least 8 characters.');
      if (newPwd !== confirmPwd) throw new Error('Passwords do not match.');
      await wait(700);
      setSuccess('Password updated successfully.');
    } catch (e: any) {
      setError(e?.message ?? 'Password update failed.');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is permanent. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            if (currentPwd.length < 6) throw new Error('Enter your password to delete account.');
            await wait(900);
            logout();
            router.replace('/(auth)/login');
          } catch (e: any) {
            setError(e?.message ?? 'Delete account failed.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell title={intent === 'delete' ? 'Delete Account' : 'Change Password'}>
      <Card>
        <Text style={s.label}>Current Password</Text>
        <TextInput style={s.input} value={currentPwd} onChangeText={setCurrentPwd} secureTextEntry placeholder="Current password" placeholderTextColor={Colors.textTertiary} />
        {intent !== 'delete' && (
          <>
            <Text style={s.label}>New Password</Text>
            <TextInput style={s.input} value={newPwd} onChangeText={setNewPwd} secureTextEntry placeholder="New password" placeholderTextColor={Colors.textTertiary} />
            <Text style={s.label}>Confirm Password</Text>
            <TextInput style={s.input} value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry placeholder="Confirm password" placeholderTextColor={Colors.textTertiary} />
          </>
        )}
        <TouchableOpacity
          style={[s.btn, intent === 'delete' && s.deleteBtn, loading && { opacity: 0.6 }]}
          onPress={intent === 'delete' ? onDeleteAccount : onChangePassword}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.btnTxt}>{loading ? 'Processing...' : intent === 'delete' ? 'Delete Account' : 'Update Password'}</Text>
        </TouchableOpacity>
        <AsyncState loading={loading} error={error} success={success} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.bgElevated, color: Colors.textPrimary, paddingHorizontal: 12, paddingVertical: 10 },
  btn: { marginTop: 16, height: 44, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: Colors.danger },
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

