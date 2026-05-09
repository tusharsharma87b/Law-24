import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { AsyncState, Card, ScreenShell } from './_shared';

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Mock: POST /user/export-data */
async function mockExportData(): Promise<{ downloadUrl: string }> {
  await wait(1400);
  return { downloadUrl: 'https://law24.in/mock-export.zip' };
}

export default function DownloadMyDataScreen() {
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    Alert.alert(
      'Download my data',
      'We will prepare a ZIP of your profile, cases, invoices, and chat metadata. This can take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start export',
          onPress: async () => {
            setError(null);
            setPhase('processing');
            try {
              await mockExportData();
              setPhase('done');
            } catch (e: any) {
              setPhase('idle');
              setError(e?.message ?? 'Export failed.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenShell title="Download my data">
      <Card>
        <Text style={s.p}>
          Request a copy of the personal data associated with your Law24 account. You will receive an in-app confirmation when
          the archive is ready (demo simulates success only).
        </Text>
        <TouchableOpacity
          style={[s.btn, phase === 'processing' && { opacity: 0.6 }]}
          onPress={start}
          disabled={phase === 'processing' || phase === 'done'}
          activeOpacity={0.85}
        >
          <Text style={s.btnTxt}>
            {phase === 'idle' ? 'Request export' : phase === 'processing' ? 'Preparing…' : 'Export complete'}
          </Text>
        </TouchableOpacity>
        <AsyncState
          loading={phase === 'processing'}
          error={error}
          success={phase === 'done' ? 'Your data export is ready. Check your registered email within 24 hours (mock).' : null}
          loadingLabel="Preparing export…"
        />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  p: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  btn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
