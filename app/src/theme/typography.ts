import { Platform } from 'react-native';

// Inter font family — loaded via expo-font in App.tsx (Phase 0)
const fontFamily = Platform.select({
  ios: 'Inter',
  android: 'Inter',
  default: 'Inter',
});

export const typography = {
  fontFamily,

  // Size scale — from design.md
  sizes: {
    xs: 10,
    sm: 12,    // Small / meta — timestamps, secondary labels
    md: 14,    // Body
    lg: 16,    // Button text
    xl: 18,    // H3 / Screen title
    xxl: 20,   // H2 — section titles
    xxxl: 24,  // H1 — onboarding headlines
    hero: 28,  // Large hero text
  },

  // Weight scale
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Pre-composed text styles (reference only, applied via StyleSheet)
  presets: {
    h1: { fontSize: 24, fontWeight: '700' as const },
    h2: { fontSize: 20, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
    button: { fontSize: 16, fontWeight: '600' as const },
  },
} as const;
