import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { AppIcon } from './AppIcon';

interface Props {
  name: string;
  size?: number;
  imageUri?: string;
  verified?: boolean;
  online?: boolean;
  color?: string;
  initials?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<Props> = ({
  name,
  size = 48,
  verified = false,
  online = false,
  color,
  initials,
  style,
}) => {
  const getInitials = () => {
    if (initials) return initials;
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const bgColor = color || '#2A3342';
  const fontSize = size * 0.35;
  const badgeSize = size * 0.28;

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
      </View>

      {verified && (
        <View
          style={[
            styles.badge,
            styles.verifiedBadge,
            { width: badgeSize + 4, height: badgeSize + 4, borderRadius: (badgeSize + 4) / 2 },
          ]}
        >
          <AppIcon name="verified" size={badgeSize * 0.62} color="#FFFFFF" strokeWidth={2} />
        </View>
      )}

      {online && (
        <View
          style={[
            styles.badge,
            styles.onlineDot,
            { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, top: 0, right: 0, bottom: undefined },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignSelf: 'flex-start' },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bgSecondary,
  },
  verifiedBadge: {
    backgroundColor: '#4F6EF7',
    top: -2,
    right: -2,
    bottom: undefined,
  },
  onlineDot: {
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.bgPrimary,
  },
});
