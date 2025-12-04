import { useRouter } from 'expo-router';
import React from 'react';
import { DashboardScreen } from '../src/screens/DashboardScreen';

// Small compatibility wrapper so the native-stack-style `navigation` calls
// inside the older `DashboardScreen` can map to expo-router at runtime.
export default function DashboardRoute() {
  const router = useRouter();

  // Minimal shim that maps the small subset of navigation methods used by
  // DashboardScreen (navigate, replace). For app-local development this is
  // sufficient; for production prefer rewriting screens to use expo-router.
  const navigationShim: any = {
    navigate: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      // Try to map known screen names -> app routes
      if (name === 'settings') router.push('/settings');
      else if (name === 'pause') router.push('/pause');
      else if (name === 'breathe') router.push('/breathe');
      else if (name === 'audio') router.push('/audio');
      else if (name === 'logsession') router.push('/logsession');
      else (router as any).push('/' + name);
    },
    replace: (screenName: string, params?: any) => {
      const name = String(screenName).toLowerCase();
      if (name === 'onboarding') router.replace('/onboarding');
      else (router as any).replace('/' + name);
    },
    // add a no-op goBack to avoid runtime errors
    goBack: () => router.back?.(),
    reset: (state?: any) => {
      const first = state?.routes?.[0]?.name;
      if (first) (router as any).replace({ pathname: '/' + String(first).toLowerCase() });
      else (router as any).replace('/');
    },
  };

  // DashboardScreen expects native-stack props; we pass a minimal `navigation`
  // implementation and an empty `route` so it can render properly inside
  // expo-router during development.
  return <DashboardScreen navigation={navigationShim} route={{ params: {} } as any} />;
}
