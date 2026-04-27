import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { Card, ScreenShell } from './_shared';

export default function LoginHistoryScreen() {
  const loginHistory = useProfileSettingsStore((state) => state.loginHistory);
  return (
    <ScreenShell title="Login History">
      <Card>
        <FlatList
          data={loginHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <MaterialIcons name={item.status === 'SUCCESS' ? 'check-circle' : 'error'} size={16} color={item.status === 'SUCCESS' ? Colors.success : Colors.danger} />
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.deviceName}</Text>
                <Text style={s.meta}>{item.location} • {item.ip} • {item.time}</Text>
              </View>
              <Text style={[s.badge, item.status === 'FAILED' && { color: Colors.danger }]}>{item.status}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  title: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  meta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  badge: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
});

