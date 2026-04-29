import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { NYAYA_FREE_DAILY_LIMIT, useNyayaCreditsStore } from '../../store/useNyayaCreditsStore';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function BuyCreditsScreen() {
  const router = useRouter();
  const purchasePack = useNyayaCreditsStore((s) => s.purchasePack);
  const questionsRemaining = useNyayaCreditsStore((s) => s.questionsRemaining());
  const freeRemainingToday = useNyayaCreditsStore((s) => s.freeRemainingToday());
  const packBalance = useNyayaCreditsStore((s) => s.packBalance);
  const [loading, setLoading] = useState<'99' | '299' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const buy = async (kind: '99' | '299') => {
    setLoading(kind);
    setError(null);
    setSuccess(null);
    try {
      await wait(900);
      // Mock payment success
      purchasePack(kind);
      const added = kind === '99' ? 100 : 500;
      setSuccess(`Payment successful. ${added} questions added to your account.`);
      Alert.alert('Thank you', `${added} Nyaya AI questions are now available.`);
    } catch (e: any) {
      setError(e?.message ?? 'Purchase failed. Try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScreenShell title="Buy Credits">
      <Card>
        <Text style={s.lead}>
          Free tier includes up to {NYAYA_FREE_DAILY_LIMIT} AI questions per day. When you need more, add a credit pack.
        </Text>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Questions left today</Text>
          <Text style={s.statValue}>{questionsRemaining}</Text>
          <Text style={s.statSub}>
            Free today: {freeRemainingToday} • Pack balance: {packBalance}
          </Text>
        </View>

        <TouchableOpacity
          style={[s.pack, loading === '99' && s.packDim]}
          onPress={() => buy('99')}
          disabled={loading !== null}
          activeOpacity={0.85}
        >
          <Text style={s.packTitle}>100 questions</Text>
          <Text style={s.packPrice}>₹99</Text>
          <Text style={s.packHint}>Best for occasional use</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.pack, s.packFeatured, loading === '299' && s.packDim]}
          onPress={() => buy('299')}
          disabled={loading !== null}
          activeOpacity={0.85}
        >
          <Text style={s.badge}>Value</Text>
          <Text style={s.packTitle}>500 questions</Text>
          <Text style={s.packPrice}>₹299</Text>
          <Text style={s.packHint}>For regular legal research</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.linkBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={s.linkTxt}>Back to profile</Text>
        </TouchableOpacity>

        <AsyncState loading={!!loading} error={error} success={success} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  lead: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  statBox: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: { color: Colors.textTertiary, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  statValue: { color: Colors.gold, fontSize: 28, fontWeight: '800', marginTop: 4 },
  statSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 6 },
  pack: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
    backgroundColor: Colors.bgElevated,
  },
  packFeatured: { borderColor: Colors.primary },
  packDim: { opacity: 0.55 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySubtle,
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  packTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  packPrice: { color: Colors.gold, fontSize: 22, fontWeight: '800', marginTop: 6 },
  packHint: { color: Colors.textTertiary, fontSize: 12, marginTop: 4 },
  linkBtn: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  linkTxt: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
});
