import React from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ScreenContainer,
    Separator
} from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const SettingsScreen = ({ navigation }: any) => {
  const handlePress = (action: string) => {
    if (action === 'Send Feedback') {
        Linking.openURL('mailto:info@rulesimple.com?subject=Unscroll Feedback');
        return;
    }
    if (action === 'Terms & Privacy') {
        Alert.alert(
            "Terms & Privacy",
            "Unscroll is dedicated to your privacy. We do not sell your data. Your tracked usage and sessions are stored locally on your device or in your private account if created.\n\nBy using this app, you agree to focus on what matters and use your time intentionally.\n\nFull terms available at rulesimple.com",
            [{ text: "Close" }]
        );
        return;
    }
    alert(`${action} coming soon.`);
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l }}>
          <Button 
            title="←" 
            variant="ghost" 
            onPress={() => navigation.goBack()} 
            style={{ width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0, marginBottom: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center' }} 
          />
          <Text style={[TYPOGRAPHY.h1]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xl }} showsVerticalScrollIndicator={false}>

        {/* Account Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onPress={() => handlePress('Edit Profile')}
              style={{ marginBottom: SPACING.s }}
            >
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              onPress={() => handlePress('Privacy Settings')}
            >
              Privacy Settings
            </Button>
          </CardContent>
        </Card>

        {/* Preferences Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={{ gap: SPACING.m }}>
              <View>
                <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.xs, fontWeight: '600' }]}>
                  Notifications
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  Receive smart reminders to stay on track (Configured in system settings)
                </Text>
              </View>
              
              <Separator />
              
              <View>
                <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.xs, fontWeight: '600' }]}>
                  Data & Storage
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.s }}>
                  Manage app data and cache. All data is encrypted locally.
                </Text>
                <Button 
                  title="Reset All Data" 
                  onPress={() => {
                    Alert.alert(
                      "Reset Data",
                      "Are you sure? This will delete all your sessions, stats, and settings. This cannot be undone.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Delete & Reset", 
                          style: "destructive",
                          onPress: async () => {
                            await storage.clearAll();
                            Alert.alert("Reset Complete", "Data cleared. Please restart the app.");
                          }
                        }
                      ]
                    );
                  }}
                  style={{ backgroundColor: '#EF4444' }}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Unscroll</CardTitle>
            <CardDescription>Our mission</CardDescription>
          </CardHeader>
          <CardContent>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m, lineHeight: 22 }]}>
              Unscroll is a tool to help you reclaim your attention and build healthier digital habits.
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.s, flexWrap: 'wrap' }}>
              <Badge variant="outline">Focus</Badge>
              <Badge variant="outline">Intentionality</Badge>
            </View>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help and provide feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="ghost" 
              onPress={() => handlePress('Help Center')}
              style={{ marginBottom: SPACING.xs }}
            >
              Help Center
            </Button>
            <Button 
              variant="ghost" 
              onPress={() => handlePress('Send Feedback')}
              style={{ marginBottom: SPACING.xs }}
            >
              Send Feedback
            </Button>
            <Button 
              variant="ghost" 
              onPress={() => handlePress('Terms & Privacy')}
            >
              Terms & Privacy
            </Button>
          </CardContent>
        </Card>

        {/* App Info Card at bottom */}
        <View style={{ marginTop: SPACING.l, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Unscroll v1.0.0 (Build 1)</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 11, marginTop: 4 }}>© 2025 RuleSimple</Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};
