
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Animated, ImageStyle } from 'react-native';
import { COLORS, SPACING, GLOBAL_STYLES, SHADOWS } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- App Logo ---
export const AppLogo: React.FC<{ size?: number, color?: string }> = ({ size = 40, color = COLORS.primary }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
     {/* Simple geometric logo: A circle with a "pause" gap */}
     <View style={{ 
       width: size, 
       height: size, 
       borderRadius: size / 2, 
       borderWidth: size / 6, 
       borderColor: color,
       opacity: 0.9 
     }} />
     <View style={{
         position: 'absolute',
         width: size / 3,
         height: size + 10,
         backgroundColor: COLORS.background, // mask to create the 'U' shape
         top: -5,
     }}/>
  </View>
);

// --- Fade In Wrapper ---
export const FadeInView: React.FC<{ children: React.ReactNode, delay?: number, style?: ViewStyle }> = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// --- Screen Container ---
export const ScreenContainer: React.FC<{ children: React.ReactNode, style?: ViewStyle }> = ({ children, style }) => (
  <SafeAreaView style={[GLOBAL_STYLES.screenContainer, style]}>
    {children}
  </SafeAreaView>
);

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, style?: ViewStyle }> = ({ children, style }) => (
  <View style={[GLOBAL_STYLES.card, style]}>
    {children}
  </View>
);

// --- Button ---
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', disabled, style, icon }) => {
  const getBgColor = () => {
    if (disabled) return '#D6D3D1';
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.surface;
      default: return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return '#A8A29E';
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: getBgColor(),
          paddingVertical: 18,
          paddingHorizontal: SPACING.l,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginBottom: SPACING.m,
          flexDirection: 'row',
          ...(variant === 'secondary' ? { borderWidth: 1, borderColor: COLORS.border } : {}),
          ...(variant === 'primary' ? SHADOWS.button : {})
        },
        style
      ]}
    >
      {icon && <Text style={{ marginRight: 8, fontSize: 18 }}>{icon}</Text>}
      <Text style={{ color: getTextColor(), fontSize: 16, fontWeight: '600', letterSpacing: 0.5 }}>{title}</Text>
    </TouchableOpacity>
  );
};

// --- Selection Item ---
interface SelectionItemProps {
  label: string;
  subLabel?: string;
  selected: boolean;
  onPress: () => void;
  image?: string; // URL for stock image
}

export const SelectionItem: React.FC<SelectionItemProps> = ({ label, subLabel, selected, onPress, image }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    style={{
      backgroundColor: selected ? COLORS.primary : COLORS.surface,
      padding: SPACING.m,
      borderRadius: 16,
      marginBottom: SPACING.s,
      borderWidth: 1,
      borderColor: selected ? COLORS.primary : COLORS.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 60,
      overflow: 'hidden',
      position: 'relative'
    }}
  >
    <View style={{ zIndex: 2, flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: selected ? '#FFF' : COLORS.textPrimary }}>{label}</Text>
        {subLabel && <Text style={{ fontSize: 13, marginTop: 2, color: selected ? '#D6D3D1' : COLORS.textSecondary }}>{subLabel}</Text>}
    </View>
    {selected && <View style={{ backgroundColor: '#FFF', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: 'bold' }}>✓</Text></View>}
    
    {image && (
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, opacity: selected ? 0.2 : 0.1, backgroundColor: '#000' }}>
            {/* React Native Image would go here, simulated with view for pure TS */}
        </View>
    )}
  </TouchableOpacity>
);
