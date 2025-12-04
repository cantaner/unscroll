
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { discovery, googleAuthConfig, signInWithGoogle, useAuthRequest } from '../auth';
import { AppLogo, Button, Card, FadeInView, ScreenContainer } from '../components/UiComponents';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [request, response, promptAsync] = useAuthRequest(googleAuthConfig, discovery);

  useEffect(() => {
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  useEffect(() => {
    if (response) {
      handleGoogleResponse();
    }
  }, [response]);

  const handleGoogleResponse = async () => {
    const user = await signInWithGoogle(response);
    if (user) {
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    }
  };

  const handleSignUp = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center' }}>
      <FadeInView>
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
            <AppLogo size={60} />
        </View>
        <Text style={[TYPOGRAPHY.h1, { textAlign: 'center' }]}>Save your progress</Text>
        <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', paddingHorizontal: 20 }]}>
            Create an account to keep your habits and insights safe across devices.
        </Text>

        <Card>
            <Text style={TYPOGRAPHY.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textTertiary}
                style={{ 
                    backgroundColor: '#F5F5F4', padding: 16, borderRadius: 12, marginBottom: SPACING.m, fontSize: 16 
                }}
                autoCapitalize="none"
            />

            <Text style={TYPOGRAPHY.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry
                style={{ 
                    backgroundColor: '#F5F5F4', padding: 16, borderRadius: 12, marginBottom: SPACING.s, fontSize: 16 
                }}
            />
        </Card>

        <Button title="Create Account" onPress={handleSignUp} />

        <TouchableOpacity 
            onPress={handleGoogleSignIn}
            disabled={!request}
            style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1, borderColor: COLORS.border,
                paddingVertical: 18, borderRadius: 20,
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                marginBottom: SPACING.m,
                opacity: !request ? 0.5 : 1
            }}
        >
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignUp} style={{ marginTop: SPACING.s }}>
            <Text style={{ textAlign: 'center', color: COLORS.textTertiary, textDecorationLine: 'underline' }}>
                Maybe later
            </Text>
        </TouchableOpacity>
      </FadeInView>
    </ScreenContainer>
  );
};
