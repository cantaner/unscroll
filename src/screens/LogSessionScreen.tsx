import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LogSession'>;

const ACTIVITIES = ['Deep Work', 'Reading', 'Study', 'Meditation', 'Rest', 'Creativity', 'Other'];
const FEELINGS = ['Proud', 'Calm', 'Focused', 'Refreshed', 'Neutral'];

export const LogSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [session, setSession] = useState<SessionEvent | null>(null);
  const [activity, setActivity] = useState(ACTIVITIES[0]);
  const [feeling, setFeeling] = useState(FEELINGS[0]);
  const [sessionMissing, setSessionMissing] = useState(false);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const s = await storage.getSessionById?.(sessionId);
        if (!isActive) return;

        if (s) {
          setSession(s);
        } else {
          const fallback = await storage.getActiveSession?.();
          if (fallback) {
            if (String(sessionId) !== fallback.id) {
              navigation.replace('LogSession', { sessionId: fallback.id } as any);
            }
            setSession(fallback);
          } else {
            setSessionMissing(true);
          }
        }
      } catch (e) {
        if (isActive) setSessionMissing(true);
      }
    };
    load();
    return () => { isActive = false; };
  }, [sessionId]);

  const handleSave = async () => {
    if (!session) return;
    const endTime = Date.now();
    const durationMinutes = Math.ceil(((endTime - session.startTime) / 1000) / 60);
    
    // Save enriched session
    const updated: SessionEvent = {
      ...session,
      endTime,
      durationMinutes,
      appId: activity, // Store the focus activity
      reason: feeling, // Store the feeling
      isComplete: true
    };
    await storage.saveSession(updated);
    
    // Gamification: Award XP based on duration (e.g. 5 XP per minute)
    const xpEarned = Math.max(10, durationMinutes * 5);
    await storage.addXP(xpEarned); 
    
    await storage.setActiveSessionId?.(null);
    navigation.popToTop(); 
  };

  if (sessionMissing && !session) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
       <Text style={TYPOGRAPHY.body}>Session not found.</Text>
       <Button title="Back" onPress={() => navigation.popToTop()} />
      </ScreenContainer>
    );
  }

  // Calculate duration for display
  const currentDuration = session ? Math.ceil(((Date.now() - session.startTime) / 1000) / 60) : 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: SPACING.l }}>
           <Text style={{ fontSize: 60, marginBottom: SPACING.s }}>🎊</Text>
           <Text style={TYPOGRAPHY.h1}>Great Focus!</Text>
           <Text style={[TYPOGRAPHY.subtitle, { textAlign: 'center', color: COLORS.primary }]}>
             You spent {currentDuration}m on {session?.activityType || 'Focus'}.
           </Text>
        </View>

        <Card>
          <Text style={TYPOGRAPHY.label}>How do you feel after this?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FEELINGS.map(f => (
               <Button 
                key={f} 
                title={f} 
                onPress={() => setFeeling(f)}
                variant={feeling === f ? 'primary' : 'secondary'}
                style={{ width: 'auto', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8 }}
               />
            ))}
          </View>
        </Card>

        <View style={{ height: 20 }} />
        <Button title={`Claim ${Math.max(10, currentDuration * 5)} XP & Finish`} onPress={handleSave} />
      </ScrollView>
    </ScreenContainer>
  );
};
