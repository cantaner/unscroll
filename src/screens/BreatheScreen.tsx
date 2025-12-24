import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Breathe'>;

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

const PHASES: Array<{ name: Phase; seconds: number; scale: number; opacity: number; colorIndex: number; label: string }> = [
  { name: 'inhale', seconds: 4, label: 'Inhale', scale: 1.35, opacity: 0.8, colorIndex: 0 },
  { name: 'hold-in', seconds: 2, label: 'Hold', scale: 1.35, opacity: 0.8, colorIndex: 1 },
  { name: 'exhale', seconds: 4, label: 'Exhale', scale: 0.85, opacity: 1, colorIndex: 2 },
  { name: 'hold-out', seconds: 2, label: 'Hold', scale: 0.85, opacity: 1, colorIndex: 1 },
];

export const BreatheScreen: React.FC<Props> = ({ navigation }) => {
  const [phaseObj, setPhaseObj] = useState(PHASES[0]);
  const [seconds, setSeconds] = useState(4);
  const [introCountdown, setIntroCountdown] = useState(3);
  const [sessionSeconds, setSessionSeconds] = useState(0); // Track total session time
  
  const scale = useRef(new Animated.Value(0.85)).current; // Start small
  const opacity = useRef(new Animated.Value(0.9)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const runningRef = useRef(true);
  
  // Gamification: Track start time
  const sessionStart = useRef(Date.now());

  useEffect(() => {
    runningRef.current = true;
    sessionStart.current = Date.now();

    // Session Timer (non-intrusive 5m goal)
    const sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStart.current) / 1000);
        setSessionSeconds(elapsed);
    }, 1000);

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    const runSegment = async (seg: typeof PHASES[number]) => {
      setPhaseObj(seg);
      setSeconds(seg.seconds);
      
      if (countdownRef.current) clearInterval(countdownRef.current);
      let remaining = seg.seconds;
      
      // Countdown for phase
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSeconds(r => (remaining > 0 ? remaining : 0));
      }, 1000);

      // Animations
      Animated.parallel([
        Animated.timing(scale, { toValue: seg.scale, duration: seg.seconds * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(opacity, { toValue: seg.opacity, duration: seg.seconds * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: seg.colorIndex, duration: seg.seconds * 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]).start();

      await wait(seg.seconds * 1000);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };

    const loop = async () => {
      while (runningRef.current) {
        for (const seg of PHASES) {
          if (!runningRef.current) break;
          await runSegment(seg);
        }
      }
    };

    // Intro countdown then start loop
    let intro = 3;
    setIntroCountdown(intro);
    const introTimer = setInterval(() => {
      intro -= 1;
      if (intro <= 0) {
        clearInterval(introTimer);
        setIntroCountdown(0);
        loop();
      } else {
        setIntroCountdown(intro);
      }
    }, 1000);

    return () => {
      runningRef.current = false;
      if (countdownRef.current) clearInterval(countdownRef.current);
      clearInterval(introTimer);
      clearInterval(sessionTimer);
    };
  }, [colorAnim, opacity, scale]);

  const handleFinish = async () => {
    const duration = (Date.now() - sessionStart.current) / 1000;
    
    // Log Session & Award XP
    if (duration > 15) { 
        const session: SessionEvent = {
            id: Date.now().toString(),
            startTime: sessionStart.current,
            endTime: Date.now(),
            durationMinutes: Math.ceil(duration / 60),
            appId: 'focus', // Attribution
            activityType: 'Meditation',
            reason: 'intentional',
            isComplete: true
        };
        await storage.saveSession(session);

        const xp = Math.floor(duration / 5) + 5; // Bonus for breathing
        await storage.addXP(xp);
    }
    navigation.popToTop();
  };

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#5eead4', '#a5b4fc', '#22d3ee'], // Teal -> Indigo -> Cyan
  });

  const haloColor = colorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#99f6e4', '#c7d2fe', '#67e8f9'],
  });

  const statusText = introCountdown > 0
    ? `Get ready...`
    : phaseObj.label;

  const formatSessionTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.l }}>
        {/* Session Timer (Top Right) */}
        <View style={{ position: 'absolute', top: 50, right: 20 }}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: 'monospace', fontSize: 16 }}>
                {formatSessionTime(sessionSeconds)}
            </Text>
        </View>

      <Animated.View style={{ position: 'absolute', top: 20, left: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: haloColor, opacity: 0.18 }} />
      <Animated.View style={{ position: 'absolute', bottom: 20, right: -80, width: 360, height: 360, borderRadius: 180, backgroundColor: bgColor, opacity: 0.12 }} />

      <Text style={[TYPOGRAPHY.h1, { marginBottom: SPACING.s }]}>Guided breath</Text>
      <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl }}>
        Follow the circle to reset your nervous system.
      </Text>

      {/* Main Circle */}
      <Animated.View style={{
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scale }],
        opacity,
        shadowColor: '#0ea5e9',
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 2,
        borderColor: bgColor,
      }}>
        <Text style={{ color: '#e5e7eb', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' }}>
          {introCountdown > 0 ? introCountdown : statusText}
        </Text>
         {introCountdown <= 0 && (
            <Text style={{ color: '#94a3b8', fontSize: 18, marginTop: 4 }}>
                {seconds}s
            </Text>
         )}
      </Animated.View>

      <View style={{ height: SPACING.xl * 2 }} />
      
      <Button title="End Session" variant="secondary" onPress={handleFinish} style={{ width: 200 }} />
    </ScreenContainer>
  );
}
