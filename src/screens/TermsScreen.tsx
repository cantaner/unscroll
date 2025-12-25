import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import {
    Button,
    ScreenContainer
} from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const TermsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [termsData, setTermsData] = useState<{ title: string, content: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const data = await storage.getCMSContent('terms');
    setTermsData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l }}>
          <Button 
            title="←" 
            variant="ghost" 
            onPress={() => navigation.goBack()} 
            style={{ width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0, marginBottom: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center' }} 
          />
          <Text style={[TYPOGRAPHY.h1]}>Terms & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.body, { color: COLORS.textPrimary, lineHeight: 24, opacity: 0.9 }]}>
            {termsData?.content.replace(/### /g, '\n\n').trim()}
        </Text>
        
        <View style={{ marginTop: SPACING.xl, padding: SPACING.m, backgroundColor: COLORS.surfaceHighlight, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' }}>
                Last updated: 2025-12-25. Unscroll is a product of RuleSimple. By continuing to use the app, you agree to these distilled terms focused on focus, privacy, and growth.
            </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
