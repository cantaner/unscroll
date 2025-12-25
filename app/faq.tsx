import { useRouter } from 'expo-router';
import React from 'react';
import { FaqScreen } from '../src/screens/FaqScreen';

export default function FaqRoute() {
  const router = useRouter();
  const navigationShim: any = {
    goBack: () => router.back(),
  };
  return <FaqScreen navigation={navigationShim} />;
}
