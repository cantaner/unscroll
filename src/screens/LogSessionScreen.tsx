import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, WeeklyPlan, SessionEvent } from '../types';
import { ScreenContainer, Button, SelectionItem, Card } from '../components/UiComponents';
import { TYPOGRAPHY, SPACING, COLORS } from '../theme';
import { storage } from '../storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LogSession'>;

const REASONS = ['Boredom', 'Habit', 'Stress', 'Work Break', 'In Bed', 'Anxiety', 'Connection', 'Other'];
const APP_ICONS: Record<string, string> = {
  instagram: '📸',
  tiktok: '🎵',
  youtube: '▶️',
  reddit: '👽',
  x: '✖️',
};

export const LogSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [session, setSession] = useState<SessionEvent | null>(null);
  const [appId, setAppId] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [sessionMissing, setSessionMissing] = useState(false);
  const [otherReason, setOtherReason] = useState('');
  const defaultPlan: WeeklyPlan = {
    apps: [],
    goal: 'balance',
    dailyLimitMinutes: 45,
    nightBoundary: '22:00',
  };

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      try {
        const [p, s] = await Promise.all([
          storage.getPlan?.(),
          storage.getSessionById?.(sessionId),
        ]);
        if (!isActive) return;

        const planToUse = p ?? defaultPlan;
        setPlan(planToUse);
        setAppId(planToUse.apps[0] || '');
        if (s) {
          setSession(s);
        } else {
          const fallback = await storage.getActiveSession?.();
          if (fallback) {
            if (String(sessionId) !== fallback.id) {
              navigation.replace('LogSession', { sessionId: fallback.id } as any);
            }
            setSession(fallback);
            setSessionMissing(false);
          } else {
            setSessionMissing(true);
          }
        }
      } catch (e) {
        console.error('Failed to load log session data', e);
        if (isActive) {
          setPlan(defaultPlan);
          setSessionMissing(true);
        }
      }
    };
    load();
    return () => {
      isActive = false;
    };
  }, [sessionId]);

  const handleSave = async () => {
    if (!session) return;
    const endTime = Date.now();
    const durationMinutes = Math.ceil(((endTime - session.startTime) / 1000) / 60);
    const effectiveReason = reason === 'Other' ? (otherReason.trim() || 'Other') : reason;
    
    const updated: SessionEvent = {
      ...session,
      endTime,
      durationMinutes,
      appId,
      reason: effectiveReason,
      isComplete: true
    };
    await storage.saveSession(updated);
    await storage.setActiveSessionId?.(null);
    navigation.popToTop(); // Go back to Dashboard
  };

  if (!plan) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (sessionMissing && !session) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[TYPOGRAPHY.body, { textAlign: 'center', marginBottom: SPACING.m }]}>
          We couldn't find this session. You can head back or start a new one.
        </Text>
        <Button title="Back to Dashboard" onPress={() => navigation.popToTop()} />
        <View style={{ height: SPACING.m }} />
        <Button title="Start New Session" onPress={() => navigation.replace('Pause')} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView>
        <Text style={TYPOGRAPHY.h1}>Session Complete</Text>
        <Text style={TYPOGRAPHY.subtitle}>Take a second to categorize this time.</Text>
        <Text style={[TYPOGRAPHY.body, { marginTop: SPACING.s, marginBottom: SPACING.m, color: COLORS.textSecondary }]}>
          Choose the app and the reason. This helps Unscroll surface better insights.
        </Text>

        <Card>
          <Text style={TYPOGRAPHY.label}>Which app?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {plan.apps.map(id => (
               <Button 
                key={id} 
                title={id.toUpperCase()} 
                onPress={() => setAppId(id)}
                variant={appId === id ? 'primary' : 'secondary'}
                icon={APP_ICONS[id] || '⌛'}
                style={{ minWidth: '46%', paddingVertical: 12, marginBottom: 8, flexGrow: 1 }}
               />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={TYPOGRAPHY.label}>What drove this?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {REASONS.map(r => (
               <Button 
                key={r} 
                title={r} 
                onPress={() => setReason(r)}
                variant={reason === r ? 'primary' : 'secondary'}
                style={{ width: 'auto', paddingVertical: 10, paddingHorizontal: 16, marginBottom: 8 }}
               />
            ))}
          </View>
          {reason === 'Other' && (
            <TextInput
              value={otherReason}
              onChangeText={setOtherReason}
              placeholder="Add your reason"
              placeholderTextColor={COLORS.textTertiary}
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginTop: 8 }}
            />
          )}
        </Card>

        <View style={{ height: 20 }} />
        <Button title="Save Entry" onPress={handleSave} />
      </ScrollView>
    </ScreenContainer>
  );
};
