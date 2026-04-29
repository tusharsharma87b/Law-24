import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Switch, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const router = useRouter();
  const setWhatsappStore = useAuthStore((s) => s.setWhatsapp);

  const validate = () => {
    if (!phone) { setError('Please enter your mobile number'); return false; }
    if (phone.length !== 10 || !['6','7','8','9'].includes(phone[0])) {
      setError('Enter a valid 10-digit Indian mobile number'); return false;
    }
    setError(''); return true;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push({ pathname: '/(auth)/otp', params: { type: 'phone', value: phone } });
  };

  const handleGoogle = () => {
    const mockUser = { id: 'USR-001', name: 'Anjali Singh', phone: '', email: 'anjali@gmail.com', plan: 'free' as const, clientId: '#621', avatarInitials: 'AS' };
    useAuthStore.getState().login(mockUser);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* WORDMARK */}
        <Text style={styles.wordmark}>L A W 2 4</Text>

        {/* HEADLINE */}
        <Text style={styles.headline}>Legal Help Made Simple.</Text>
        <Text style={styles.subline}>Describe your issue.{'\n'}Get clear legal guidance.</Text>

        {/* CARD */}
        <View style={styles.card}>
          <Text style={styles.label}>MOBILE NUMBER</Text>
          <View style={[styles.inputRow, error ? styles.inputError : phone ? styles.inputFilled : null]}>
            <Text style={styles.prefix}>+91  |</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
              maxLength={10}
            />
          </View>
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, phone.length !== 10 && styles.ctaDim]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue Securely</Text>
          </TouchableOpacity>

          <Text style={styles.trust}>PRIVATE  •  SECURE  •  VERIFIED  LEGAL NETWORK</Text>
          <Text style={styles.trustSub}>Your information remains confidential.</Text>

          {/* WHATSAPP TOGGLE */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Receive updates on WhatsApp</Text>
            <Switch
              value={whatsapp}
              onValueChange={(v) => { setWhatsapp(v); setWhatsappStore(v); }}
              trackColor={{ false: Colors.bgElevated, true: '#22C55E' }}
              thumbColor="#fff"
            />
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          {/* GOOGLE */}
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogle} activeOpacity={0.8}>
            <FontAwesome name="google" size={18} color="#EA4335" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          {/* EMAIL + TRUECALLER */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtnHalf}
              onPress={() => router.push({ pathname: '/(auth)/otp', params: { type: 'email', value: 'user@law24.in' } })}
              activeOpacity={0.8}
            >
              <MaterialIcons name="email" size={18} color="#22C55E" />
              <Text style={styles.socialText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtnHalf}
              onPress={() => { Alert.alert('Truecaller', 'Auto-login via Truecaller (demo)'); handleGoogle(); }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="verified-user" size={18} color="#3B5BDB" />
              <Text style={styles.socialText}>Truecaller</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TESTIMONIAL */}
        <View style={styles.testimonial}>
          <Text style={styles.quote}>"Helped me understand my situation clearly."</Text>
          <Text style={styles.quoteName}>— VERIFIED USER</Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          By continuing you agree to our{' '}
          <Text style={styles.link}>Terms</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
        <Text style={styles.copy}>© 2024 LAW24  •  🔒 ENCRYPTED</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.bgPrimary },
  content: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 20, paddingBottom: 40 },

  wordmark: { color: Colors.textSecondary, fontSize: 13, letterSpacing: 6, fontWeight: '600', marginBottom: 20 },
  headline: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700', textAlign: 'center', lineHeight: 34 },
  subline:  { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 22 },

  card: {
    width: '100%', maxWidth: 360, backgroundColor: Colors.bgSecondary,
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: Colors.border,
  },
  label: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgTertiary,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 52,
  },
  inputError:  { borderColor: Colors.danger },
  inputFilled: { borderColor: Colors.primary },
  prefix: { color: Colors.textSecondary, fontSize: 15, marginRight: 8 },
  input:  { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 5 },

  cta: { backgroundColor: Colors.primary, borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  ctaDim: { opacity: 0.5 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  trust:    { color: Colors.textTertiary, fontSize: 10, textAlign: 'center', marginTop: 12, letterSpacing: 0.5 },
  trustSub: { color: Colors.textTertiary, fontSize: 10, textAlign: 'center', marginTop: 2 },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  toggleLabel: { color: Colors.textPrimary, fontSize: 13, flex: 1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textTertiary, fontSize: 11, marginHorizontal: 10 },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 48, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgTertiary, marginBottom: 10,
  },
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtnHalf: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.bgTertiary,
  },
  socialText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '500' },

  testimonial: {
    width: '100%', maxWidth: 360, backgroundColor: Colors.bgSecondary,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 20,
  },
  quote:     { color: Colors.textPrimary, fontStyle: 'italic', textAlign: 'center', fontSize: 13 },
  quoteName: { color: Colors.textSecondary, textAlign: 'center', marginTop: 8, fontSize: 11, letterSpacing: 1 },

  footer: { color: Colors.textTertiary, fontSize: 11, marginTop: 20, textAlign: 'center' },
  link:   { color: Colors.primary },
  copy:   { color: Colors.textTertiary, fontSize: 10, marginTop: 6 },
});