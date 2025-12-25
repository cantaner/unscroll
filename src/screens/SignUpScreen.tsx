import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppLogo, Button, FadeInView, ScreenContainer } from '../components/UiComponents';
import { supabase } from '../lib/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [view, setView] = useState<'initial' | 'form'>('initial');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOAuthSession, setIsOAuthSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOAuthSession(!!session);
    });
  }, []);

  // Handle OAuth Redirects
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
    };

    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.first_name) {
          navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
        } else {
          // New user (likely OAuth), show the form for onboarding
          setView('form');
          setEmail(session.user.email || '');
        }
      }
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Let makeRedirectUri handle the environment dynamically
      const redirectTo = makeRedirectUri({
        scheme: 'unscroll',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        
        if (result.type === 'success') {
            const { url } = result;
            const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
                await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
            }
        }
      }
    } catch (e: any) {
      Alert.alert('Google Sign In Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') {
        Alert.alert('Not Supported', 'Apple Sign In is only available on iOS devices.');
        return;
    }

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) throw error;

        // If user is new, update profile
        if (data.user && credential.fullName) {
             await supabase
                .from('profiles')
                .upsert([
                    {
                        id: data.user.id,
                        first_name: credential.fullName.givenName || '',
                        last_name: credential.fullName.familyName || '',
                        email: data.user.email,
                    }
                ], { onConflict: 'id' });
        }
      }
    } catch (e: any) {
      if (e.code !== 'ERR_CANCELED') {
        Alert.alert('Apple Sign In Error', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!firstName || !lastName || !dob || !email || !password) {
      Alert.alert('Missing Fields', 'All fields are mandatory. Please fill in everything.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    const session = (await supabase.auth.getSession()).data.session;
    const isOAuth = !!session;

    if (!isOAuth && password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      let userId = session?.user?.id;
      let dbDob = dob;
      if (dob) {
          const parts = dob.split('-');
          if (parts.length === 3) dbDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      if (!isOAuth) {
        // 1. Sign up user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        userId = data.user?.id;
      }

      if (userId) {
        // 2. Create or Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: userId,
              first_name: firstName,
              last_name: lastName,
              dob: dbDob,
              email: email,
            }
          ], { onConflict: 'id' });

        if (profileError) throw profileError;

        // 3. Initialize level stats if missing
        const { data: stats } = await supabase.from('user_stats').select('id').eq('user_id', userId).single();
        if (!stats) {
            await supabase
              .from('user_stats')
              .insert([{ user_id: userId, xp: 0, level: 1 }]);
        }

        Alert.alert(
            isOAuth ? 'Profile Updated' : 'Account Created', 
            isOAuth ? 'Your profile is ready!' : 'Your account has been successfully created!'
        );
        navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInitialView = () => (
    <FadeInView>
      <View style={{ gap: SPACING.m, marginTop: SPACING.xl }}>
        <Button 
            title="Create Account" 
            onPress={() => setView('form')} 
            style={{ marginBottom: SPACING.s }}
        />

        {Platform.OS === 'ios' && (
          <Button 
              variant="outline"
              onPress={handleAppleSignIn}
              style={{
                  backgroundColor: COLORS.textPrimary,
                  borderColor: COLORS.textPrimary,
                  marginBottom: SPACING.s
              }}
          >
              <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.surface }}>Continue with Apple</Text>
          </Button>
        )}

        <Button 
            variant="outline"
            onPress={handleGoogleSignIn}
            style={{
                backgroundColor: 'transparent',
                borderColor: COLORS.primary,
                marginBottom: SPACING.l
            }}
        >
            <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.primary }}>Continue with Google</Text>
        </Button>

        <TouchableOpacity 
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] })} 
            style={{ marginBottom: SPACING.l }}
        >
            <Text style={{ textAlign: 'center', color: COLORS.textSecondary, textDecorationLine: 'underline', fontSize: 14 }}>
                Maybe later
            </Text>
        </TouchableOpacity>
      </View>
    </FadeInView>
  );

  const renderFormView = () => (
    <FadeInView>
      <View style={{ gap: SPACING.m, marginBottom: SPACING.xl }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                  <Text style={TYPOGRAPHY.label}>First Name</Text>
                  <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Jane"
                      placeholderTextColor={COLORS.textTertiary}
                      style={{ 
                          backgroundColor: COLORS.surfaceHighlight, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
                      }}
                  />
              </View>
              <View style={{ flex: 1 }}>
                  <Text style={TYPOGRAPHY.label}>Last Name</Text>
                  <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Doe"
                      placeholderTextColor={COLORS.textTertiary}
                      style={{ 
                          backgroundColor: COLORS.surfaceHighlight, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
                      }}
                  />
              </View>
          </View>

          <View>
              <Text style={TYPOGRAPHY.label}>Date of Birth</Text>
              <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD-MM-YYYY"
                  placeholderTextColor={COLORS.textTertiary}
                  style={{ 
                      backgroundColor: COLORS.surfaceHighlight, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
                  }}
              />
          </View>

          <View>
              <Text style={TYPOGRAPHY.label}>Email</Text>
              <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textTertiary}
                  style={{ 
                      backgroundColor: COLORS.surfaceHighlight, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
              />
          </View>

          {!isOAuthSession && (
            <View>
                <Text style={TYPOGRAPHY.label}>Password</Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min 8 characters"
                    placeholderTextColor={COLORS.textTertiary}
                    secureTextEntry
                    style={{ 
                        backgroundColor: COLORS.surfaceHighlight, padding: 16, borderRadius: 12, fontSize: 16, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border
                    }}
                />
            </View>
          )}
      </View>

      <Button 
          title={loading ? "Creating Account..." : "Confirm Account"} 
          onPress={handleSignUp} 
          disabled={loading}
          style={{ marginBottom: SPACING.m }}
      />
      
      <TouchableOpacity 
          onPress={() => setView('initial')} 
          style={{ marginBottom: SPACING.l }}
      >
          <Text style={{ textAlign: 'center', color: COLORS.textSecondary, textDecorationLine: 'underline', fontSize: 14 }}>
              Go Back
          </Text>
      </TouchableOpacity>
    </FadeInView>
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl, marginTop: SPACING.l }}>
            <AppLogo size={80} />
        </View>
        <Text style={[TYPOGRAPHY.h1, { textAlign: 'center' }]}>Create Account</Text>
        <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', paddingHorizontal: 20, marginBottom: SPACING.xl }]}>
            Save your progress and access your plan from any device.
        </Text>

        {loading && view === 'initial' ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
        ) : (
            view === 'initial' ? renderInitialView() : renderFormView()
        )}
      </ScrollView>
    </ScreenContainer>
  );
};
