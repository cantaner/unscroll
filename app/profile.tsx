import { useRouter } from 'expo-router';
import React from 'react';
import { ProfileScreen } from '../src/screens/ProfileScreen';

export default function ProfileRoute() {
  const router = useRouter();

  const navigationShim: any = {
    navigate: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      if (name === 'settings') router.push('/settings');
      else if (name === 'pause') router.push('/pause');
      else if (name === 'dashboard') router.push('/dashboard');
      else (router as any).push('/' + name);
    },
    replace: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      (router as any).replace('/' + name);
    },
    goBack: () => router.back(),
  };

  return <ProfileScreen navigation={navigationShim} route={{ params: {} } as any} />;
}
