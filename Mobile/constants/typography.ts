// Law24 — Premium Typography Scale (Apple/CRED/Zomato inspired)
// Font: System font (DM Sans requires native font loading — add in Phase 2)

import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const Typography: Record<string, TextStyle> = {
  // Headings
  display:    { fontSize: 32, fontWeight: '800', lineHeight: 40, letterSpacing: -0.5 },
  h1:         { fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.3 },
  h2:         { fontSize: 22, fontWeight: '700', lineHeight: 30 },
  h3:         { fontSize: 18, fontWeight: '700', lineHeight: 26 },
  h4:         { fontSize: 16, fontWeight: '600', lineHeight: 24 },
  
  // Body text
  bodyLg:     { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body:       { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  bodySm:     { fontSize: 13, fontWeight: '400', lineHeight: 20 },
  
  // Captions & labels
  caption:    { fontSize: 12, fontWeight: '500', lineHeight: 18, letterSpacing: 0.2 },
  captionSm:  { fontSize: 11, fontWeight: '500', lineHeight: 16, letterSpacing: 0.3 },
  label:      { fontSize: 10, fontWeight: '600', lineHeight: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
  
  // Special
  buttonLg:   { fontSize: 16, fontWeight: '700', lineHeight: 24, letterSpacing: 0.3 },
  button:     { fontSize: 14, fontWeight: '700', lineHeight: 20, letterSpacing: 0.2 },
  buttonSm:   { fontSize: 12, fontWeight: '700', lineHeight: 18, letterSpacing: 0.1 },
};

// Pre-built text styles with color applied (premium hierarchy)
export const T = {
  display:    { ...Typography.display,    color: Colors.textPrimary },
  h1:         { ...Typography.h1,         color: Colors.textPrimary },
  h2:         { ...Typography.h2,         color: Colors.textPrimary },
  h3:         { ...Typography.h3,         color: Colors.textPrimary },
  h4:         { ...Typography.h4,         color: Colors.textPrimary },
  
  bodyLg:     { ...Typography.bodyLg,     color: Colors.textPrimary },
  body:       { ...Typography.body,       color: Colors.textPrimary },
  bodySm:     { ...Typography.bodySm,     color: Colors.textPrimary },
  
  caption:    { ...Typography.caption,    color: Colors.textSecondary },
  captionSm:  { ...Typography.captionSm,  color: Colors.textTertiary },
  label:      { ...Typography.label,      color: Colors.textTertiary },
  
  buttonLg:   { ...Typography.buttonLg,   color: Colors.textPrimary },
  button:     { ...Typography.button,     color: Colors.textPrimary },
  buttonSm:   { ...Typography.buttonSm,   color: Colors.textPrimary },
  
  // Special variants
  gold:       { ...Typography.h3,         color: Colors.gold },
  primary:    { ...Typography.h4,         color: Colors.primary },
  success:    { ...Typography.body,       color: Colors.success },
  danger:     { ...Typography.body,       color: Colors.danger },
} as const;
