import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import type { DiscoveryLawyer } from '../../constants/lawyerDiscovery';
import { AppIcon } from '../ui/AppIcon';

type Props = {
  item: DiscoveryLawyer;
  onPress: () => void;
};

export const LawyerDiscoveryListCard = React.memo(function LawyerDiscoveryListCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.topRow}>
        <View style={{ width: 52, height: 52, borderRadius: 26, overflow: "hidden", backgroundColor: item.avatarColor, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "600" }}>{item.initials}</Text>
        </View>
        <View style={styles.topMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              Adv. {item.name}
            </Text>
            {item.online ? (
              <View style={styles.onlinePill}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineTxt}>Online</Text>
              </View>
            ) : (
              <View style={[styles.onlinePill, styles.offlinePill]}>
                <View style={styles.offlineDot} />
                <Text style={styles.offlineTxt}>Offline</Text>
              </View>
            )}
          </View>
          <Text style={styles.category}>{item.categoryLabel}</Text>
          <View style={styles.ratingRow}>
            <AppIcon name="rating" size={14} color={Colors.gold} />
            <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.respond}> · Responds in {item.responseTime}</Text>
          </View>
          <Text style={styles.price}>Starting at ₹{item.price}/min</Text>
        </View>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaTxt}>Talk Now</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#121826',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  topRow: { flexDirection: 'row', gap: 12 },
  topMeta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  category: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  rating: { fontSize: 13, fontWeight: '600', color: Colors.gold },
  respond: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  price: { fontSize: 13, fontWeight: '600', color: Colors.gold, marginTop: 6 },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  offlinePill: { backgroundColor: Colors.bgElevated },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6B7280' },
  onlineTxt: { fontSize: 10, fontWeight: '600', color: Colors.success },
  offlineTxt: { fontSize: 10, fontWeight: '600', color: '#9CA3AF' },
  cta: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4F6BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
