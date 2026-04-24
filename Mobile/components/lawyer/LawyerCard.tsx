import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/colors';
import type { Lawyer } from '../../constants/mockData';

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
  verified?: boolean;
};

export function mapLawyerToCardModel(l: Lawyer): LawyerCardModel {
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
    verified: l.verified,
  };
}

type Props = {
  data: LawyerCardModel;
  onPress: () => void;
  ctaLabel?: 'Talk Now' | 'Consult';
  avatarSize?: number;
};

export function LawyerCard({ data, onPress, ctaLabel = 'Talk Now', avatarSize = 52 }: Props) {
  const respondMins = data.isOnline
    ? Math.min(2, Math.max(1, data.responseTimeMinutes))
    : Math.max(1, data.responseTimeMinutes);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.avatarRow}>
        <Avatar
          name={data.name}
          size={avatarSize}
          initials={data.initials}
          color={data.avatarColor}
          online={data.isOnline}
          verified={data.verified}
        />
        {data.isOnline ? (
          <View style={styles.onlinePill}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlinePillText}>Online</Text>
          </View>
        ) : (
          <View style={[styles.onlinePill, styles.offlinePill]}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlinePillText}>Offline</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{data.name}</Text>
      <Text style={styles.spec} numberOfLines={1}>
        {data.specialization}
      </Text>
      <Text style={styles.respond}>Responds in {respondMins} mins</Text>
      <View style={styles.metaRow}>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={13} color={Colors.gold} />
          <Text style={styles.ratingTxt}>{data.ratingAverage.toFixed(1)}</Text>
        </View>
        <Text style={styles.price}>Starting at ₹{data.chatPerMinuteInr}/min</Text>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaTxt}>{ctaLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 7,
  },
  avatarRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offlinePill: { backgroundColor: Colors.bgElevated },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B7280' },
  onlinePillText: { fontSize: 10, fontWeight: '600', color: Colors.success },
  offlinePillText: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  name: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    width: '100%',
  },
  spec: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  respond: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingTxt: { color: Colors.gold, fontSize: 12, fontWeight: '600' },
  price: { color: Colors.gold, fontSize: 11, fontWeight: '600', flexShrink: 1 },
  cta: {
    marginTop: 12,
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
