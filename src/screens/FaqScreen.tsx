import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, View } from 'react-native';
import {
    Accordion,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    ScreenContainer
} from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const FaqScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState<{ title: string, content: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const data = await storage.getCMSContent('faq');
    setFaqData(data);
    setLoading(false);
  };

  const handleContact = () => {
    Linking.openURL('mailto:info@rulesimple.com?subject=Unscroll Support Request');
  };

  // Helper to parse the markdown-ish FAQ list into items
  const parseFAQ = (content: string) => {
    const lines = content.split('\n');
    const items: { q: string, a: string }[] = [];
    let currentQ = '';
    let currentA = '';

    lines.forEach(line => {
      if (line.startsWith('###')) {
        if (currentQ) items.push({ q: currentQ, a: currentA.trim() });
        currentQ = line.replace('###', '').trim();
        currentA = '';
      } else if (currentQ) {
        currentA += line + '\n';
      }
    });
    if (currentQ) items.push({ q: currentQ, a: currentA.trim() });
    return items;
  };

  if (loading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  const items = faqData ? parseFAQ(faqData.content) : [];

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l }}>
          <Button 
            title="←" 
            variant="ghost" 
            onPress={() => navigation.goBack()} 
            style={{ width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0, marginBottom: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center' }} 
          />
          <Text style={[TYPOGRAPHY.h1]}>Help Center</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.subtitle, { marginBottom: SPACING.l, color: COLORS.textSecondary }]}>
            Common questions about focus, security, and using Unscroll.
        </Text>

        {items.map((item, index) => (
            <Accordion key={index} title={item.q}>
                <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, lineHeight: 22 }]}>
                    {item.a}
                </Text>
            </Accordion>
        ))}

        <Card style={{ marginTop: SPACING.xl, backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary }}>
            <CardHeader>
                <CardTitle>Still need help?</CardTitle>
            </CardHeader>
            <CardContent>
                <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m }]}>
                    Can't find what you're looking for? Our team is here to help you stay focused.
                </Text>
                <Button title="Send Message" onPress={handleContact} />
            </CardContent>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};
