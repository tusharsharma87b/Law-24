import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { useCaseStore } from '../../../store/useCaseStore';

const iconByType: Record<string, string> = {
  filing: 'gavel',
  hearing: 'event',
  document: 'description',
  lawyer: 'person',
  update: 'edit',
  order: 'verified',
  support: 'support-agent',
  evidence: 'folder',
  note: 'history',
};

function dayKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CaseHistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cases } = useCaseStore();
  const active = (cases as any[]).find((c) => c.id === id);

  const grouped = useMemo(() => {
    const base = (active?.events ?? []) as any[];
    const fallback = base.length ? base : [{
      id: `AUTO-${id || 'CASE'}`,
      title: 'Case Filed',
      description: 'Your case has been officially filed',
      date: active?.filedDate || new Date().toISOString(),
      type: 'filing',
    }];
    const events = [...fallback].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    );
    const map: Record<string, any[]> = {};
    events.forEach((e) => {
      const k = dayKey(e.date);
      if (!map[k]) map[k] = [];
      map[k].push(e);
    });
    return Object.entries(map);
  }, [active]);

  return (
    <View style={s.root}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.bgPrimary }} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.85}>
          <MaterialIcons name="arrow-back-ios" size={14} color={Colors.textPrimary} />
          <Text style={s.backTxt}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Full Case History</Text>
        <View style={{ width: 56 }} />
      </View>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {grouped.map(([day, events]) => (
          <View key={day} style={s.dayBlock}>
            <Text style={s.dayTitle}>{day}</Text>
            {events.map((e: any) => (
              <View key={e.id} style={s.eventRow}>
                <View style={s.iconWrap}>
                  <MaterialIcons name={(iconByType[e.type] || 'history') as any} size={14} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.eventTitle}>{e.title}</Text>
                  <Text style={s.eventDesc}>{e.description}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 56 },
  backTxt: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  title: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  content: { padding: 16, gap: 14, paddingBottom: 120 },
  dayBlock: { gap: 8 },
  dayTitle: { color: Colors.gold, fontSize: 13, fontWeight: '800' },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: Colors.bgSecondary, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12 },
  iconWrap: { width: 26, height: 26, borderRadius: 8, backgroundColor: Colors.primarySubtle, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  eventTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  eventDesc: { color: Colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 18 },
});
