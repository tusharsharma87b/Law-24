import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card, ScreenShell } from './_shared';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Cat = 'Cases' | 'Lawyers' | 'Payments' | 'Nyaya AI' | 'Account';

const FAQ_BY_CAT: Record<Cat, { q: string; a: string }[]> = {
  Cases: [
    { q: 'How do I track my case?', a: 'Open Case history in Profile to see milestones, filings, and hearing dates in one timeline.' },
    { q: 'Can I change my lawyer?', a: 'Yes. Use Support live chat under Case issue so our team can coordinate a reassignment where permitted.' },
  ],
  Lawyers: [
    { q: 'How are lawyers verified?', a: 'Law24 lists advocates with verified enrolment and practice areas. You book after reviewing profile and fee transparency.' },
    { q: 'Is chat with my lawyer confidential?', a: 'Yes. Lawyer chat is separate from Nyaya AI and is handled under your engagement terms with the advocate.' },
  ],
  Payments: [
    { q: 'How do I add money to my wallet?', a: 'Profile → Wallet → Add money. Invoices are available under Invoices for every successful charge.' },
    { q: 'What are Nyaya AI credits?', a: 'Credits are prepaid question packs. Your free daily questions reset each day; packs are used after the free quota.' },
  ],
  'Nyaya AI': [
    { q: 'What is Nyaya AI?', a: 'Nyaya AI gives general legal orientation in plain language. It is not a substitute for a lawyer.' },
    { q: 'What happens when I run out of questions?', a: 'The input is disabled until the next day for free quota, or you can buy a credit pack from Profile → Nyaya AI.' },
  ],
  Account: [
    { q: 'How do I update email or phone?', a: 'Profile → Account → Change phone / email. We send an OTP before saving changes.' },
    { q: 'How do I export my data?', a: 'Privacy → Download my data. You will receive a confirmation when the export job completes (demo flow).' },
  ],
};

function AccordionItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <View style={s.item}>
      <TouchableOpacity style={s.qRow} onPress={onToggle} activeOpacity={0.85}>
        <Text style={s.q}>{q}</Text>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={22} color={Colors.textTertiary} />
      </TouchableOpacity>
      {open ? <Text style={s.a}>{a}</Text> : null}
    </View>
  );
}

export default function FAQScreen() {
  const [openCat, setOpenCat] = useState<Cat | null>('Nyaya AI');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleQ = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <ScreenShell title="FAQ">
      <Card>
        {(Object.keys(FAQ_BY_CAT) as Cat[]).map((cat) => {
          const catOpen = openCat === cat;
          return (
            <View key={cat} style={s.catBlock}>
              <TouchableOpacity
                style={s.catHeader}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpenCat(catOpen ? null : cat);
                  setOpenKey(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={s.catTitle}>{cat}</Text>
                <MaterialIcons name={catOpen ? 'expand-less' : 'expand-more'} size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              {catOpen
                ? FAQ_BY_CAT[cat].map((item, idx) => {
                    const key = `${cat}-${idx}`;
                    return (
                      <AccordionItem
                        key={key}
                        q={item.q}
                        a={item.a}
                        open={openKey === key}
                        onToggle={() => toggleQ(key)}
                      />
                    );
                  })
                : null}
            </View>
          );
        })}
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  catBlock: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle, paddingVertical: 6 },
  catHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  catTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  item: { paddingLeft: 4, paddingBottom: 8 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  q: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  a: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, paddingBottom: 8, paddingRight: 8 },
});
