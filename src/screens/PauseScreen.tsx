import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SessionEvent } from '../types';
import { ScreenContainer, Button } from '../components/UiComponents';
import { TYPOGRAPHY, COLORS, SPACING } from '../theme';
import { getRandomMessage } from '../messages';
import { storage } from '../storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Pause'>;

export const PauseScreen: React.FC<Props> = ({ navigation }) => {
  const [timeLeft, setTimeLeft] = useState(5); // Shorter, 5s check-in
  const [message] = useState(getRandomMessage());
  const [instruction, setInstruction] = useState("Breathe In");
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

    // Toggle Text Instruction
    const textInterval = setInterval(() => {
        setInstruction(prev => prev === "Breathe In" ? "Breathe Out" : "Breathe In");
    }, 3000);

    // Countdown
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(textInterval);
          setInstruction("Ready?");
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
  }, []);

  const handleContinue = async () => {
    const plan = await storage.getPlan();
    const session: SessionEvent = {
      id: Date.now().toString(),
      startTime: Date.now(),
      appId: plan?.apps[0] || 'unknown',
      reason: 'unknown',
      isComplete: false
    };
    await storage.saveSession(session);
    navigation.replace('ActiveSession', { sessionId: session.id });
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      {/* Breathing Circle */}
      <Animated.View style={{
        width: 240, height: 240, borderRadius: 120, 
        backgroundColor: COLORS.surface,
        borderWidth: 1, borderColor: COLORS.border,
        marginBottom: SPACING.xl, alignItems: 'center', justifyContent: 'center',
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
        shadowColor: COLORS.primary, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
      }}>
        <Text style={{ fontSize: 64, fontWeight: '200', color: COLORS.primary }}>
          {timeLeft > 0 ? timeLeft : '✓'}
        </Text>
      </Animated.View>
      
      <Text style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, color: COLORS.textTertiary, marginBottom: SPACING.l }}>
          {timeLeft > 0 ? instruction : "Mindful Check-in"}
      </Text>

      <Text style={[TYPOGRAPHY.h2, { textAlign: 'center', paddingHorizontal: SPACING.l, fontSize: 22 }]}>
        "{message}"
      </Text>

      <View style={{ flex: 1 }} />
      
      <View style={{ width: '100%', gap: 12 }}>
          {timeLeft === 0 && (
            <Button title="Continue to App" onPress={handleContinue} />
          )}
          <Button title="I don't need to scroll" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
};