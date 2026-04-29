import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export function ScreenShell({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.85}>
          <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.right}>{right}</View>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function AsyncState({
  loading,
  error,
  success,
  loadingLabel = 'Saving...',
}: {
  loading: boolean;
  error?: string | null;
  success?: string | null;
  loadingLabel?: string;
}) {
  if (!loading && !error && !success) return null;
  return (
    <View style={styles.stateWrap}>
      {loading && (
        <View style={styles.stateRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.stateText}>{loadingLabel}</Text>
        </View>
      )}
      {!!error && <Text style={[styles.stateText, { color: Colors.danger }]}>{error}</Text>}
      {!!success && <Text style={[styles.stateText, { color: Colors.success }]}>{success}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgPrimary },
  safeTop: { backgroundColor: Colors.bgPrimary },
  header: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.borderSubtle,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: Colors.textPrimary, fontSize: 17, fontWeight: '700', marginLeft: 6 },
  right: { minWidth: 36, alignItems: 'flex-end' },
  body: { flex: 1, padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  stateWrap: { marginTop: 10, minHeight: 22, justifyContent: 'center' },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stateText: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});

