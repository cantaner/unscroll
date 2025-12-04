import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Use expo-router's Redirect so opening / immediately goes to /dashboard.
  // This avoids manual useEffect navigation and is the recommended pattern.
  return <Redirect href="/splash" />;
}
