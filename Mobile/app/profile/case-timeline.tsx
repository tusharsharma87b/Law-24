import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useCaseStore } from '../../store/useCaseStore';
import { Card, ScreenShell } from './_shared';

export default function CaseTimelineScreen() {
  const router = useRouter();
  const cases = useCaseStore((state) => state.cases as any[]);
  return (
    <ScreenShell title="Case Timeline">
      <Card>
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.row} onPress={() => router.push(`/case/history/${item.id}` as any)} activeOpacity={0.85}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.meta}>{item.category} • Stage: {item.stage || 'Unknown'} • Next: {item.nextHearing || 'TBD'}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={<Text style={s.empty}>No cases available.</Text>}
        />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  title: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13 },
  meta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
  empty: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginVertical: 10 },
});

