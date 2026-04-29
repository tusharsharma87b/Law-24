import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function DeleteAccountScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmDelete = () => {
    Alert.alert(
      'Delete account permanently?',
      'Your cases, chats, and wallet history will be queued for deletion per policy. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I understand, delete',
          style: 'destructive',
          onPress: runDelete,
        },
      ]
    );
  };

  const runDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      if (password.length < 6) throw new Error('Enter your account password to confirm.');
      await wait(1000);
      // Mock API: DELETE /user/account
      logout();
      router.replace('/(auth)/login');
    } catch (e: any) {
      setError(e?.message ?? 'Deletion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Delete account">
      <Card>
        <Text style={s.warn}>
          Warning: deleting your account removes access to Law24 services. Active matters should be closed with your lawyer
          first.
        </Text>
        <Text style={s.label}>Account password</Text>
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
          placeholderTextColor={Colors.textTertiary}
        />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={confirmDelete} disabled={loading} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{loading ? 'Deleting…' : 'Confirm delete'}</Text>
        </TouchableOpacity>
        <AsyncState loading={loading} error={error} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  warn: { color: Colors.danger, fontSize: 13, lineHeight: 20, marginBottom: 16, fontWeight: '600' },
  label: { color: Colors.textSecondary, fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.bgElevated,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
