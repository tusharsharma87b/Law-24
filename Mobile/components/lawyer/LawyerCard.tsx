import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, Radius, Shadow } from '../../constants/spacing';
import { T } from '../../constants/typography';
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
  const availabilityText = isOnline
    ? data.nextAvailableIn > 0
      ? `Available in ${data.nextAvailableIn} min`
      : 'Available now'
    : 'Offline';

  const handleCtaPress = (e: any) => {
    e.stopPropagation();
    if (onCtaPress) onCtaPress();
    else onPress(); // fallback
  };

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress} activeOpacity={0.85} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
      {/* Subtle inner glow overlay */}
      <LinearGradient
        colors={['rgba(91, 95, 251, 0.03)', 'rgba(122, 92, 255, 0.01)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.innerGlow}
      />
      <View style={styles.card}>
        {/* Row 1: Avatar + Name + Online Dot */}
        <View style={styles.row1}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: data.avatarColor }]}>
              <Text style={styles.avatarText}>{data.initials}</Text>
            </View>
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={2}>{data.name}</Text>
            <Text style={styles.specialization}>{data.specialization}</Text>
          </View>
        </View>

        {/* Row 2: Rating + Reviews */}
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={14} color={Colors.gold} />
          <Text style={styles.ratingText}>{data.ratingAverage.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>• {data.totalReviews} reviews</Text>
        </View>

        {/* Row 3: Availability + Price */}
        <View style={styles.bottomRow}>
          <View style={[
            styles.availabilityBadge,
            isOnline ? styles.availabilityOnline : styles.availabilityOffline
          ]}>
            <Text style={styles.availabilityText}>{availabilityText}</Text>
          </View>
          <Text style={styles.price}>₹{data.chatPerMinuteInr}/min</Text>
        </View>

        {/* Row 4: Consult Now Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleCtaPress}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <LinearGradient
            colors={['#5B5FFB', '#7A5CFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.ctaText}>Consult Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 260,
    height: 200,
    borderRadius: Radius.card,
    backgroundColor: Colors.bgSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.elevated,
    marginHorizontal: Spacing.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.card,
    zIndex: 1,
  },
  card: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 2,
    position: 'relative',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    ...T.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  specialization: {
    ...T.bodySm,
    color: Colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  ratingText: {
    ...T.bodySm,
    color: Colors.gold,
    fontWeight: '600',
  },
  reviewCount: {
    ...T.caption,
    color: Colors.textTertiary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  availabilityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.chip,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  availabilityOnline: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  availabilityOffline: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  availabilityText: {
    ...T.captionSm,
    color: Colors.success,
    fontWeight: '600',
  },
  price: {
    ...T.h4,
    color: Colors.textPrimary,
  },
  ctaButton: {
    height: 46,
    width: '100%',
    borderRadius: Radius.button,
    overflow: 'hidden',
    marginTop: Spacing.md,
    ...Shadow.glow,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    ...T.button,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
