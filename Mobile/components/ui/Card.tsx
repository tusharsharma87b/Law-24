import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  bordered?: boolean;
  goldBorder?: boolean;
  elevated?: boolean;
  padding?: number;
}

export const Card: React.FC<Props> = ({
  children,
  style,
  bordered = false,
  goldBorder = false,
  elevated = false,
  padding = 16,
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding },
        elevated && styles.elevated,
        bordered && styles.bordered,
        goldBorder && styles.goldBorder,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
  },
  elevated: {
    backgroundColor: Colors.bgElevated,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goldBorder: {
    borderWidth: 1,
    borderColor: Colors.goldSubtle,
  },
});
