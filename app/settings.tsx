import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SettingsScreen } from '../src/screens/SettingsScreen';

export default function SettingsRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const navigationShim: any = {
    navigate: (screenName: string, p?: any) => {
      const name = String(screenName).toLowerCase();
      (router as any).push({ pathname: '/' + name, params: p });
    },
    replace: (screenName: string, p?: any) => {
      const name = String(screenName).toLowerCase();
      (router as any).replace({ pathname: '/' + name, params: p });
    },
    goBack: () => router.back?.(),
    reset: (state?: any) => {
      const first = state?.routes?.[0]?.name;
      if (first) (router as any).replace({ pathname: '/' + String(first).toLowerCase() });
      else (router as any).replace('/');
    },
    popToTop: () => (router as any).replace('/dashboard'),
  };

  return <SettingsScreen {...({ navigation: navigationShim, route: { params: params } } as any)} />;
}
