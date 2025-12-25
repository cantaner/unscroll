import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  Avatar,
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
  const [editingField, setEditingField] = useState<keyof typeof profile | null>(null);
  const [editValue, setEditValue] = useState('');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    avatarUrl: '',
  });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const PREDEFINED_AVATARS = [
    '🌱', '🧘', '☀️', '🌊', '🏔️', '🦉', '✨', '🧠', '🌿', '💎'
  ];

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
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          const profileData = data[0];
          // Formatter for DOB: YYYY-MM-DD (DB) -> DD-MM-YYYY (UI)
          let displayDob = '';
          if (profileData.dob) {
              const parts = profileData.dob.split('-');
              if (parts.length === 3) displayDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }

          setProfile({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            email: user.email || '',
            dob: displayDob,
            avatarUrl: profileData.avatar_url || '',
          });
        }
      }
    } catch (e: any) {
      console.error('Error fetching profile:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!editingField) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedProfile = { ...profile, [editingField]: editValue };

      // Update email via auth if changed
      if (editingField === 'email' && editValue !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: editValue });
        if (emailError) throw emailError;
        Alert.alert("Email Update", "Please check your new email for a confirmation link.");
      }

      // Map local state keys to DB column names
      const dbMapping: Record<string, string> = {
        firstName: 'first_name',
        lastName: 'last_name',
        dob: 'dob',
        avatarUrl: 'avatar_url'
      };

      if (editingField !== 'email') {
        let dbValue = editValue;
        // Formatter for DOB: DD-MM-YYYY (UI) -> YYYY-MM-DD (DB)
        if (editingField === 'dob') {
            const parts = editValue.split('-');
            if (parts.length === 3) dbValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            [dbMapping[editingField]]: dbValue
          })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }
      
      setProfile(updatedProfile);
      setEditingField(null);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatar: string) => {
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase
              .from('profiles')
              .update({ avatar_url: avatar })
              .eq('id', user.id);

          if (error) throw error;
          setProfile(prev => ({ ...prev, avatarUrl: avatar }));
          setShowAvatarPicker(false);
      } catch (e: any) {
          Alert.alert("Error", e.message);
      }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleAvatarSelect(result.assets[0].uri);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
        "Delete Account",
        "This is permanent. All your focus history, level progress, and account details will be deleted forever. Continue?",
        [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete Forever",
                style: "destructive",
                onPress: async () => {
                    setLoading(true);
                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                            // 1. Delete user data via cascade or manual cleanup
                            // We'll rely on a future RPC or manual deletes. 
                            // For now, let's delete sessions and stats before signing out.
                            await supabase.from('sessions').delete().eq('user_id', user.id);
                            await supabase.from('user_stats').delete().eq('user_id', user.id);
                            await supabase.from('profiles').delete().eq('id', user.id);
                            
                            // Note: Fully deleting the user from auth.users requires admin/RPC 
                            // but signing out and clearing local is the best we can do from client
                            await supabase.auth.signOut();
                        }
                        await storage.clearAll();
                        navigation.reset({ index: 0, routes: [{ name: 'SignUp' }] });
                    } catch (e: any) {
                        Alert.alert("Cleanup Error", e.message);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]
    );
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

  const handlePress = async (action: string) => {
    if (action === 'Send Feedback') {
        Linking.openURL('mailto:info@rulesimple.com?subject=Unscroll Feedback');
        return;
    }
    
    // External screens
    const screenMap: Record<string, string> = {
      'Help Center': 'FAQ',
      'Terms & Privacy': 'Terms',
      'About': 'AboutDetail'
    };

    const screenName = screenMap[action];
    if (screenName) {
      navigation.navigate(screenName);
    } else {
      alert(`${action} coming soon.`);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  const renderProfileField = (label: string, value: string, placeholder: string, key: keyof typeof profile) => {
    const isThisFieldEditing = editingField === key;

    return (
        <View style={{ marginBottom: SPACING.m }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginBottom: 4 }}>{label}</Text>
            {isThisFieldEditing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TextInput
                        style={{ flex: 1, backgroundColor: COLORS.surfaceHighlight, color: COLORS.textPrimary, padding: 12, borderRadius: 8 }}
                        value={editValue}
                        onChangeText={setEditValue}
                        placeholder={placeholder}
                        placeholderTextColor={COLORS.textTertiary}
                        autoFocus
                        autoCapitalize={key === 'email' ? 'none' : 'words'}
                    />
                    <TouchableOpacity 
                        onPress={handleSaveField}
                        disabled={saving}
                        style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8 }}
                    >
                        <Text style={{ color: 'white', fontWeight: '700' }}>{saving ? '...' : '✓'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setEditingField(null)}
                        style={{ backgroundColor: COLORS.surfaceHighlight, padding: 12, borderRadius: 8 }}
                    >
                        <Text style={{ color: COLORS.textSecondary }}>✕</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity onPress={() => {
                    setEditingField(key);
                    setEditValue(value);
                }}>
                    <Text style={[TYPOGRAPHY.body, { fontWeight: value ? '700' : '400', color: value ? COLORS.textPrimary : COLORS.primary }]}>
                        {value || `+ Add ${label.toLowerCase()}`}
                    </Text>
                </TouchableOpacity>
            )}
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
          <CardHeader>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </View>
                <Avatar 
                    initials={profile.avatarUrl || (profile.firstName[0] || '') + (profile.lastName[0] || '')} 
                    onPress={() => setShowAvatarPicker(true)} 
                />
            </View>
          </CardHeader>
          <CardContent>
            {renderProfileField('FIRST NAME', profile.firstName, 'Enter first name', 'firstName')}
            {renderProfileField('LAST NAME', profile.lastName, 'Enter last name', 'lastName')}
            {renderProfileField('EMAIL', profile.email, 'Enter email', 'email')}
            {renderProfileField('DATE OF BIRTH', profile.dob, 'DD-MM-YYYY', 'dob')}
          </CardContent>
        </Card>

        {/* Avatar Picker Modal Equivalent */}
        {showAvatarPicker && (
            <Card style={{ padding: SPACING.l, position: 'absolute', top: 100, left: 20, right: 20, zIndex: 100 }}>
                <CardHeader>
                    <CardTitle>Select Avatar</CardTitle>
                    <CardDescription>Choose a symbol for your journey</CardDescription>
                </CardHeader>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: SPACING.l }}>
                    {PREDEFINED_AVATARS.map(avatar => (
                        <TouchableOpacity 
                            key={avatar} 
                            onPress={() => handleAvatarSelect(avatar)}
                            style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ fontSize: 24 }}>{avatar}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Button variant="secondary" onPress={handlePickPhoto} style={{ marginBottom: SPACING.s }}>Choose from Gallery</Button>
                <Button variant="outline" onPress={() => setShowAvatarPicker(false)}>Cancel</Button>
            </Card>
        )}

        {/* Support Card (Moved UP) */}
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help and learn about Unscroll</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: SPACING.xs }}>
            <Button variant="ghost" onPress={() => handlePress('About')} style={{ justifyContent: 'flex-start' }} icon="✨">About Unscroll</Button>
            <Button variant="ghost" onPress={() => handlePress('Help Center')} style={{ justifyContent: 'flex-start' }} icon="❓">Help Center (FAQ)</Button>
            <Button variant="ghost" onPress={() => handlePress('Send Feedback')} style={{ justifyContent: 'flex-start' }} icon="✉️">Send Feedback</Button>
            <Button variant="ghost" onPress={() => handlePress('Terms & Privacy')} style={{ justifyContent: 'flex-start' }} icon="⚖️">Terms & Privacy</Button>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your session</CardDescription>
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
                <Text style={{ color: COLORS.textSecondary, fontWeight: '700' }}>Reset Local Data</Text>
            </Button>
          </CardContent>
        </Card>

        <View style={{ marginTop: SPACING.xl, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>Unscroll v1.0.0 (Build 2)</Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 11, marginTop: 4 }}>© 2025 RuleSimple</Text>
            <TouchableOpacity onPress={handleDeleteAccount} style={{ marginTop: 24 }}>
                <Text style={{ color: '#F87171', fontSize: 12, textDecorationLine: 'underline' }}>Delete Account Permanently</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
};
