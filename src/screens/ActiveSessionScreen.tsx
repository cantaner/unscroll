import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSession'>;

const NEGATIVE_APPS = ['Twitter', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Reddit', 'Gaming', 'Other'];

export const ActiveSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [activity, setActivity] = useState<string>('Focus');
  const [missing, setMissing] = useState(false);
  const [isNegativeSession, setIsNegativeSession] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Determine session type and theme
  const themeColor = isNegativeSession ? '#FF6B6B' : COLORS.primary;
  const emoji = isNegativeSession ? '🌊' : '🧘';

  // Pulse Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
      ])
    ).start();
  }, []);

  // Load Session Logic
  useEffect(() => {
    let isActive = true;
    const load = async () => {
      const session = sessionId ? await storage.getSessionById?.(String(sessionId)) : null;
      if (!isActive) return;
      if (session) {
        setStartTime(session.startTime);
        if (session.activityType) {
          setActivity(session.activityType);
          setIsNegativeSession(NEGATIVE_APPS.includes(session.activityType));
        }
      } else {
        const fallback = await storage.getActiveSession?.();
        if (!isActive) return;
        if (fallback) {
          if (String(sessionId) !== fallback.id) {
            navigation.replace('ActiveSession', { sessionId: fallback.id } as any);
          }
          setStartTime(fallback.startTime);
          if (fallback.activityType) {
            setActivity(fallback.activityType);
            setIsNegativeSession(NEGATIVE_APPS.includes(fallback.activityType));
          }
        } else {
          setMissing(true);
        }
      }
    };
    load();
    return () => { isActive = false; };
  }, [sessionId]);

  // Timer Logic
  useEffect(() => {
    if (startTime == null) return;
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStop = () => {
    navigation.replace('LogSession', { sessionId } as any);
  };

  if (missing) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[TYPOGRAPHY.body, { textAlign: 'center', marginBottom: SPACING.l }]}>
          We couldn't find this session. You can go back or start a new one.
        </Text>
        <Button title="Back to Dashboard" onPress={() => navigation.popToTop()} />
        <View style={{ height: SPACING.m }} />
        <Button title="Start New Session" onPress={() => navigation.replace('Pause')} />
      </ScreenContainer>
    );
  }

  if (startTime == null) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={TYPOGRAPHY.body}>Loading session...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={{ justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.l }}>
      
      {/* Top Section: Timer & Activity */}
      <View style={{ alignItems: 'center', marginTop: SPACING.xl }}>
          <Text style={[TYPOGRAPHY.h1, { color: COLORS.textSecondary, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.xs }]}>
            {isNegativeSession ? 'Slip-Up Session' : 'Focus Session'}
          </Text>
          <Text style={[TYPOGRAPHY.statValue, { fontSize: 80, color: themeColor, lineHeight: 84 }]}>
            {formatTime(duration)}
          </Text>
           <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>{activity}</Text>
      </View>

      {/* Center Section: Pulse Animation */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* Pulse Background */}
          <Animated.View style={{
              position: 'absolute',
              width: 320, height: 320, borderRadius: 160,
              backgroundColor: COLORS.surfaceHighlight,
              opacity: 0.15,
              transform: [{ scale: pulseAnim }]
          }} />

          <Animated.View style={{
             width: 240, height: 240, borderRadius: 120,
             backgroundColor: COLORS.surfaceHighlight,
             opacity: 0.1,
             alignItems: 'center', justifyContent: 'center',
             transform: [{ scale: Animated.multiply(pulseAnim, 0.95) }]
          }}>
             <Text style={{ fontSize: 80 }}>{emoji}</Text>
          </Animated.View>
      </View>

      {/* Bottom Section: Stop Button */}
      <View style={{ width: '100%', alignItems: 'center', paddingBottom: SPACING.xl }}>
        <Button 
            title="Finish Session" 
            onPress={handleStop}
            variant="ghost"
            style={{ width: 'auto' }}
        />
      </View>
    </ScreenContainer>
  );
};
