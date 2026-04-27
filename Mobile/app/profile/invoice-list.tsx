import React from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useProfileSettingsStore } from '../../store/useProfileSettingsStore';
import { Card, ScreenShell } from './_shared';

export default function InvoiceListScreen() {
  const invoices = useProfileSettingsStore((state) => state.invoices);
  return (
    <ScreenShell title="Invoice List">
      <Card>
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{item.title}</Text>
                <Text style={s.meta}>INR {item.amount} • {new Date(item.createdAt).toLocaleDateString('en-IN')} • {item.status}</Text>
              </View>
              <TouchableOpacity style={s.dlBtn} onPress={() => Linking.openURL(item.downloadUrl).catch(() => {})}>
                <MaterialIcons name="download" size={16} color={Colors.primary} />
                <Text style={s.dlTxt}>Download</Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={<Text style={s.empty}>No invoices found.</Text>}
        />
      </Card>
    </ScreenShell>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  title: { color: Colors.textPrimary, fontWeight: '700', fontSize: 13 },
  meta: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  dlBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: Colors.primarySubtle },
  dlTxt: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  sep: { height: 1, backgroundColor: Colors.borderSubtle },
  empty: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginVertical: 10 },
});

