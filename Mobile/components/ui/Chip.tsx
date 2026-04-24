import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Chip: React.FC<Props> = ({ label, selected = false, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 34,
    borderRadius: 100,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selected: {
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
