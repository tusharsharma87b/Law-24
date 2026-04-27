// Law24 Design System — Color Tokens (PRD v2.0)
// Primary CTA: Blue (#3B5BDB) matching Stitch design
// Gold (#F5A623): NyayaAI, ratings, premium accents

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bgPrimary:   '#0B0F1A',
  bgSecondary: '#121826',
  bgTertiary:  '#161D2E',
  bgElevated:  '#161D2E',
  bgOverlay:   'rgba(0,0,0,0.75)',

  // ── Primary CTA (Blue — Stitch design) ───────
  primary:        '#4F6EF7',
  primaryDark:    '#3E5CE6',
  primarySubtle:  'rgba(79,110,247,0.14)',

  // ── Gold Accents (NyayaAI, Premium, Stars) ───
  gold:        '#F5A623',
  goldDim:     '#C9A84C',
  goldSubtle:  'rgba(245,166,35,0.12)',

  // ── Info / Link Blue ──────────────────────────
  blue:        '#4F6EF7',
  blueSubtle:  'rgba(79,110,247,0.12)',

  // ── Text ──────────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A8C0',
  textTertiary:  '#6B738E',
  textInverse:   '#0D1117',

  // ── Semantic ──────────────────────────────────
  success:        '#22C55E',
  successSubtle:  'rgba(34,197,94,0.14)',
  warning:        '#F59E0B',
  warningSubtle:  'rgba(245,158,11,0.14)',
  danger:         '#F85149',
  dangerSubtle:   'rgba(248,81,73,0.12)',
  info:           '#58A6FF',

  // ── Borders ───────────────────────────────────
  border:        '#1F2937',
  borderSubtle:  '#1F2937',
  borderActive:  '#4F6EF7',
  borderGold:    '#F5A623',
} as const;

export type ColorKey = keyof typeof Colors;
