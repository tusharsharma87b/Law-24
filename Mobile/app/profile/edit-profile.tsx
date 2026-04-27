import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!name.trim()) throw new Error('Name is required.');
      await wait(700);
      if (!user) throw new Error('Session expired. Please login again.');
      login({ ...user, name: name.trim(), email: email.trim() || undefined, avatarInitials: name.trim().slice(0, 2).toUpperCase() });
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(e?.message ?? 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Edit Profile">
      <Card>
        <Text style={s.label}>Full Name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.textTertiary} />
        <Text style={s.label}>Email</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="name@email.com" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={onSave} disabled={loading} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{loading ? 'Saving...' : 'Save Changes'}</Text>
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
  btnTxt: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

