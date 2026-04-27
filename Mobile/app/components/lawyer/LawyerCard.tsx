import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import type { Lawyer } from '../../../constants/mockData';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export type LawyerCardModel = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  isOnline: boolean;
  specialization: string;
  ratingAverage: number;
  chatPerMinuteInr: number;
  responseTimeMinutes: number;
  city: string;
  courtLabel: string;
  lastSeen: string | null;
  queue: number;
  verified?: boolean;
};

export function mapLawyerToCardModel(l: Lawyer): LawyerCardModel {
  const firstCourt = l.courts[0]?.name ?? '';
  const courtLabel = firstCourt.includes('High Court')
    ? 'High Court'
    : firstCourt.includes('District')
      ? 'District Court'
      : firstCourt.includes('Supreme')
        ? 'Supreme Court'
        : 'District Court';

  const lastSeenPool = ['30 mins ago', '2 hrs ago', '45 mins ago', '1 hr ago'];
  const fallbackSeen = lastSeenPool[(l.id.charCodeAt(l.id.length - 1) || 0) % lastSeenPool.length];
  const queue = l.isOnline ? ((l.id.charCodeAt(0) || 0) % 4) : 0;

  return {
    id: l.id,
    name: l.name,
    initials: l.initials,
    avatarColor: l.avatarColor,
    isOnline: l.isOnline,
    specialization: l.specializations[0] ?? l.designation,
    ratingAverage: l.rating.average,
    chatPerMinuteInr: l.fees.chatPerMinuteInr,
    responseTimeMinutes: l.responseTimeMinutes,
    city: l.city,
    courtLabel,
    lastSeen: l.isOnline ? null : fallbackSeen,
    queue,
    verified: l.verified,
  };
}

type Props = {
  data: LawyerCardModel;
  onPress: () => void;
  ctaLabel?: 'Talk Now' | 'Consult';
};

export function LawyerCard({ data, onPress, ctaLabel = 'Talk Now' }: Props) {
  const respondMins = data.isOnline
    ? Math.min(2, Math.max(1, data.responseTimeMinutes))
    : Math.max(1, data.responseTimeMinutes);

  const handleNotify = () => {
    Alert.alert('Get notified', `We’ll notify you when ${data.name} is online.`, [{ text: 'OK' }]);
    console.log('Notify request:', data.id);
  };

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
        {data.isOnline ? (
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineText}>Online</Text>
          </View>
        ) : (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Offline • {data.lastSeen ?? 'Recently active'}</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{data.initials}</Text>
            </View>
          </View>

          <Text style={styles.name} numberOfLines={1}>{data.name}</Text>
          <Text style={styles.cityCourt} numberOfLines={1}>{data.city} • {data.courtLabel}</Text>
          <Text style={styles.spec} numberOfLines={1}>{data.specialization}</Text>
          <Text style={styles.respond}>Responds in {respondMins} mins</Text>
          {data.isOnline && data.queue > 0 ? (
            <Text style={styles.queueText}>{data.queue} in queue • ~5 min wait</Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <MaterialIcons name="star-border" size={16} color={Colors.gold} />
              <Text style={styles.ratingTxt}>{data.ratingAverage.toFixed(1)}</Text>
            </View>
            <Text style={styles.price}>₹{data.chatPerMinuteInr}/min</Text>
          </View>
        </View>

        {data.isOnline ? (
          <TouchableOpacity style={styles.cta} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.ctaTxt}>{ctaLabel}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.offlineCtaWrap}>
            <TouchableOpacity style={styles.notifyBtn} onPress={handleNotify} activeOpacity={0.85}>
              <Text style={styles.notifyTxt}>Notify when available</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={onPress} activeOpacity={0.85}>
              <Text style={styles.outlineTxt}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 0,
  },
  card: {
    width: '100%',
    minHeight: 236,
    borderRadius: 20,
    backgroundColor: '#0B1220',
    padding: 16,
    justifyContent: 'space-between',
  },
  content: { gap: 0 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B6EF5',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  onlineText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '500',
  },
  offlineBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#1F2937',
  },
  offlineText: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '500',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  cityCourt: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: SPACING.xs,
  },
  spec: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  respond: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  queueText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: SPACING.xs,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingTxt: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  price: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  cta: {
    marginTop: SPACING.lg,
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  offlineCtaWrap: {
    marginTop: SPACING.lg,
    gap: 8,
  },
  notifyBtn: {
    backgroundColor: '#1F2937',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyTxt: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  outlineBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineTxt: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
});

