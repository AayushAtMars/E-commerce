// Design system color tokens — sourced from design.md + screenshot verification
export const colors = {
  // Brand
  primary: '#401900',      // Deep brown — buttons, headers, active nav bg
  accent: '#F8B057',       // Orange — icons, stars, highlights, badges

  // Text
  textPrimary: '#242424',  // Headings, primary body text
  textSecondary: '#797979', // Meta text, placeholders, timestamps

  // Surfaces
  background: '#F6F6F6',   // Screen background
  white: '#FFFFFF',         // Cards, sheets, modals
  borderLight: '#E0E0E0',  // Input borders, dividers

  // Semantic
  success: '#2E9E5B',      // Completed status
  danger: '#E14B4B',       // Cancel / remove / error
  star: '#F8B057',         // Rating stars (same as accent)

  // Transparent helpers
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export type ColorKey = keyof typeof colors;
