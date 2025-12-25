import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pause'>;

const POSITIVE_ACTIVITIES = [
  { id: 'deep-work', label: 'Deep Work', emoji: '💼' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'study', label: 'Study', emoji: '📝' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'exercise', label: 'Exercise', emoji: '💪' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' },
  { id: 'rest', label: 'Rest', emoji: '😴' },
  { id: 'other-positive', label: 'Other', emoji: '✨' },
];

const NEGATIVE_ACTIVITIES = [
  { id: 'twitter', label: 'Twitter', emoji: '🐦' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'youtube', label: 'YouTube', emoji: '📺' },
  { id: 'facebook', label: 'Facebook', emoji: '👥' },
  { id: 'reddit', label: 'Reddit', emoji: '🤖' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'other-negative', label: 'Other', emoji: '📱' },
];

export const PauseScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<'intention' | 'activity' | 'breathe'>('intention');
  const [intention, setIntention] = useState<'positive' | 'negative' | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  
  // Breath State
  const [timeLeft, setTimeLeft] = useState(5);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (step !== 'breathe') return;

    // Breathing Animation Loop
    const breathe = Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(fadeAnim, { toValue: 0.6, duration: 3000, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(fadeAnim, { toValue: 1.0, duration: 3000, useNativeDriver: true }),
      ])
    ]);

    const loop = Animated.loop(breathe);
    loop.start();

    // Countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      loop.stop();
    };
  }, [step]);

  const handleIntentionSelect = (selectedIntention: 'positive' | 'negative') => {
    setIntention(selectedIntention);
    setStep('activity');
  };

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
    if (intention === 'positive') {
      // Skip breathing for positive sessions
      handleStartImmediately(activity);
    } else {
      setStep('breathe');
    }
  };

  const handleStartImmediately = async (activityOverride?: string) => {
    const isPositive = intention === 'positive';
    const a = activityOverride || selectedActivity;
    const session: SessionEvent = {
        id: Date.now().toString(),
        startTime: Date.now(),
        appId: isPositive ? 'focus' : a,
        activityType: a,
        reason: 'intentional',
        isComplete: false
    };

    await storage.saveSession(session);

    if (!isPositive) {
        await storage.logAppUsage({
            appId: a,
            durationMinutes: 0,
            timestamp: Date.now()
        });
    }

    navigation.replace('ActiveSession', { sessionId: session.id });
  };

  const handleStart = async () => {
    await handleStartImmediately();
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      {step === 'intention' && (
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={[TYPOGRAPHY.h1, { textAlign: 'center', marginBottom: SPACING.s }]}>Start Session</Text>
          <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', marginBottom: SPACING.xxl, color: COLORS.textSecondary }]}>
            What's your intention?
          </Text>
          
          {/* Positive Intention Card */}
          <TouchableOpacity
            onPress={() => handleIntentionSelect('positive')}
            style={{
              width: '100%',
              backgroundColor: COLORS.surface,
              padding: SPACING.xl,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: COLORS.primary,
              marginBottom: SPACING.l,
              alignItems: 'center',
              shadowColor: COLORS.primary,
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 5
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: SPACING.m }}>🌱</Text>
            <Text style={[TYPOGRAPHY.h2, { color: COLORS.primary, marginBottom: SPACING.xs }]}>
              Build Yourself
            </Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Invest in growth, focus, and well-being
            </Text>
          </TouchableOpacity>

          {/* Negative Intention Card */}
          <TouchableOpacity
            onPress={() => handleIntentionSelect('negative')}
            style={{
              width: '100%',
              backgroundColor: COLORS.surface,
              padding: SPACING.xl,
              borderRadius: 20,
              borderWidth: 2,
              borderColor: '#FF6B6B',
              alignItems: 'center',
              shadowColor: '#FF6B6B',
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 5
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: SPACING.m }}>🌊</Text>
            <Text style={[TYPOGRAPHY.h2, { color: '#FF6B6B', marginBottom: SPACING.xs }]}>
              Give In to Desire
            </Text>
            <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary, textAlign: 'center' }]}>
              Track distractions and slip-ups
            </Text>
          </TouchableOpacity>

          <Button 
            title="Cancel" 
            variant="ghost" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      )}

      {step === 'activity' && (
        <View style={{ width: '100%' }}>
          <Text style={[TYPOGRAPHY.h1, { textAlign: 'center', marginBottom: SPACING.s }]}>
            {intention === 'positive' ? 'Build Yourself' : 'Give In to Desire'}
          </Text>
          <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', marginBottom: SPACING.xl, color: COLORS.textSecondary }]}>
            What will you {intention === 'positive' ? 'focus on' : 'track'}?
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {(intention === 'positive' ? POSITIVE_ACTIVITIES : NEGATIVE_ACTIVITIES).map(activity => (
              <TouchableOpacity
                key={activity.id}
                onPress={() => handleActivitySelect(activity.label)}
                style={{
                  backgroundColor: COLORS.surface,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  width: '45%',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 8
                }}
              >
                <Text style={{ fontSize: 24 }}>{activity.emoji}</Text>
                <Text style={{ color: COLORS.textPrimary, fontWeight: '600', flex: 1 }}>
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Button 
            title="Back" 
            variant="ghost" 
            onPress={() => setStep('intention')} 
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      )}

      {step === 'breathe' && (
        <>
          <Animated.View style={{
            width: 240, height: 240, borderRadius: 120, 
            backgroundColor: COLORS.surface,
            borderWidth: 1, 
            borderColor: intention === 'positive' ? COLORS.primary : '#FF6B6B',
            marginBottom: SPACING.xl, alignItems: 'center', justifyContent: 'center',
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            shadowColor: intention === 'positive' ? COLORS.primary : '#FF6B6B',
            shadowOpacity: 0.2, shadowRadius: 30, elevation: 10
          }}>
            <Text style={{ 
              fontSize: 64, 
              fontWeight: '200', 
              color: intention === 'positive' ? COLORS.primary : '#FF6B6B' 
            }}>
              {timeLeft > 0 ? timeLeft : '✓'}
            </Text>
          </Animated.View>
          
          <Text style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.textTertiary, marginBottom: SPACING.l }}>
            {timeLeft > 0 ? "Centering..." : "Ready"}
          </Text>

          <Text style={[TYPOGRAPHY.h2, { textAlign: 'center', paddingHorizontal: SPACING.l, fontSize: 20 }]}>
            Take a moment before you {selectedActivity.toLowerCase()}...
          </Text>
          <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginTop: 8, paddingHorizontal: 40 }}>
            Centering yourself helps break the cycle of impulsive scrolling.
          </Text>

          <View style={{ flex: 1 }} />
          
          <View style={{ width: '100%', gap: 12 }}>
            {timeLeft === 0 && (
              <Button title="Begin Session" onPress={handleStart} />
            )}
            {timeLeft > 0 && (
              <Button title="Skip Breathing" variant="ghost" onPress={handleStart} />
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
};