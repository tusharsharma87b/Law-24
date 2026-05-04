import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
        colors={['#0B1220', '#111827', '#0B1220']}
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
          {data.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Name row */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{data.name}</Text>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>{data.experience}y</Text>
            </View>
          </View>

          {/* Details */}
          <Text style={styles.details}>
            {data.city} • {data.specialization} • {data.courtLabel}
          </Text>

          {/* Rating & Price row */}
          <View style={styles.ratingPriceRow}>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{data.ratingAverage.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({data.totalReviews} reviews)</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{data.chatPerMinuteInr}</Text>
              <Text style={styles.priceUnit}>/min</Text>
            </View>
          </View>

          {/* Availability & Response Time */}
          <View style={styles.availabilityRow}>
            <View style={[styles.availabilityBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
              <Text style={styles.availabilityText}>{availabilityText}</Text>
            </View>
            <Text style={styles.responseTime}>Response: {data.responseTimeMinutes} min</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CTA Button - separate Pressable to avoid triggering card press */}
      <Pressable style={styles.ctaContainer} onPress={handleCtaPress}>
        <LinearGradient
          colors={isOnline ? ['#7C3AED', '#6D28D9'] : ['#4B5563', '#374151']}
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 200,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.lg,
  },
  onlineDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#0B1220',
    zIndex: 10,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#0B1220',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  experienceBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: Colors.goldSubtle,
  },
  experienceText: {
    color: Colors.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  ratingPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceUnit: {
    color: Colors.textTertiary,
    fontSize: 12,
    marginLeft: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  onlineBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: Colors.successSubtle,
  },
  offlineBadge: {
    backgroundColor: 'rgba(107, 115, 142, 0.15)',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  onlineText: {
    color: Colors.success,
  },
  offlineText: {
    color: Colors.textTertiary,
  },
  responseTime: {
    color: Colors.textTertiary,
    fontSize: 12,
  },
  ctaContainer: {
    marginTop: 1,
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
