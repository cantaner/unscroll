# Setup Instructions for Google Authentication

## Important: Package Installation Required

Before the Google authentication will work, you need to install the required package:

```bash
npm install expo-auth-session
```

Or if using yarn:
```bash
yarn add expo-auth-session
```

## Google OAuth Setup

To enable Google Sign-In, you need to obtain OAuth credentials from Google Cloud Console:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"

### 2. Create OAuth 2.0 Credentials

#### For Web (Expo Go / Development)
1. Click "Create Credentials" > "OAuth 2.0 Client ID"
2. Select "Web application"
3. Add authorized redirect URI:
   ```
   https://auth.expo.io/@your-expo-username/unscroll
   ```
4. Copy the Client ID

#### For iOS
1. Create another OAuth Client ID
2. Select "iOS"
3. Enter your bundle identifier (e.g., `com.yourname.unscroll`)
4. Copy the  Client ID

#### For Android
1. Create another OAuth Client ID
2. Select "Android"
3. Enter your package name
4. Get your SHA-1 certificate fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
   ```
5. Copy the Client ID

### 3. Update `src/auth.ts`

Replace the placeholder client IDs in `src/auth.ts`:

```typescript
const GOOGLE_CLIENT_ID_IOS = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_ANDROID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_ID_WEB = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';
```

### 4. Update `app.json`

Add your bundle identifiers to `app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourname.unscroll"
    },
    "android": {
      "package": "com.yourname.unscroll"
    }
  }
}
```

### 5. Test the Implementation

1. Run your app: `npx expo start`
2. Navigate to Sign Up screen
3. Click "Continue with Google"
4. Complete the OAuth flow
5. Verify you're redirected back to the dashboard

## Troubleshooting

- **"Invalid client" error**: Double-check your client IDs match exactly
- **Redirect not working**: Ensure redirect URIs are configured correctly in Google Cloud Console
- **expo-auth-session not found**: Make sure you ran `npm install expo-auth-session`

## Features Implemented

✅ Google Sign-In on signup screen
✅ Google account management in settings
✅ User data stored securely in AsyncStorage
✅ Sign-out functionality
✅ Ready for cloud backup/sync (requires backend setup)
