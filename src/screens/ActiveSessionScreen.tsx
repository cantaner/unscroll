import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ScreenContainer, Button } from '../components/UiComponents';
import { TYPOGRAPHY, SPACING } from '../theme';
import { storage } from '../storage';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSession'>;

export const ActiveSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      const session = sessionId ? await storage.getSessionById?.(String(sessionId)) : null;
      if (!isActive) return;
      if (session) {
        setStartTime(session.startTime);
      } else {
        const fallback = await storage.getActiveSession?.();
        if (!isActive) return;
        if (fallback) {
          // Ensure the route param matches the actual active session.
          if (String(sessionId) !== fallback.id) {
            navigation.replace('ActiveSession', { sessionId: fallback.id } as any);
          }
          setStartTime(fallback.startTime);
        } else {
          setMissing(true);
        }
      }
    };
    load();
    return () => { isActive = false; };
  }, [sessionId]);

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
    <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={TYPOGRAPHY.h1}>Session Active</Text>
      <Text style={[TYPOGRAPHY.statValue, { fontSize: 64, marginVertical: SPACING.xl }]}>
        {formatTime(duration)}
      </Text>
      <Text style={[TYPOGRAPHY.body, { textAlign: 'center', marginBottom: SPACING.xxl }]}>
        You are currently in a logged session.{'\n'}
        When you are done, tap stop.
      </Text>

      <Button 
        title="Stop Session" 
        onPress={handleStop} 
      />
    </ScreenContainer>
  );
};
