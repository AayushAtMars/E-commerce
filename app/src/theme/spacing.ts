// Spacing scale — from design.md: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px
// Screen horizontal padding is consistently ~20px across all observed screens.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Specific semantic values
  screenHorizontal: 20,
  screenVertical: 16,
  cardPadding: 16,
  inputHeight: 52,
  buttonHeight: 56,
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 100,  // Full pill-shaped buttons
  },
} as const;
