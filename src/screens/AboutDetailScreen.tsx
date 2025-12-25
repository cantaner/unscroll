import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import {
    Badge,
    Button,
    ScreenContainer
} from '../components/UiComponents';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

export const AboutDetailScreen = ({ navigation }: any) => {
  // Use the generated banner path - I'll need to make sure this path is correct or use a local require if I move it
  // For now I'll use a placeholder URL and the user can swap it or I'll fix it once I know the final asset location.
  const bannerUri = 'https://raw.githubusercontent.com/cantaner/unscroll-assets/main/about_banner.png'; // Placeholder or I'll use local if possible

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: SPACING.xxl }} showsVerticalScrollIndicator={false}>
        
        {/* Rich Banner Area */}
        <View style={{ width: '100%', height: 350, backgroundColor: COLORS.primaryDim }}>
            <Image 
                source={require('../../assets/images/about_banner.png')} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            />
            <View style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, 
                padding: SPACING.l, backgroundColor: 'rgba(0,0,0,0.4)'
            }}>
                <Text style={[TYPOGRAPHY.h1, { color: 'white', marginBottom: 4 }]}>Reclaim Your Focus</Text>
                <Text style={{ color: 'white', opacity: 0.8, fontSize: 16 }}>The story of Unscroll</Text>
            </View>
        </View>

        <View style={{ padding: SPACING.l }}>
            <Button 
                title="← Back to Settings" 
                variant="ghost" 
                onPress={() => navigation.goBack()} 
                style={{ alignSelf: 'flex-start', paddingHorizontal: 0, marginBottom: SPACING.l }}
            />

            <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.m }]}>Our Mission</Text>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.l, lineHeight: 24 }]}>
                In an era of infinite loops and attention-hijacking algorithms, Unscroll was born from a simple realization: your attention is your most precious resource. 
                {"\n\n"}
                We didn't want to build just another "blocking" app. We wanted to build a sanctuary—a tool that empowers you to choose intentionality over impulsivity.
            </Text>

            <View style={{ flexDirection: 'row', gap: SPACING.s, marginBottom: SPACING.xl }}>
              <Badge variant="success">Intentional</Badge>
              <Badge variant="default">Privacy First</Badge>
              <Badge variant="secondary">Ad Free</Badge>
            </View>

            <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.m }]}>How It Works</Text>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.l, lineHeight: 24 }]}>
                By introducing a "Conscious Pause" before you dive into distracting apps, Unscroll gives your prefrontal cortex a chance to catch up. 
                {"\n\n"}
                Our Gamified Experience (XP) system rewards you for the minutes you spend building yourself, while providing gentle accountability for slip-ups.
            </Text>

            <View style={{ 
                backgroundColor: COLORS.surface, 
                padding: SPACING.l, 
                borderRadius: 20, 
                borderWidth: 1, 
                borderColor: COLORS.border,
                marginBottom: SPACING.xl
            }}>
                <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.s, color: COLORS.primary, fontSize: 18 }]}>Digital Wellness</Text>
                <Text style={[TYPOGRAPHY.body, { fontSize: 14, opacity: 0.8 }]}>
                    "Unscroll isn't just an app; it's a movement towards a more conscious relationship with technology."
                </Text>
            </View>

            <Text style={[TYPOGRAPHY.h2, { marginBottom: SPACING.m }]}>Zero Data Trade-offs</Text>
            <Text style={[TYPOGRAPHY.body, { marginBottom: SPACING.m, lineHeight: 24 }]}>
                We believe privacy is an essential human right. Unscroll never sells your data, never tracks your specific URLs, and never uses trackers. Your growth remains your business.
            </Text>

            <View style={{ marginTop: SPACING.xxl, alignItems: 'center' }}>
                <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>v1.0.0 • Handcrafted by RuleSimple</Text>
            </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
