import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Breathe'>;

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES: Array<{ name: Phase; seconds: number; scale: number; opacity: number; colorIndex: number }> = [
  { name: 'inhale', seconds: 4, scale: 1.25, opacity: 0.7, colorIndex: 0 },
  { name: 'hold', seconds: 2, scale: 1.25, opacity: 0.85, colorIndex: 1 },
  { name: 'exhale', seconds: 4, scale: 0.82, opacity: 1, colorIndex: 2 },
  { name: 'rest', seconds: 2, scale: 0.82, opacity: 0.9, colorIndex: 3 },
];

export const BreatheScreen: React.FC<Props> = ({ navigation }) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [introCountdown, setIntroCountdown] = useState(3);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.9)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const runningRef = useRef(true);

  useEffect(() => {
    runningRef.current = true;

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

    const runSegment = async (seg: typeof PHASES[number]) => {
      setPhase(seg.name);
      setSeconds(seg.seconds);
      if (countdownRef.current) clearInterval(countdownRef.current);
      let remaining = seg.seconds;
      countdownRef.current = setInterval(() => {
        remaining -= 1;
        setSeconds(r => (remaining > 0 ? remaining : 0));
      }, 1000);

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
    };
  }, [colorAnim, opacity, scale]);

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#5eead4', '#a5b4fc', '#22d3ee', '#67e8f9'],
  });

  const haloColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['#99f6e4', '#c7d2fe', '#67e8f9', '#a5f3fc'],
  });

  const getPhaseInstruction = (p: Phase) => {
    switch (p) {
      case 'inhale': return 'Breathe in';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe out';
      case 'rest': return 'Rest';
    }
  };

  const statusText = introCountdown > 0
    ? `Get ready — ${introCountdown}`
    : `${getPhaseInstruction(phase)} — ${seconds}s`;

  return (
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.l }}>
      <Animated.View style={{ position: 'absolute', top: 20, left: -60, width: 320, height: 320, borderRadius: 160, backgroundColor: haloColor, opacity: 0.18 }} />
      <Animated.View style={{ position: 'absolute', bottom: 20, right: -80, width: 360, height: 360, borderRadius: 180, backgroundColor: bgColor, opacity: 0.12 }} />
      <Animated.View style={{ position: 'absolute', top: 120, right: 20, width: 180, height: 180, borderRadius: 90, backgroundColor: haloColor, opacity: 0.1 }} />
      <Animated.View style={{ position: 'absolute', bottom: 100, left: 30, width: 220, height: 220, borderRadius: 110, backgroundColor: bgColor, opacity: 0.08 }} />

      <Text style={[TYPOGRAPHY.h1, { marginBottom: SPACING.xs, fontSize: 28, fontWeight: '600' }]}>Guided breath</Text>
      <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl, fontSize: 15, lineHeight: 22 }}>
        Follow the circle. Reset your nervous system.
      </Text>

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
        <Text style={{ color: '#e5e7eb', fontSize: 22, letterSpacing: 1.2, fontWeight: '600', textTransform: 'capitalize' }}>
          {introCountdown > 0 ? 'Ready' : phase}
        </Text>
      </Animated.View>

      <Text style={{ color: COLORS.textPrimary, marginTop: SPACING.l, fontSize: 18, fontWeight: '500' }}>{statusText}</Text>

      <View style={{ height: SPACING.xl }} />
      <Button title="Back to dashboard" variant="secondary" onPress={() => navigation.popToTop()} />
    </ScreenContainer>
  );
}
