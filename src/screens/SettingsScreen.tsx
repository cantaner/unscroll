import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ScreenContainer
} from '../components/UiComponents';
import { supabase } from '../lib/supabase';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const SettingsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: user.email || '',
            dob: data.dob || '',
          });
        }
      }
    } catch (e: any) {
      console.error('Error fetching profile:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update email via auth if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: profile.email });
        if (emailError) throw emailError;
        Alert.alert("Email Update", "Please check your new email for a confirmation link.");
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          dob: profile.dob,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            await storage.clearAll();
            navigation.replace('SignUp');
          }
        }
      ]
    );
  };

  const handleResetData = async () => {
    Alert.alert(
      "Reset All Data",
      "This will delete ALL your local sessions, stats, and cloud session sync. Your account itself remains. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete & Reset", 
          style: "destructive",
          onPress: async () => {
            await storage.clearAll();
            Alert.alert("Reset Complete", "Local data cleared.");
            fetchProfile(); // Refresh UI
          }
        }
      ]
    );
  };

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

  if (loading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  const renderProfileField = (label: string, value: string, placeholder: string, key: keyof typeof profile) => {
    if (isEditing) {
        return (
            <View style={{ marginBottom: SPACING.m }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</Text>
                <TextInput
                    style={{ backgroundColor: COLORS.surfaceHighlight, color: COLORS.textPrimary, padding: 12, borderRadius: 8 }}
                    value={value}
                    onChangeText={(text) => setProfile({ ...profile, [key]: text })}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize={key === 'email' ? 'none' : 'words'}
                />
            </View>
        );
    }

    return (
        <View style={{ marginBottom: SPACING.m }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</Text>
            <Text style={[TYPOGRAPHY.body, { fontWeight: value ? '700' : '400', color: value ? COLORS.textPrimary : COLORS.primary }]}>
                {value || `+ Add ${label.toLowerCase()}`}
            </Text>
        </View>
    );
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

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <Card>
          <CardHeader style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Personal information</CardDescription>
            </View>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                    {isEditing ? 'Cancel' : 'Edit'}
                </Text>
            </TouchableOpacity>
          </CardHeader>
          <CardContent>
            {renderProfileField('FIRST NAME', profile.firstName, 'Enter first name', 'firstName')}
            {renderProfileField('LAST NAME', profile.lastName, 'Enter last name', 'lastName')}
            {renderProfileField('EMAIL', profile.email, 'Enter email', 'email')}
            {renderProfileField('DATE OF BIRTH', profile.dob, 'YYYY-MM-DD', 'dob')}

            {isEditing && (
                <Button 
                    title={saving ? "Saving..." : "Save Changes"}
                    onPress={handleSaveProfile}
                    disabled={saving}
                    style={{ marginTop: SPACING.s }}
                />
            )}
          </CardContent>
        </Card>

        {/* Privacy & Account */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Account</CardTitle>
            <CardDescription>Manage your data and session</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: SPACING.s }}>
            <Button 
              variant="outline" 
              onPress={handleSignOut}
              style={{ borderColor: COLORS.primary }}
            >
              Sign Out
            </Button>
            <Button 
                variant="ghost"
                onPress={handleResetData}
            >
                <Text style={{ color: '#F87171', fontWeight: '700' }}>Reset All Local Data</Text>
            </Button>
          </CardContent>
        </Card>

        {/* Support & About */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help and provide feedback</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: SPACING.xs }}>
            <Button variant="ghost" onPress={() => handlePress('Help Center')}>Help Center</Button>
            <Button variant="ghost" onPress={() => handlePress('Send Feedback')}>Send Feedback</Button>
            <Button variant="ghost" onPress={() => handlePress('Terms & Privacy')}>Terms & Privacy</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Unscroll</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m, opacity: 0.8 }]}>
              Built to help you reclaim your attention and build healthier digital habits.
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.s }}>
              <Badge variant="outline">Zen</Badge>
              <Badge variant="outline">Focus</Badge>
              <Badge variant="outline">V1.0</Badge>
            </View>
          </CardContent>
        </Card>

        <View style={{ marginTop: SPACING.xl, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Unscroll v1.0.0 (Build 1)</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 11, marginTop: 4 }}>© 2025 RuleSimple</Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};
