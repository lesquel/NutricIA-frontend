/**
 * NutricIA Design Tokens
 * Sage Green / Terracotta / Warm Cream palette from design.html
 */

export const Colors = {
  light: {
    primary: '#5D7A68',
    primaryDark: '#4a6253',
    accent: '#C67B66',
    background: '#FDFBF7',
    surface: '#F2EFE9',
    text: '#2C3632',
    textMuted: '#8A948F',
    border: '#E6E2D8',
    white: '#FFFFFF',
    navBg: '#f8fcf9',
    navBorder: '#e7f3ec',
    success: '#8DA399',
    error: '#D96B5C',
    warning: '#E8A75A',
    info: '#5B8FA8',
    calorieOrange: '#E8875A',
    proteinBlue: '#5B8FA8',
    carbsAmber: '#D4A853',
    fatPurple: '#9B7DB8',
    waterBlue: '#4AADE8',
    waterEmpty: '#C8D6D0',
    tabIconDefault: '#8A948F',
    tabIconSelected: '#5D7A68',
    tint: '#5D7A68',
    icon: '#8A948F',
  },
  dark: {
    primary: '#7A9B8A',
    primaryDark: '#5D7A68',
    accent: '#D4917E',
    background: '#102217',
    surface: '#1A3328',
    text: '#ECEAE5',
    textMuted: '#8A948F',
    border: '#2A4A38',
    white: '#FFFFFF',
    navBg: '#102217',
    navBorder: '#1A3328',
    success: '#8DA399',
    error: '#D96B5C',
    warning: '#E8A75A',
    info: '#5B8FA8',
    calorieOrange: '#E8875A',
    proteinBlue: '#5B8FA8',
    carbsAmber: '#D4A853',
    fatPurple: '#9B7DB8',
    waterBlue: '#4AADE8',
    waterEmpty: '#2A4A38',
    tabIconDefault: '#8A948F',
    tabIconSelected: '#7A9B8A',
    tint: '#7A9B8A',
    icon: '#8A948F',
  },
} as const;

export type ThemeColors = { readonly [K in keyof typeof Colors.light]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
} as const;

export const Shadows = {
  soft: {
    shadowColor: '#5D7A68',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  glow: {
    shadowColor: '#C67B66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;
