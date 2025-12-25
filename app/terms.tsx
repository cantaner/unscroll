import { useRouter } from 'expo-router';
import React from 'react';
import { TermsScreen } from '../src/screens/TermsScreen';

export default function TermsRoute() {
  const router = useRouter();
  const navigationShim: any = {
    goBack: () => router.back(),
  };
  return <TermsScreen navigation={navigationShim} />;
}
