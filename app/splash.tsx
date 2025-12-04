import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { AppLogo } from '../src/components/UiComponents';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/theme';
import { storage } from '../src/storage';

export default function SplashScreenRoute() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const go = async () => {
      // Small pause so the splash is visible and any fonts load.
      await new Promise(res => setTimeout(res, 800));
      const plan = await storage.getPlan?.();
      if (!mounted) return;
      if (plan) router.replace('/dashboard');
      else router.replace('/onboarding');
    };
    go();
    return () => { mounted = false; };
  }, [router]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#0F172A',
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.l,
    }}>
      <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#22d3ee33', top: 120, left: -40 }} />
      <View style={{ position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: '#a855f733', bottom: 80, right: -60 }} />

      <AppLogo size={96} color="#F8FAFC" />
      <Text style={[TYPOGRAPHY.h1, { color: '#F8FAFC', marginTop: SPACING.m }]}>Unscroll</Text>
      <Text style={{ color: '#cbd5f5', textAlign: 'center', marginTop: SPACING.s, lineHeight: 20 }}>
        Reclaim your attention with intentional sessions.
      </Text>
      <ActivityIndicator style={{ marginTop: SPACING.xl }} color="#22D3EE" />
    </View>
  );
}
