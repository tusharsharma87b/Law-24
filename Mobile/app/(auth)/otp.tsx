import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { pickAccessToken, sendOtp, verifyOtp } from '../../src/services/authService';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { type, value } = useLocalSearchParams<{ type: string; value: string }>();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const displayValue =
    type === 'email'
      ? (value as string)
      : `+91 ••••• ${(value as string)?.slice(-4) || '0000'}`;

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const shake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text: string, idx: number) => {
    const cleaned = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    setHasError(false);

    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (!cleaned && idx > 0) inputRefs.current[idx - 1]?.focus();

    // Auto-submit when last digit filled
    if (cleaned && idx === OTP_LENGTH - 1) {
      const full = [...next.slice(0, OTP_LENGTH - 1), cleaned].join('');
      if (full.length === OTP_LENGTH) handleVerify(full);
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const fullOtp = code ?? otp.join('');
    if (fullOtp.length < OTP_LENGTH) { shake(); setHasError(true); return; }

    try {
      setLoading(true);
      const target = String(value ?? '');
      const result = await verifyOtp(target, fullOtp);
      const accessToken = pickAccessToken(result);
      if (!accessToken) {
        throw new Error('Missing access token from server');
      }
      const me = result.user;
      const user = {
        id: String(me.id),
        name: me.name ?? 'Law24 User',
        phone: me.phone ?? (type === 'phone' ? `+91${target}` : ''),
        email: me.email ?? undefined,
        plan: 'free' as const,
        clientId: `#${String(me.id).slice(-4)}`,
        avatarInitials: String(me.name ?? 'Law24 User')
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };
      await useAuthStore.getState().login(user, accessToken);
      router.replace('/(tabs)');
    } catch {
      shake();
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) return;
    try {
      await sendOtp(String(value ?? ''), type === 'email' ? 'email' : 'phone');
      setResendCount((c) => c + 1);
      setCountdown(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      setHasError(true);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>

        {/* BACK */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* WORDMARK */}
        <Text style={styles.wordmark}>L A W 2 4</Text>

        {/* TITLE */}
        <Text style={styles.title}>Verify your {type === 'email' ? 'email' : 'number'}</Text>
        <Text style={styles.subtitle}>We&apos;ve sent a 6-digit code to</Text>
        <Text style={styles.sentTo}>{displayValue}</Text>

        {/* OTP BOXES */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(r) => { inputRefs.current[idx] = r; }}
              style={[
                styles.otpBox,
                activeIdx === idx && styles.otpActive,
                hasError && styles.otpError,
                digit && styles.otpFilled,
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              onFocus={() => setActiveIdx(idx)}
              onBlur={() => setActiveIdx(null)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {hasError && (
          <Text style={styles.errorText}>Invalid OTP. Please try again.</Text>
        )}

        {/* VERIFY CTA */}
        <TouchableOpacity
          style={[styles.cta, loading && styles.ctaDim]}
          onPress={() => handleVerify()}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>{loading ? 'Verifying…' : 'Verify and Continue'}</Text>
        </TouchableOpacity>

        {/* RESEND */}
        {countdown > 0 ? (
          <Text style={styles.resend}>
            Resend code in <Text style={{ color: Colors.primary }}>{countdown}s</Text>
          </Text>
        ) : resendCount < 3 ? (
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resend}>Maximum resend attempts reached</Text>
        )}

        {/* CHANGE NUMBER */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text style={styles.changeLink}>Change mobile number</Text>
        </TouchableOpacity>

        {/* SECURITY */}
        <View style={styles.secureRow}>
          <MaterialIcons name="lock" size={13} color={Colors.textTertiary} />
          <Text style={styles.secureText}>Your verification is secure and encrypted.</Text>
        </View>

        <Text style={styles.copy}>© 2024 LAW24  •  ENCRYPTED</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgPrimary },
  container: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },

  back: { position: 'absolute', top: 54, left: 20, padding: 4 },
  wordmark: { color: Colors.textSecondary, fontSize: 12, letterSpacing: 5, fontWeight: '600', marginBottom: 36 },

  title:    { color: Colors.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 },
  sentTo:   { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4 },

  otpRow: { flexDirection: 'row', gap: 10, marginTop: 32, marginBottom: 8 },
  otpBox: {
    width: 46, height: 56, borderRadius: 10, backgroundColor: Colors.bgTertiary,
    borderWidth: 1.5, borderColor: Colors.border, textAlign: 'center',
    color: Colors.textPrimary, fontSize: 22, fontWeight: '700',
  },
  otpActive: { borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  otpError:  { borderColor: Colors.danger },
  otpFilled: { backgroundColor: Colors.bgElevated, borderColor: Colors.border },
  errorText: { color: Colors.danger, fontSize: 12, marginBottom: 8 },

  cta:    { backgroundColor: Colors.primary, borderRadius: 12, height: 52, width: '100%', maxWidth: 360, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  ctaDim: { opacity: 0.6 },
  ctaText:{ color: '#fff', fontSize: 15, fontWeight: '700' },

  resend:     { color: Colors.textSecondary, fontSize: 13, marginTop: 16 },
  resendLink: { color: Colors.primary, fontSize: 13, fontWeight: '600', marginTop: 16 },
  changeLink: { color: Colors.primary, fontSize: 13 },

  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 24 },
  secureText: { color: Colors.textTertiary, fontSize: 11 },
  copy:       { color: Colors.textTertiary, fontSize: 10, marginTop: 16 },
});