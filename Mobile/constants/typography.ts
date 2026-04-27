// Law24 — Typography Scale (PRD v2.0)
// Font: System font (DM Sans requires native font loading — add in Phase 2)

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  h1:         { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  h2:         { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body:       { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  small:      { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

// Pre-built text styles with color applied
export const T = {
  h1:         { ...Typography.h1,         color: Colors.textPrimary },
  h2:         { ...Typography.h2,         color: Colors.textPrimary },
  body:       { ...Typography.body,       color: Colors.textPrimary },
  small:      { ...Typography.small,      color: Colors.textSecondary },
} as const;
