import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pause'>;

const FOCUS_ACTIVITIES = ['Deep Work', 'Reading', 'Study', 'Meditation', 'Rest', 'Creativity', 'Other'];

export const PauseScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<'select' | 'breathe'>('select');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  
  // Breath State
  const [timeLeft, setTimeLeft] = useState(5); // Shorter, 5s check-in
  const [instruction, setInstruction] = useState("Breathe In"); // Still used for internal animation logic, not directly displayed
  
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

    // Toggle Text Instruction (internal, not directly displayed in new UI)
    const textInterval = setInterval(() => {
        setInstruction(prev => prev === "Breathe In" ? "Breathe Out" : "Breathe In");
    }, 3000);

    // Countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(textInterval);
          // setInstruction("Ready?"); // No longer needed as text is hardcoded
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
        clearInterval(interval);
        clearInterval(textInterval);
        loop.stop();
    };
  }, [step]); // Rerun effect when step changes to 'breathe'

  const handleSelect = (activity: string) => {
      setSelectedActivity(activity);
      setStep('breathe');
  };

  const handleStart = async () => {
    const session: SessionEvent = {
      id: Date.now().toString(),
      startTime: Date.now(),
      appId: 'focus',
      activityType: selectedActivity, // Saved Intention
      reason: 'intentional',
      isComplete: false
    };
    await storage.saveSession(session);
    navigation.replace('ActiveSession', { sessionId: session.id });
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      {step === 'select' ? (
        <View style={{ width: '100%' }}>
            <Text style={[TYPOGRAPHY.h1, { textAlign: 'center', marginBottom: SPACING.s }]}>Set Intention</Text>
            <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', marginBottom: SPACING.xl }]}>What will you focus on?</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {FOCUS_ACTIVITIES.map(activity => (
                    <TouchableOpacity
                        key={activity}
                        onPress={() => handleSelect(activity)}
                        style={{
                            backgroundColor: COLORS.surface,
                            paddingVertical: 16,
                            paddingHorizontal: 24,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            width: '45%',
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: COLORS.textPrimary, fontWeight: '600' }}>{activity}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
             <Button 
                title="Cancel" 
                variant="ghost" 
                onPress={() => navigation.goBack()} 
                style={{ marginTop: SPACING.xl }}
             />
        </View>
      ) : (
        <>
            <Animated.View style={{
                width: 240, height: 240, borderRadius: 120, 
                backgroundColor: COLORS.surface,
                borderWidth: 1, borderColor: COLORS.primary,
                marginBottom: SPACING.xl, alignItems: 'center', justifyContent: 'center',
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
                shadowColor: COLORS.primary, shadowOpacity: 0.2, shadowRadius: 30, elevation: 10
            }}>
                <Text style={{ fontSize: 64, fontWeight: '200', color: COLORS.primary }}>
                {timeLeft > 0 ? timeLeft : '✓'}
                </Text>
            </Animated.View>
            
            <Text style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.textTertiary, marginBottom: SPACING.l }}>
                {timeLeft > 0 ? "Centering..." : "Ready"}
            </Text>

            <Text style={[TYPOGRAPHY.h2, { textAlign: 'center', paddingHorizontal: SPACING.l, fontSize: 20 }]}>
                Preparing for {selectedActivity}...
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