import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, GLOBAL_STYLES, SPACING } from '../theme';

// --- App Logo ---
export const AppLogo: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
     {/* Simple, clean Zen Circle */}
     <View style={{ 
       width: size, 
       height: size, 
       borderRadius: size / 2, 
       borderWidth: 3, 
       borderColor: COLORS.primary,
       opacity: 1
     }} />
     <View style={{
         position: 'absolute',
         width: size * 0.4,
         height: size * 0.4,
         borderRadius: size * 0.2,
         backgroundColor: COLORS.accent,
         opacity: 0.8
     }}/>
  </View>
);

// --- Fade In Wrapper ---
export const FadeInView: React.FC<{ children: React.ReactNode, delay?: number, style?: StyleProp<ViewStyle> }> = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, delay, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// --- Screen Container ---
export const ScreenContainer: React.FC<{ children: React.ReactNode, style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <SafeAreaView style={[GLOBAL_STYLES.screenContainer, style]}>
    {children}
  </SafeAreaView>
);

// --- Enhanced Card Components (shadcn/ui inspired) ---
export const Card: React.FC<{ children: React.ReactNode, style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[
    {
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: SPACING.m,
      marginBottom: SPACING.m,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }, 
    style
  ]}>
    {children}
  </View>
);

export const CardHeader: React.FC<{ children: React.ReactNode, style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[{ marginBottom: SPACING.s }, style]}>
    {children}
  </View>
);

export const CardTitle: React.FC<{ children: React.ReactNode, style?: StyleProp<TextStyle> }> = ({ children, style }) => (
  <Text style={[{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }, style]}>
    {children}
  </Text>
);

export const CardDescription: React.FC<{ children: React.ReactNode, style?: StyleProp<TextStyle> }> = ({ children, style }) => (
  <Text style={[{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 }, style]}>
    {children}
  </Text>
);

export const CardContent: React.FC<{ children: React.ReactNode, style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[{ paddingVertical: SPACING.xs }, style]}>
    {children}
  </View>
);

export const CardFooter: React.FC<{ children: React.ReactNode, style?: StyleProp<ViewStyle> }> = ({ children, style }) => (
  <View style={[{ marginTop: SPACING.s, flexDirection: 'row', gap: SPACING.s }, style]}>
    {children}
  </View>
);

// --- Enhanced Button Component (shadcn/ui inspired with variants) ---
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'default', 
  size = 'default',
  disabled, 
  style, 
  icon,
  children 
}) => {
  const [pressed, setPressed] = React.useState(false);

  const getVariantStyles = (): { bg: string, text: string, border?: string } => {
    if (disabled) {
      return { bg: COLORS.surfaceHighlight, text: COLORS.textTertiary };
    }
    
    switch (variant) {
      case 'default':
        return { bg: COLORS.primary, text: COLORS.background };
      case 'destructive':
        return { bg: COLORS.error, text: '#FFFFFF' };
      case 'outline':
        return { bg: 'transparent', text: COLORS.textPrimary, border: COLORS.border };
      case 'secondary':
        return { bg: COLORS.surfaceHighlight, text: COLORS.textPrimary };
      case 'ghost':
        return { bg: 'transparent', text: COLORS.textSecondary };
      case 'link':
        return { bg: 'transparent', text: COLORS.primary };
      default:
        return { bg: COLORS.primary, text: COLORS.background };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 24, fontSize: 18 };
      case 'icon':
        return { paddingVertical: 12, paddingHorizontal: 12, fontSize: 16 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 20, fontSize: 16 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={[
        {
          backgroundColor: variantStyles.bg,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          width: size === 'icon' ? 'auto' : '100%',
          marginBottom: SPACING.m,
          flexDirection: 'row',
          gap: 8,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...(variantStyles.border && { 
            borderWidth: 1, 
            borderColor: variantStyles.border 
          }),
          ...(variant === 'ghost' && pressed && {
            backgroundColor: COLORS.surfaceHighlight
          })
        },
        style
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
    >
      {icon && <Text style={{ fontSize: sizeStyles.fontSize + 2, color: variantStyles.text }}>{icon}</Text>}
      {(title || children) && (
        <Text style={{ 
          color: variantStyles.text, 
          fontSize: sizeStyles.fontSize, 
          fontWeight: variant === 'link' ? '500' : '700',
          letterSpacing: 0.3,
          ...(variant === 'link' && { textDecorationLine: 'underline' })
        }}>
          {children || title}
        </Text>
      )}
    </Pressable>
  );
};

// --- Badge Component (new, shadcn/ui inspired) ---
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', style }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return { bg: COLORS.primary, text: COLORS.background };
      case 'secondary':
        return { bg: COLORS.surfaceHighlight, text: COLORS.textSecondary };
      case 'destructive':
        return { bg: COLORS.error, text: '#FFFFFF' };
      case 'outline':
        return { bg: 'transparent', text: COLORS.textPrimary, border: COLORS.border };
      case 'success':
        return { bg: COLORS.success, text: COLORS.background };
      default:
        return { bg: COLORS.primary, text: COLORS.background };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[
      {
        backgroundColor: variantStyles.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        ...(variantStyles.border && {
          borderWidth: 1,
          borderColor: variantStyles.border
        })
      },
      style
    ]}>
      <Text style={{
        color: variantStyles.text,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {children}
      </Text>
    </View>
  );
};

// --- Separator Component (new, shadcn/ui inspired) ---
interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
}

export const Separator: React.FC<SeparatorProps> = ({ orientation = 'horizontal', style }) => (
  <View style={[
    {
      backgroundColor: COLORS.border,
      ...(orientation === 'horizontal' 
        ? { height: 1, width: '100%', marginVertical: SPACING.m }
        : { width: 1, height: '100%', marginHorizontal: SPACING.m }
      )
    },
    style
  ]} />
);

// --- Enhanced Selection Item ---
interface SelectionItemProps {
  label: string;
  subLabel?: string;
  selected: boolean;
  onPress: () => void;
  image?: string;
}

export const SelectionItem: React.FC<SelectionItemProps> = ({ label, subLabel, selected, onPress, image }) => {
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        backgroundColor: selected ? COLORS.primaryDim : COLORS.surface,
        padding: SPACING.m,
        borderRadius: 12,
        marginBottom: SPACING.s,
        borderWidth: 1.5,
        borderColor: selected ? COLORS.primary : COLORS.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.m }}>
          {image && (
            <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: COLORS.surfaceHighlight, overflow: 'hidden' }}>
              {/* Using a simple colored square as placeholder since we don't want to break on image load failures */}
              <View style={{ flex: 1, backgroundColor: selected ? COLORS.primary : COLORS.textTertiary, opacity: 0.3 }} />
            </View>
          )}
          <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: selected ? COLORS.primary : COLORS.textPrimary }}>{label}</Text>
              {subLabel && <Text style={{ fontSize: 13, marginTop: 2, color: COLORS.textSecondary }}>{subLabel}</Text>}
          </View>
      </View>
      {selected && (
        <View style={{ 
          width: 24, height: 24, borderRadius: 12, 
          backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' 
        }}>
          <Text style={{ color: COLORS.background, fontSize: 12, fontWeight: 'bold' }}>✓</Text>
        </View>
      )}
    </Pressable>
  );
};
