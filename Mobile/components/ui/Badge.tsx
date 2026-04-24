import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

type Variant = 'gold' | 'blue' | 'success' | 'danger' | 'warning' | 'gray' | 'primary';
type Size = 'sm' | 'md';

interface Props {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: ViewStyle;
  uppercase?: boolean;
}

const BG: Record<Variant, string> = {
  gold:    Colors.goldSubtle,
  blue:    Colors.blueSubtle,
  primary: Colors.primarySubtle,
  success: Colors.successSubtle,
  danger:  Colors.dangerSubtle,
  warning: Colors.warningSubtle,
  gray:    Colors.bgElevated,
};

const TEXT: Record<Variant, string> = {
  gold:    Colors.gold,
  blue:    Colors.blue,
  primary: Colors.primary,
  success: Colors.success,
  danger:  Colors.danger,
  warning: Colors.warning,
  gray:    Colors.textSecondary,
};

export const Badge: React.FC<Props> = ({
  label,
  variant = 'gray',
  size = 'sm',
  style,
  uppercase = false,
}) => {
  return (
    <View style={[styles.base, styles[size], { backgroundColor: BG[variant] }, style]}>
      <Text style={[styles.text, { color: TEXT[variant] }, size === 'md' && styles.textMd]}>
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
  },
  sm: { height: 22, justifyContent: 'center' },
  md: { height: 28, justifyContent: 'center', paddingHorizontal: 14 },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textMd: { fontSize: 12 },
});
