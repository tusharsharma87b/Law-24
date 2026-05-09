// Law24 — Premium Design System Spacing & Radius Tokens
// Apple/CRED/Zomato inspired premium feel

export const Spacing = {
  // Base 8-pt grid
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  x2l:  24,
  x3l:  28,
  x4l:  32,
  x5l:  36,
  x6l:  40,
  x7l:  44,
  x8l:  48,
} as const;

// Screen-level spacing (consistent across app)
export const ScreenSpacing = {
  horizontal: 24,  // Screen horizontal padding
  vertical:   24,  // Screen vertical padding
} as const;

// Card internal spacing
export const CardSpacing = {
  internal: 22,    // Card internal padding
  compact:  16,    // Compact card padding
} as const;

// Section gaps
export const SectionSpacing = {
  small:  28,
  medium: 32,
  large:  36,
} as const;

// Premium radius system
export const Radius = {
  // Component-specific radii
  chip:     22,    // Chips, tags, filter pills
  card:     26,    // Cards, containers
  button:   20,    // CTA buttons
  input:    18,    // Input fields
  avatar:   100,   // Circular avatars
  
  // Generic radii
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  x2l:  24,
  x3l:  28,
  full: 100,
} as const;

// Premium shadow system
export const Shadow = {
  // Subtle card shadow (default elevation)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  // Elevated card (hover/active states)
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  // Premium glow (active chips, premium elements)
  glow: {
    shadowColor: '#5B5FFB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  // Gold accent (ratings, premium badges)
  gold: {
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  // Floating button/CTA
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
} as const;
