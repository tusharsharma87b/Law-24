// Law24 Premium Design System — Color Tokens (Apple/OpenAI/Netflix inspired)
// World-class legal-tech platform with calm authority + intelligent minimalism

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bgPrimary:   '#0B0F1A',
  bgSecondary: '#121826',
  bgTertiary:  '#161D2E',
  bgElevated:  '#1A2236',
  bgOverlay:   'rgba(0,0,0,0.75)',

  // ── Glass Effects (4–8% opacity) ─────────────
  glassLight:  'rgba(255,255,255,0.04)',
  glassMedium: 'rgba(255,255,255,0.08)',
  glassDark:   'rgba(0,0,0,0.12)',

  // ── Primary CTA (Premium Blue) ───────────────
  primary:        '#4F7CFF',
  primaryDark:    '#3E6AEE',
  primarySubtle:  'rgba(79,124,255,0.12)',

  // ── Secondary (Premium Purple) ───────────────
  secondary:      '#7A5CFF',
  secondaryDark:  '#694AEE',
  secondarySubtle:'rgba(122,92,255,0.12)',

  // ── Gold Accents (Ratings, Premium) ──────────
  gold:        '#F5A623',
  goldDim:     '#C9A84C',
  goldSubtle:  'rgba(245,166,35,0.12)',

  // ── Text ──────────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary:  '#6B738E',
  textInverse:   '#0D1117',

  // ── Semantic ──────────────────────────────────
  success:        '#22C55E',
  successSubtle:  'rgba(34,197,94,0.12)',
  warning:        '#F59E0B',
  warningSubtle:  'rgba(245,158,11,0.12)',
  danger:         '#F85149',
  dangerSubtle:   'rgba(248,81,73,0.12)',
  info:           '#58A6FF',

  // ── Borders ───────────────────────────────────
  border:        '#1F2937',
  borderSubtle:  '#1F2937',
  borderActive:  '#4F7CFF',
  borderGold:    '#F5A623',
} as const;

export type ColorKey = keyof typeof Colors;
