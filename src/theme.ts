import { StyleSheet, TextStyle } from 'react-native';

export const COLORS = {
  background: '#F0F4F8',    // Soft blue-gray background
  surface: '#FFFFFF',       // Pure white for cards
  primary: '#0F172A',       // Deep slate for primary text/actions
  secondary: '#334155',     // Slate for secondary elements
  textPrimary: '#0F172A',   // Deep slate
  textSecondary: '#64748B', // Medium slate
  textTertiary: '#94A3B8',  // Light slate
  accent: '#F59E0B',        // Warm amber accent
  accentSecondary: '#8B5CF6', // Purple accent for variety
  success: '#10B981',       // Emerald success
  danger: '#EF4444',        // Red danger
  border: '#E2E8F0',        // Light slate border
  cyan: '#06B6D4',          // Vibrant cyan
  purple: '#A855F7',        // Rich purple
};

export const SPACING = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 };

export const SHADOWS = {
  soft: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  strong: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  }
  ,
  // button shadow is a slightly tighter shadow used for primary action buttons
  button: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  }
};

export const TYPOGRAPHY: { [k: string]: TextStyle } = {
  h1: { fontSize: 28, fontWeight: '700' as TextStyle['fontWeight'], color: COLORS.textPrimary },
  h2: { fontSize: 20, fontWeight: '700' as TextStyle['fontWeight'], color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textTertiary, fontWeight: '600' as TextStyle['fontWeight'] },
  body: { fontSize: 14, color: COLORS.textPrimary },
  label: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' as TextStyle['fontWeight'], letterSpacing: 0.4 },
  statValue: { fontSize: 48, fontWeight: '300' as TextStyle['fontWeight'], color: COLORS.primary }
};

export const GLOBAL_STYLES = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 28, // More rounded
    padding: SPACING.l,
    marginBottom: SPACING.m,
    ...SHADOWS.soft,
  },
});