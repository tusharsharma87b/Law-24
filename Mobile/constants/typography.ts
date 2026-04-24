// Law24 — Typography Scale (PRD v2.0)
// Font: System font (DM Sans requires native font loading — add in Phase 2)

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  displayXl:  { fontSize: 32, fontWeight: '700', lineHeight: 39 },
  displayLg:  { fontSize: 28, fontWeight: '700', lineHeight: 35 },
  displayMd:  { fontSize: 24, fontWeight: '600', lineHeight: 31 },
  heading:    { fontSize: 20, fontWeight: '600', lineHeight: 27 },
  subheading: { fontSize: 17, fontWeight: '500', lineHeight: 24 },
  bodyLg:     { fontSize: 16, fontWeight: '400', lineHeight: 26 },
  body:       { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  caption:    { fontSize: 12, fontWeight: '400', lineHeight: 17 },
  micro:      { fontSize: 11, fontWeight: '400', lineHeight: 14 },
};

// Pre-built text styles with color applied
export const T = {
  displayXl:  { ...Typography.displayXl,  color: Colors.textPrimary },
  displayLg:  { ...Typography.displayLg,  color: Colors.textPrimary },
  displayMd:  { ...Typography.displayMd,  color: Colors.textPrimary },
  heading:    { ...Typography.heading,    color: Colors.textPrimary },
  subheading: { ...Typography.subheading, color: Colors.textPrimary },
  bodyLg:     { ...Typography.bodyLg,     color: Colors.textPrimary },
  body:       { ...Typography.body,       color: Colors.textPrimary },
  bodySm:     { ...Typography.bodySm,     color: Colors.textPrimary },
  caption:    { ...Typography.caption,    color: Colors.textSecondary },
  micro:      { ...Typography.micro,      color: Colors.textTertiary },
} as const;
