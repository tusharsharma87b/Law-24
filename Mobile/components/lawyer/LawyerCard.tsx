import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import type { Lawyer } from '../../constants/mockData';
import { AppIcon } from '../ui/AppIcon';

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

  return (
    <View style={styles.shadowContainer}>
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{data.initials}</Text>
            </View>
            <View style={styles.nameStatusRow}>
              <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                {data.name}
              </Text>
              <View style={[styles.onlineBadge, !data.isOnline && styles.offlineBadge]}>
                <Text style={[styles.onlineText, !data.isOnline && styles.offlineText]}>
                  {data.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.cityCourt} numberOfLines={1}>{data.city} • {data.courtLabel}</Text>
          <Text style={styles.spec} numberOfLines={1}>{data.specialization}</Text>
          <Text style={styles.respond}>Responds in {respondMins} mins</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <AppIcon name="rating" size={16} color={Colors.gold} />
              <Text style={styles.ratingTxt}>{data.ratingAverage.toFixed(1)}</Text>
            </View>
            <Text style={styles.price}>₹{data.chatPerMinuteInr}/min</Text>
          </View>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTxt}>{ctaLabel}</Text>
        </View>
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
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
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
  nameStatusRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(34,197,94,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    marginLeft: SPACING.sm,
    flexShrink: 0,
  },
  offlineBadge: {
    backgroundColor: 'rgba(107,114,128,0.14)',
    borderColor: 'rgba(107,114,128,0.25)',
  },
  onlineText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '500',
  },
  offlineText: {
    color: '#9CA3AF',
  },
  name: {
    flex: 1,
    minWidth: 0,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cityCourt: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: SPACING.sm,
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
});

