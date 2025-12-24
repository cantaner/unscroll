import React from 'react';
import { ScrollView, Text, View } from 'react-native';
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
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const SettingsScreen = ({ navigation }: any) => {
  const handlePress = (action: string) => {
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

        {/* App Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
            <CardDescription>Version and build details</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.s, marginBottom: SPACING.s }}>
              <Text style={[TYPOGRAPHY.body, { flex: 1 }]}>Version</Text>
              <Badge variant="default">1.0.0</Badge>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.s }}>
              <Text style={[TYPOGRAPHY.body, { flex: 1 }]}>Build</Text>
              <Badge variant="secondary">Positive Focus</Badge>
            </View>
          </CardContent>
        </Card>

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
                  Receive reminders and updates
                </Text>
              </View>
              
              <Separator />
              
              <View>
                <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.xs, fontWeight: '600' }]}>
                  Theme
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  Currently using dark mode
                </Text>
              </View>
              
              <Separator />
              
              <View>
                <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.xs, fontWeight: '600' }]}>
                  Data & Storage
                </Text>
                <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  Manage app data and cache
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* About Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Unscroll</CardTitle>
            <CardDescription>Learn more about our mission</CardDescription>
          </CardHeader>
          <CardContent>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m, lineHeight: 22 }]}>
              Unscroll helps you reclaim your attention and build healthier digital habits through mindful tracking and positive reinforcement.
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.s, flexWrap: 'wrap' }}>
              <Badge variant="outline">Mindfulness</Badge>
              <Badge variant="outline">Focus</Badge>
              <Badge variant="outline">Well-being</Badge>
            </View>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card style={{ marginBottom: 0 }}>
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
      </ScrollView>
    </ScreenContainer>
  );
};
