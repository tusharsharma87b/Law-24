import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Colors } from '../../constants/colors';
import type { DirectoryLawyer } from '../../constants/lawyersDirectory';

type Props = {
  item: DirectoryLawyer;
  onPress: () => void;
  rail?: boolean;
};

export const LawyerDirectoryCard = React.memo(function LawyerDirectoryCard({ item, onPress, rail }: Props) {
  const langLine = item.languages.slice(0, 3).join(' · ');
  const priceDisplay = `₹${item.pricePerMin}/min`;
  const expDisplay = `${item.experience} yr${item.experience !== 1 ? 's' : ''} exp`;

  return (
    <TouchableOpacity
      style={[styles.card, rail && styles.cardRail]}
      onPress={onPress}
      activeOpacity={0.86}
    >
      {/* Online badge — top-right corner */}
      {item.online && (
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineTxt}>Online</Text>
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
            <MaterialIcons name="star" size={13} color={Colors.gold} />
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
          <MaterialIcons name="schedule" size={12} color={Colors.textTertiary} />
          <Text style={styles.statTxt}>{item.responseTime}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <MaterialIcons name="language" size={12} color={Colors.textTertiary} />
          <Text style={styles.statTxt} numberOfLines={1}>{langLine}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.price}>{priceDisplay}</Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity style={[styles.cta, !item.online && styles.ctaOffline]} onPress={onPress} activeOpacity={0.85}>
        <MaterialIcons
          name={item.online ? 'video-call' : 'schedule'}
          size={16}
          color="#fff"
        />
        <Text style={styles.ctaTxt}>{item.online ? 'Talk Now' : 'Book Call'}</Text>
      </TouchableOpacity>
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

  // Online badge — top right absolute
  onlineBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)',
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  onlineTxt: { fontSize: 10, fontWeight: '700', color: Colors.success },

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

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  ctaOffline: { backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border },
  ctaTxt: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
});
