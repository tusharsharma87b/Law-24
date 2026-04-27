import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Card, ScreenShell } from './_shared';

const FAQ = [
  { q: 'How do I request a lawyer change?', a: 'Open Your Lawyer section or Raise a Request in Profile and choose Lawyer Change.' },
  { q: 'How does wallet refund work?', a: 'Refunded sessions are credited back to your wallet and listed in invoices.' },
  { q: 'How to secure my account?', a: 'Enable 2FA in Security and review active devices in Device Management.' },
];

export default function FAQScreen() {
  return (
    <ScreenShell title="FAQ">
      <Card>
        <FlatList
          data={FAQ}
          keyExtractor={(item) => item.q}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Text style={s.q}>{item.q}</Text>
              <Text style={s.a}>{item.a}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  row: { paddingVertical: 10 },
  q: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  a: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 18 },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
});

