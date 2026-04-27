import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { AsyncState, Card, ScreenShell } from './_shared';

export default function DeviceListScreen() {
  const devices = useProfileSettingsStore((state) => state.devices);
  const logoutDevice = useProfileSettingsStore((state) => state.logoutDevice);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLogoutDevice = async (id: string) => {
    setError(null);
    setLoadingId(id);
    try {
      await logoutDevice(id);
    } catch {
      setError('Failed to logout device.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <ScreenShell title="Device List">
      <Card>
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.item}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.deviceName}</Text>
                <Text style={s.meta}>{item.platform} • {item.location} • {item.lastActive}</Text>
              </View>
              {item.current ? (
                <View style={s.current}>
                  <Text style={s.currentTxt}>Current</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => onLogoutDevice(item.id)} disabled={loadingId === item.id} style={s.logout}>
                  <MaterialIcons name="logout" size={15} color={Colors.danger} />
                  <Text style={s.logoutTxt}>{loadingId === item.id ? '...' : 'Logout'}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
        />
        <AsyncState loading={!!loadingId} error={error} />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  name: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13 },
  meta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  current: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.successSubtle },
  currentTxt: { color: Colors.success, fontSize: 10, fontWeight: '700' },
  logout: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.dangerSubtle },
  logoutTxt: { color: Colors.danger, fontSize: 11, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
});

