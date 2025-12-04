import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { storage } from './storage';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth credentials from Google Cloud Console
const GOOGLE_CLIENT_ID_IOS = '65897382054-c1l51j39ebg4tdsms97gp1r0j8ep8kqc.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = '65897382054-c1l51j39ebg4tdsms97gp1r0j8ep8kqc.apps.googleusercontent.com'; // Using iOS as fallback for Android
const GOOGLE_CLIENT_ID_WEB = '65897382054-01i267f378g0iqhpl0g2gmve0jt2r3l6.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

// Get the appropriate client ID based on platform
export const getClientId = () => {
  const { Platform } = require('react-native');
  if (Platform.OS === 'ios') return GOOGLE_CLIENT_ID_IOS;
  if (Platform.OS === 'android') return GOOGLE_CLIENT_ID_ANDROID;
  return GOOGLE_CLIENT_ID_WEB;
};

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// OAuth configuration to be used with useAuthRequest hook
export const googleAuthConfig = {
  clientId: getClientId(),
  scopes: ['openid', 'profile', 'email'],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'unscroll',
    path: 'redirect',
  }),
};

export { discovery };

// Export useAuthRequest from expo-auth-session for component use
    export { useAuthRequest } from 'expo-auth-session';

export const signInWithGoogle = async (response: AuthSession.AuthSessionResult) => {
  if (response?.type === 'success') {
    const { authentication } = response as AuthSession.AuthSessionResult & {
      authentication: AuthSession.TokenResponse;
    };

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${authentication?.accessToken}` },
      }
    );

    const userInfo = await userInfoResponse.json();
    const googleUser: GoogleUser = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    };

    // Store user info
    await storage.setGoogleUser?.(googleUser);
    await storage.setGoogleToken?.(authentication?.accessToken || '');

    return googleUser;
  }
  return null;
};

export const signOutGoogle = async () => {
  await storage.setGoogleUser?.(null);
  await storage.setGoogleToken?.(null);
};

export const getGoogleUser = async (): Promise<GoogleUser | null> => {
  return await storage.getGoogleUser?.();
};

export const isSignedInWithGoogle = async (): Promise<boolean> => {
  const user = await getGoogleUser();
  return user !== null;
};
