// Law24 Premium Design System — Color Tokens (Apple/OpenAI/Netflix inspired)
// World-class legal-tech platform with calm authority + intelligent minimalism

export const Colors = {
  // ── Backgrounds ──────────────────────────────
  bgPrimary:   '#050816',
  bgSecondary: '#0F172A',
  bgTertiary:  '#1E293B',
  bgElevated:  '#1A2236',
  bgOverlay:   'rgba(0,0,0,0.75)',

  // ── Glass Effects (4–8% opacity) ─────────────
  glassLight:  'rgba(255,255,255,0.04)',
  glassMedium: 'rgba(255,255,255,0.08)',
  glassDark:   'rgba(0,0,0,0.12)',

  // ── Primary CTA (Premium Purple) ───────────────
  primary:        '#5B5FFB',
  primaryDark:    '#4A4EEA',
  primarySubtle:  'rgba(91,95,251,0.12)',

  // ── Secondary (Premium Purple) ───────────────
  secondary:      '#7A5CFF',
  secondaryDark:  '#694AEE',
  secondarySubtle:'rgba(122,92,255,0.12)',

  // ── Gold Accents (Ratings, Premium) ──────────
  gold:        '#FBBF24',
  goldDim:     '#C9A84C',
  goldSubtle:  'rgba(251,191,36,0.12)',

  // ── Text ──────────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary:  '#64748B',
  textInverse:   '#0D1117',

  // ── Semantic ──────────────────────────────────
  success:        '#22C55E',
  successSubtle:  'rgba(34,197,94,0.12)',
  warning:        '#FBBF24',
  warningSubtle:  'rgba(251,191,36,0.12)',
  danger:         '#F85149',
  dangerSubtle:   'rgba(248,81,73,0.12)',
  info:           '#58A6FF',
  blue:           '#58A6FF',
  blueSubtle:     'rgba(88,166,255,0.12)',

  // ── Borders ───────────────────────────────────
  border:        'rgba(255,255,255,0.06)',
  borderSubtle:  'rgba(255,255,255,0.03)',
  borderActive:  '#5B5FFB',
  borderGold:    '#FBBF24',
} as const;

export type ColorKey = keyof typeof Colors;
