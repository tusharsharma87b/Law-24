import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** Mock: PUT /user/profile */
async function mockPutProfile(_body: { name: string; email: string; phone?: string }) {
  await wait(800);
  return { ok: true };
}

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!name.trim()) throw new Error('Name is required.');
      if (!email.trim()) throw new Error('Email is required.');
      if (!emailOk(email)) throw new Error('Enter a valid email address.');
      if (phone.trim() && phone.replace(/\D/g, '').length < 10) throw new Error('Phone should be at least 10 digits (optional).');
      await mockPutProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
      });
      if (!user) throw new Error('Session expired. Please login again.');
      login({
        ...user,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || user.phone,
        avatarInitials: name.trim().slice(0, 2).toUpperCase(),
      });
      setSuccess('Profile updated successfully.');
    } catch (e: any) {
      setError(e?.message ?? 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell title="Edit profile">
      <Card>
        <Text style={s.label}>Full name</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.textTertiary} />
        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="name@email.com"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={s.label}>Phone (optional)</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile"
          placeholderTextColor={Colors.textTertiary}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={onSave} disabled={loading} activeOpacity={0.85}>
          <Text style={s.btnTxt}>{loading ? 'Saving…' : 'Save changes'}</Text>
        </TouchableOpacity>
        <AsyncState loading={loading} error={error} success={success} loadingLabel="Saving profile…" />
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
