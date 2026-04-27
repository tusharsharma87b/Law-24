import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const PLAN_INFO = [
  { id: 'free', title: 'Free', minutes: 10, support: 'Basic', discount: 0 },
  { id: 'standard', title: 'Standard', minutes: 40, support: 'Priority', discount: 10 },
  { id: 'premium_pro', title: 'Premium Pro', minutes: 120, support: 'VIP', discount: 20 },
];

export default function PlansScreen() {
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onUpgrade = async (planId: 'free' | 'standard' | 'premium_pro') => {
    setLoadingPlan(planId);
    setError(null);
    setSuccess(null);
    try {
      await wait(800);
      if (!user) throw new Error('Session expired.');
      login({ ...user, plan: planId });
      setSuccess(`Plan updated to ${planId.toUpperCase()}.`);
    } catch (e: any) {
      setError(e?.message ?? 'Plan update failed.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <ScreenShell title="Plans">
      <View style={{ gap: 10 }}>
        {PLAN_INFO.map((plan) => (
          <Card key={plan.id}>
            <Text style={s.title}>{plan.title}</Text>
            <Text style={s.meta}>Free mins: {plan.minutes}</Text>
            <Text style={s.meta}>Priority support: {plan.support}</Text>
            <Text style={s.meta}>Discount: {plan.discount}%</Text>
            <TouchableOpacity
              style={[s.btn, user?.plan === plan.id && s.currentBtn, loadingPlan === plan.id && { opacity: 0.6 }]}
              onPress={() => onUpgrade(plan.id as any)}
              disabled={loadingPlan === plan.id}
            >
              <Text style={s.btnTxt}>{user?.plan === plan.id ? 'Current Plan' : loadingPlan === plan.id ? 'Upgrading...' : 'Upgrade'}</Text>
            </TouchableOpacity>
          </Card>
        ))}
        <AsyncState loading={!!loadingPlan} error={error} success={success} />
      </View>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  title: { color: Colors.textPrimary, fontWeight: '800', fontSize: 16, marginBottom: 6 },
  meta: { color: Colors.textSecondary, fontSize: 12, marginBottom: 2 },
  btn: { marginTop: 10, height: 40, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  currentBtn: { backgroundColor: Colors.success },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
});

