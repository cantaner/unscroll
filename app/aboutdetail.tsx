import { useRouter } from 'expo-router';
import React from 'react';
import { AboutDetailScreen } from '../src/screens/AboutDetailScreen';

export default function AboutDetailRoute() {
  const router = useRouter();
  const navigationShim: any = {
    goBack: () => router.back(),
  };
  return <AboutDetailScreen navigation={navigationShim} />;
}
