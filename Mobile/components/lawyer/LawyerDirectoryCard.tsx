import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/colors';
import type { DirectoryLawyer } from '../../constants/lawyersDirectory';
import { AppIcon } from '../ui/AppIcon';

type Props = {
  item: DirectoryLawyer;
  onPress: () => void;
  rail?: boolean;
};

export const LawyerDirectoryCard = React.memo(function LawyerDirectoryCard({ item, onPress, rail }: Props) {
  const langLine = item.languages.slice(0, 3).join(' · ');
  const priceDisplay = `₹${item.pricePerMin}/min`;
  const expDisplay = `${item.experience} yr${item.experience !== 1 ? 's' : ''} exp`;

  const handleNotify = () => {
    Alert.alert('Get notified', `We’ll notify you when ${item.name} is online.`, [{ text: 'OK' }]);
    console.log('Notify request:', item.id);
  };

  const isBusy = item.online && item.queue > 0;

  return (
    <TouchableOpacity
      style={[styles.card, rail && styles.cardRail]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      {/* Availability badge */}
      {item.online && !isBusy ? (
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineTxt}>Online</Text>
        </View>
      ) : isBusy ? (
        <View style={styles.busyBadge}>
          <Text style={styles.busyTxt}>Busy</Text>
        </View>
      ) : (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineTxt}>Offline • {item.lastSeen ?? 'Recently'}</Text>
        </View>
      )}

      <View style={styles.topRow}>
        <Avatar
          name={item.name}
          size={54}
          initials={item.initials}
          color={item.avatarColor}
          online={item.online}
          verified={item.verified}
        />

        <View style={styles.meta}>
          {/* Name */}
          <Text style={styles.name} numberOfLines={1}>Adv. {item.name}</Text>
          {/* Specialization */}
          <Text style={styles.spec} numberOfLines={1}>{item.specialization}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <AppIcon name="rating" size={13} color={Colors.gold} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({item.reviews})</Text>
            <View style={styles.dot} />
            <Text style={styles.exp}>{expDisplay}</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <AppIcon name="time" size={12} color={Colors.textTertiary} />
          <Text style={styles.statTxt}>{item.responseTime}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <AppIcon name="language" size={12} color={Colors.textTertiary} />
          <Text style={styles.statTxt} numberOfLines={1}>{langLine}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.price}>{priceDisplay}</Text>
        </View>
      </View>

      <Text style={styles.debugLine}>
        {item.name} - {item.online ? 'ONLINE' : 'OFFLINE'} - Queue: {item.queue}
      </Text>

      {/* CTA logic */}
      {item.online && item.queue === 0 ? (
        <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.primaryBtnTxt}>Talk Now</Text>
        </TouchableOpacity>
      ) : item.online && item.queue > 0 ? (
        <View style={styles.busyWrap}>
          <Text style={styles.queueText}>{item.queue} in queue • ~5 min wait</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.primaryBtnTxt}>Join Queue</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.offlineActions}>
          <Text style={styles.offlineLastSeen}>Last seen {item.lastSeen ?? 'recently'}</Text>
          <TouchableOpacity style={styles.notifyBtn} onPress={handleNotify} activeOpacity={0.85}>
            <Text style={styles.notifyBtnTxt}>Notify when available</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={onPress} activeOpacity={0.85}>
            <Text style={styles.outlineBtnTxt}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardRail: { marginBottom: 0 },

  // Availability badges
  onlineBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#064E3B',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  onlineTxt: { fontSize: 11, fontWeight: '700', color: '#22C55E' },
  busyBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#78350F',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  busyTxt: { fontSize: 11, fontWeight: '700', color: '#FBBF24' },
  offlineBadge: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#1F2937',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  offlineTxt: { fontSize: 11, fontWeight: '600', color: '#D1D5DB' },

  topRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  meta: { flex: 1, minWidth: 0, paddingRight: 52 },

  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  spec: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, fontWeight: '500' },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  rating: { fontSize: 12, fontWeight: '700', color: Colors.gold },
  reviews: { fontSize: 11, color: Colors.textTertiary },
  exp: { fontSize: 11, color: Colors.textTertiary },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textTertiary },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    borderRadius: 10, padding: 10, marginBottom: 14, gap: 8,
  },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0 },
  statTxt: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  statDivider: { width: 1, height: 14, backgroundColor: Colors.border },
  price: { fontSize: 12, fontWeight: '700', color: Colors.gold },

  debugLine: {
    color: Colors.textTertiary,
    fontSize: 10,
    marginBottom: 8,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  busyWrap: { gap: 8 },
  queueText: { color: '#FBBF24', fontSize: 11, fontWeight: '600' },
  offlineActions: { gap: 8 },
  offlineLastSeen: { color: '#9CA3AF', fontSize: 11 },
  notifyBtn: {
    backgroundColor: '#1F2937',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifyBtnTxt: { color: '#D1D5DB', fontSize: 14, fontWeight: '500' },
  outlineBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnTxt: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
});
