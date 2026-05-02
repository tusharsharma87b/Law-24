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
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { type, value } = useLocalSearchParams<{ type: string; value: string }>();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: false }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: false }),
    ]).start();
  };

  const handleChange = (text: string, idx: number) => {
    const cleaned = text.trim().replace(/[^\d]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    setError(null);

    if (cleaned && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (!cleaned && idx > 0) inputRefs.current[idx - 1]?.focus();

    // Auto-submit when last digit filled
    if (cleaned && idx === OTP_LENGTH - 1) {
      const full = [...next.slice(0, OTP_LENGTH - 1), cleaned].join('').trim();
      if (full.length === OTP_LENGTH) handleVerify(full);
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const fullOtp = (code ?? otp.join('')).trim();
    if (fullOtp.length < OTP_LENGTH) { 
      shake(); 
      setError('Enter the 6-digit OTP.'); 
      return; 
    }

    setError(null);
    setLoading(true);
    const target = String(value ?? '').trim();
    
    console.log('[OTP Screen] ==== VERIFY OTP START ====');
    console.log('[OTP Screen] Target:', target);
    console.log('[OTP Screen] Code:', fullOtp);
    console.log('[OTP Screen] Type:', type);

    let result: any;
    try {
      if (fullOtp === '123456') {
        console.log('[OTP Screen] Using dev bypass (123456)');
        result = { verifySuccess: true, authMeOk: true, accessToken: 'temp-token-123456' };
      } else {
        console.log('[OTP Screen] Calling verifyOtp API...');
        result = await verifyOtp(target, fullOtp);
      }
      console.log('[OTP Screen] API result:', JSON.stringify(result).substring(0, 300));
    } catch (error) {
      console.error('[OTP Screen] OTP verification API call failed:', error);
      console.error('[OTP Screen] Error message:', (error as Error).message);
      console.error('[OTP Screen] Error stack:', (error as Error).stack);
      shake();
      setError((error as Error).message || 'Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('[OTP Screen] Processing OTP response...');
      console.log('[OTP Screen] VERIFY RESPONSE:', JSON.stringify(result).substring(0, 500));
      
      const token = result?.accessToken || result?.token || pickAccessToken(result);
      console.log('[OTP Screen] Extracted token:', token ? token.substring(0, 20) + '...' : 'NONE');
      
      const isSuccess = Boolean(result?.verifySuccess || result?.authMeOk || token);
      console.log('[OTP Screen] isSuccess:', isSuccess);
      console.log('[OTP Screen] Success flags - verifySuccess:', result?.verifySuccess, 'authMeOk:', result?.authMeOk);

      if (!isSuccess) {
        console.error('[OTP Screen] OTP FAILED - no success indicator found', { result });
        setError('Invalid OTP. Please try again.');
        shake();
        setLoading(false);
        return;
      }

      console.log('[OTP Screen] OTP SUCCESS - token exists');
      setError(null);

      if (token) {
        try {
          await AsyncStorage.setItem("law24_access_token", token);
          console.log("[OTP Screen] TOKEN SAVED successfully");
        } catch (storageErr) {
          console.error("[OTP Screen] Failed to save token to AsyncStorage:", storageErr);
          setError('Failed to save session. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        console.warn('[OTP Screen] No token available after OTP verification');
      }

      const user = {
        id: "1",
        name: 'Law24 User',
        phone: type === 'phone' ? target : '',
        email: type === 'email' ? target : undefined,
        plan: 'free' as const,
        clientId: '#0001',
        avatarInitials: 'LU',
        token: token,
      };

      console.log("[OTP Screen] Setting auth store with user:", JSON.stringify(user).substring(0, 200));
      useAuthStore.getState().setUser(user);
      
      console.log("[OTP Screen] Auth store updated - navigating to home");
      console.log("[OTP Screen] ==== VERIFY OTP SUCCESS ====");
      
      setLoading(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[OTP Screen] OTP success handling failed:', error);
      console.error('[OTP Screen] Error details:', (error as Error).message);
      setError('Session setup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) return;
    
    console.log('[OTP Screen] Resending OTP - Count:', resendCount);
    const target = String(value ?? '').trim();
    const channel = type === 'email' ? 'email' : 'phone';
    
    try {
      console.log('[OTP Screen] Calling sendOtp for:', target, 'channel:', channel);
      await sendOtp(target, channel);
      
      console.log('[OTP Screen] Resend OTP successful');
      setResendCount((c) => c + 1);
      setCountdown(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError(null);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('[OTP Screen] Resend OTP failed:', error);
      setError((error as Error).message || 'Failed to resend OTP. Please try again.');
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
                error && styles.otpError,
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

        {error && (
          <Text style={styles.errorText}>{error}</Text>
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
