import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
  const priceDisplay = `₹${item.pricePerMin}/min`;
  const initials = item.initials || item.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <View style={[styles.card, rail && styles.cardRail]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor || '#4F46E5' }]}>
          <Text style={styles.initials}>{initials}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={14} color="#fff" />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Adv. {item.name}</Text>
          <Text style={styles.meta}>
            {item.city} • {item.specialization}
          </Text>

          <View style={styles.rowBetween}>
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            <Text style={styles.price}>{priceDisplay}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.cta, !item.online && styles.ctaOffline]} 
        onPress={onPress} 
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>{item.online ? 'Talk Now' : 'Consult Later'}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardRail: {
    width: 280,
    marginRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  initials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 1,
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  meta: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '700',
  },
  price: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cta: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  ctaOffline: {
    backgroundColor: '#1E293B',
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
