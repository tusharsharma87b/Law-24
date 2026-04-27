import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

type Props = {
  message?: string;
};

export function LoadingScreen({ message = 'Loading...' }: Props) {
  return (
    <View style={styles.root}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

