import React from 'react';
import { useRouter } from 'expo-router';
import { BreatheScreen } from '../src/screens/BreatheScreen';

export default function BreatheRoute() {
  const router = useRouter();

  const navigationShim: any = {
    navigate: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      (router as any).push({ pathname: '/' + name, params });
    },
    replace: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      (router as any).replace({ pathname: '/' + name, params });
    },
    popToTop: () => (router as any).replace('/dashboard'),
    goBack: () => router.back?.(),
  };

  return <BreatheScreen {...({ navigation: navigationShim, route: { params: {} } } as any)} />;
}
