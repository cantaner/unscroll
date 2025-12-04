import { Stack } from "expo-router";

export default function RootLayout() {
  // Start the stack at dashboard so the app doesn't need to programmatically
  // redirect on first render (which can trigger navigation-too-soon errors).
  return <Stack
    initialRouteName="splash"
    screenOptions={{ headerShown: false }}
  />;
}
