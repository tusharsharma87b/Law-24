import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = true,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        sizes[size],
        fullWidth && { width: '100%' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'gold' ? '#fff' : Colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, textColors[variant], textSizes[size], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  base: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#5B6EF5',
  },
  secondary: {
    backgroundColor: '#1F2937',
  },
  ghost: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'transparent',
  },
  gold: {
    backgroundColor: Colors.gold,
  },
  disabled: { opacity: 0.45 },
  text: { fontWeight: '600', letterSpacing: 0.2 },
});

const sizes = StyleSheet.create({
  sm: { height: 44, paddingHorizontal: 16 },
  md: { height: 48, paddingHorizontal: 16 },
  lg: { height: 48, paddingHorizontal: 20 },
});

const textColors = StyleSheet.create({
  primary:   { color: '#FFFFFF' },
  secondary: { color: '#D1D5DB' },
  ghost:     { color: '#9CA3AF' },
  gold:      { color: Colors.textInverse },
});

const textSizes = StyleSheet.create({
  sm: { fontSize: 13 },
  md: { fontSize: 14 },
  lg: { fontSize: 14 },
});
