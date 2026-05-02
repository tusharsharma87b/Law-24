import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import type { Lawyer } from '../../constants/mockData';
import { Avatar } from '../ui/Avatar';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

const RADIUS = {
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
  availability: "online" | "offline";
  experience: number;
  totalReviews: number;
  nextAvailableIn: number;
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

  const lawyerAny = l as any;
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
    availability: lawyerAny.availability ?? (l.isOnline ? "online" : "offline"),
    experience: lawyerAny.experience ?? l.experienceYears,
    totalReviews: lawyerAny.totalReviews ?? l.rating.totalReviews,
    nextAvailableIn: lawyerAny.nextAvailableIn ?? (l.isOnline ? 0 : 30),
  };
}

type Props = {
  data: LawyerCardModel;
  onPress: () => void;
  onCtaPress?: () => void;
};

export function LawyerCard({ data, onPress, onCtaPress }: Props) {
  const isOnline = data.availability === 'online';
  const ctaLabel = isOnline ? 'Join Queue' : 'Book Now';
  const availabilityText = isOnline
    ? data.nextAvailableIn > 0
      ? `Available in ${data.nextAvailableIn} mins`
      : 'Available now'
    : 'Offline';

  const handleCtaPress = (e: any) => {
    e.stopPropagation();
    if (onCtaPress) onCtaPress();
    else onPress(); // fallback
  };

  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      <LinearGradient
        colors={['#0B1220', '#111827']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Avatar with online badge */}
        <View style={styles.avatarContainer}>
          <Avatar
            name={data.name}
            initials={data.initials}
            color={data.avatarColor}
            size={64}
            verified={data.verified}
            online={false} // we'll handle badge ourselves
          />
          {isOnline && <View style={styles.onlineDot} />}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Name row */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{data.name}</Text>
            {data.verified && <View style={styles.verifiedBadge} />}
          </View>

          {/* Details */}
          <Text style={styles.details}>
            {data.city} • {data.specialization} • {data.experience} yrs exp
          </Text>

          {/* Rating & Price row */}
          <View style={styles.ratingPriceRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{data.ratingAverage.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({data.totalReviews})</Text>
            </View>
            <Text style={styles.price}>₹{data.chatPerMinuteInr}/min</Text>
          </View>

          {/* Availability */}
          <Text style={[styles.availability, isOnline ? styles.onlineText : styles.offlineText]}>
            {availabilityText}
          </Text>
        </View>
      </LinearGradient>

      {/* CTA Button - separate Pressable to avoid triggering card press */}
      <Pressable style={styles.ctaContainer} onPress={handleCtaPress}>
        <LinearGradient
          colors={['#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </LinearGradient>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 180,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#0B1220',
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
  },
  details: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviewCount: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  availability: {
    fontSize: 13,
    fontWeight: '500',
  },
  onlineText: {
    color: Colors.success,
  },
  offlineText: {
    color: Colors.textTertiary,
  },
  ctaContainer: {
    marginTop: 1, // slight separation
  },
  ctaButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
  },
  ctaText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
