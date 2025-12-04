import React from 'react';
import { useRouter } from 'expo-router';
import { AudioScreen } from '../src/screens/AudioScreen';

export default function AudioRoute() {
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
    goBack: () => router.back?.(),
    popToTop: () => (router as any).replace('/dashboard'),
  };

  return <AudioScreen {...({ navigation: navigationShim, route: { params: {} } } as any)} />;
}
