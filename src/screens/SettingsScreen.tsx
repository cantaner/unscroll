import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import type { GoogleUser } from '../auth';
import { discovery, getGoogleUser, googleAuthConfig, signInWithGoogle, signOutGoogle, useAuthRequest } from '../auth';
import { Button, Card, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [request, response, promptAsync] = useAuthRequest(googleAuthConfig, discovery);

  useEffect(() => {
    loadGoogleUser();
  }, []);

  useEffect(() => {
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  const loadGoogleUser = async () => {
    const user = await getGoogleUser();
    setGoogleUser(user);
  };

  const handleGoogleResponse = async () => {
    const user = await signInWithGoogle(response);
    if (user) {
      setGoogleUser(user);
      Alert.alert('Success', `Signed in as ${user.email}`);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setGoogleUser(null);
    Alert.alert('Signed Out', 'You have been signed out from Google');
  };

  const handleReset = () => {
    Alert.alert(
      "Reset App?",
      "This will delete all your data and plans.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: async () => {
            await storage.clearAll();
            setGoogleUser(null);
            navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <Text style={TYPOGRAPHY.h1}>Settings</Text>
      
      <Card>
        <Text style={[TYPOGRAPHY.label, { marginBottom: 8 }]}>GOOGLE ACCOUNT</Text>
        {googleUser ? (
          <View>
            <Text style={[TYPOGRAPHY.body, { marginBottom: 4 }]}>Signed in as:</Text>
            <Text style={[TYPOGRAPHY.h2, { marginBottom: 4 }]}>{googleUser.name}</Text>
            <Text style={[TYPOGRAPHY.subtitle, { marginBottom: SPACING.m }]}>{googleUser.email}</Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textTertiary, marginBottom: SPACING.m, fontSize: 12 }]}>
              Your data is automatically backed up to your Google account.
            </Text>
            <Button title="Sign Out" variant="secondary" onPress={handleSignOut} />
          </View>
        ) : (
          <View>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m }]}>
              Sign in with Google to backup and sync your data across devices.
            </Text>
            <Button 
              title="Sign in with Google" 
              onPress={() => promptAsync()} 
              disabled={!request}
            />
          </View>
        )}
      </Card>

      <Card>
        <Text style={TYPOGRAPHY.body}>Unscroll Version 1.0</Text>
        <Text style={TYPOGRAPHY.subtitle}>Built with ❤️ by Rainmaker</Text>
      </Card>
      
      <Button title="Reset All Data" variant="secondary" onPress={handleReset} />
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
};
