// Law24 Design System — Color Tokens (PRD v2.0)
// Primary CTA: Blue (#3B5BDB) matching Stitch design
// Gold (#F5A623): NyayaAI, ratings, premium accents

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bgPrimary:   '#0D1117',
  bgSecondary: '#161B22',
  bgTertiary:  '#1C2128',
  bgElevated:  '#21262D',
  bgOverlay:   'rgba(0,0,0,0.75)',

  // ── Primary CTA (Blue — Stitch design) ───────
  primary:        '#3B5BDB',
  primaryDark:    '#2F4AC0',
  primarySubtle:  'rgba(59,91,219,0.14)',

  // ── Gold Accents (NyayaAI, Premium, Stars) ───
  gold:        '#F5A623',
  goldDim:     '#C9A84C',
  goldSubtle:  'rgba(245,166,35,0.12)',

  // ── Info / Link Blue ──────────────────────────
  blue:        '#3B7DD8',
  blueSubtle:  'rgba(59,125,216,0.12)',

  // ── Text ──────────────────────────────────────
  textPrimary:   '#F0F6FC',
  textSecondary: '#8B949E',
  textTertiary:  '#484F58',
  textInverse:   '#0D1117',

  // ── Semantic ──────────────────────────────────
  success:        '#3FB950',
  successSubtle:  'rgba(63,185,80,0.12)',
  warning:        '#D29922',
  warningSubtle:  'rgba(210,153,34,0.14)',
  danger:         '#F85149',
  dangerSubtle:   'rgba(248,81,73,0.12)',
  info:           '#58A6FF',

  // ── Borders ───────────────────────────────────
  border:        '#30363D',
  borderSubtle:  '#21262D',
  borderActive:  '#3B5BDB',
  borderGold:    '#F5A623',
} as const;

export type ColorKey = keyof typeof Colors;
