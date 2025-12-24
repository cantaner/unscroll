import { StyleSheet, TextStyle } from 'react-native';

export const COLORS = {
  background: '#0F172A', // Deep Slate - Main background
  surface: '#1E293B',    // Slate 800 - Cards
  surfaceHighlight: '#334155', // Slate 700 - Clickable areas
  primary: '#2DD4BF',    // Teal 400 - Action/Focus
  primaryDim: 'rgba(45, 212, 191, 0.15)',
  accent: '#F472B6',     // Pink 400 - Warmth/Love
  accentDim: 'rgba(244, 114, 182, 0.15)',
  textPrimary: '#F8FAFC', // Slate 50
  textSecondary: '#94A3B8', // Slate 400
  textTertiary: '#64748B',  // Slate 500
  border: '#334155',
  success: '#34D399',
  error: '#F87171',
  warning: '#FBBF24',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Simple object for now, expanding later
export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.s,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.25,
    marginBottom: SPACING.xs,
  } as TextStyle,
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.m,
  } as TextStyle,
  body: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  } as TextStyle,
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  } as TextStyle,
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
  } as TextStyle,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const GLOBAL_STYLES = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
  },
});