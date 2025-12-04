import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppLogo, Button, Card, FadeInView, ScreenContainer } from '../components/UiComponents';
import { getRandomQuote } from '../quotes';
import { storage } from '../storage';
import { COLORS, SPACING } from '../theme'; // Make sure to import updated theme
import { RootStackParamList, WeeklyPlan } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [todayUsage, setTodayUsage] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [weekUsage, setWeekUsage] = useState(0);
  const [perAppUsage, setPerAppUsage] = useState<Record<string, number>>({});
  const [quote, setQuote] = useState(getRandomQuote());
  const defaultPlan: WeeklyPlan = {
    apps: [],
    goal: 'balance',
    dailyLimitMinutes: 60,
    nightBoundary: '22:00',
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      // Get a new quote on each screen focus
      setQuote(getRandomQuote());
      const loadData = async () => {
        try {
          // Load data in parallel to avoid long waits; always fall back to defaults.
          const [sessions = [], storedPlan, storedStreak, activePointer] = await Promise.all([
            storage.getSessions?.() ?? [],
            storage.getPlan?.(),
            storage.getStreak?.(),
            storage.getActiveSessionId?.(),
          ]);

          if (!isActive) return;

          const planCandidate = storedPlan ?? defaultPlan;
          setPlan(planCandidate);

          const todayStr = new Date().toDateString();
          const usage = sessions
            .filter(s => new Date(s.startTime).toDateString() === todayStr && s.isComplete)
            .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
          setTodayUsage(usage);

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          const weekly = sessions
            .filter(s => {
              const d = new Date(s.startTime);
              d.setHours(0,0,0,0);
              return d >= sevenDaysAgo && s.isComplete;
            })
            .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
          setWeekUsage(weekly);
          const appUsage: Record<string, number> = {};
          sessions
            .filter(s => s.isComplete && new Date(s.startTime) >= sevenDaysAgo)
            .forEach(s => {
              const key = s.appId || 'unknown';
              appUsage[key] = (appUsage[key] || 0) + (s.durationMinutes || 0);
            });
          setPerAppUsage(appUsage);

          const activeFromPointer = sessions.find(s => s.id === activePointer && s.isComplete !== true);
          const active = activeFromPointer ?? sessions
            .filter(s => s.isComplete !== true)
            .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))[0];
          setActiveSessionId(active?.id ?? null);
          if (active?.id && !activePointer) {
            storage.setActiveSessionId?.(active.id);
          }
          if (!active) {
            storage.setActiveSessionId?.(null);
          }

          const calculatedStreak = usage <= planCandidate.dailyLimitMinutes ? 1 : 0;
          setStreak((storedStreak ?? calculatedStreak) as number);
        } catch (err) {
          console.error('Failed to load dashboard data', err);
          if (isActive) {
            setPlan(defaultPlan);
            setTodayUsage(0);
            setStreak(0);
            setActiveSessionId(null);
          }
        }
      };
      loadData();
      return () => {
        isActive = false;
      };
    }, [navigation])
  );

  if (!plan) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const remaining = Math.max(0, plan.dailyLimitMinutes - todayUsage);
  const progress = plan.dailyLimitMinutes > 0
    ? Math.min(100, (todayUsage / plan.dailyLimitMinutes) * 100)
    : (todayUsage > 0 ? 100 : 0);
  const isOverLimit = todayUsage > plan.dailyLimitMinutes;

  return (
    <ScreenContainer style={{ paddingTop: SPACING.m }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -80,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: '#22d3ee33',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 120,
          right: -100,
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: '#a855f733',
        }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
             <AppLogo size={32} />
             <View>
               <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.primary }}>Unscroll</Text>
               <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Reclaim Your Attention</Text>
             </View>
          </View>
          <Button title="Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} style={{ width: 'auto', marginBottom: 0 }} />
        </View>

        <Card style={{ paddingVertical: 28, backgroundColor: '#0F172A', borderWidth: 0, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#22d3ee22', top: -60, right: -80 }} />
          <Text style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#E5E7EB', marginBottom: 8 }}>
            Your mindful scrolling hub
          </Text>
          <View style={{ marginBottom: SPACING.s }}>
            <Text style={{ fontSize: 52, fontWeight: '300', color: '#F8FAFC' }}>
              {remaining}<Text style={{ fontSize: 18, fontWeight: '600' }}>m left</Text>
            </Text>
              <Text style={{ fontSize: 14, color: '#cbd5f5', marginTop: 4 }}>
                {isOverLimit ? 'Over your limit - take a pause' : 'Stay intentional and you are good.'}
              </Text>
          </View>

            {/* Primary action: Start/Resume Session */}
            <Button
              title={activeSessionId ? 'Resume session' : 'Start session'}
              onPress={() => activeSessionId
                ? navigation.navigate('ActiveSession', { sessionId: activeSessionId })
                : navigation.navigate('Pause')}
              style={{ marginBottom: SPACING.m, marginTop: SPACING.m }}
              icon=">"
            />

            {/* Quick tools row */}
            <View style={{ flexDirection: 'row', marginBottom: SPACING.m, gap: 10 }}>
            <Button
              title="Guided breath"
              variant="secondary"
              onPress={() => navigation.navigate('Breathe')}
              style={{ flex: 1, marginBottom: 0 }}
            />
            <Button
              title="Audio"
              variant="secondary"
              onPress={() => navigation.navigate('Audio')}
              style={{ flex: 1, marginBottom: 0 }}
            />
          </View>

          <View style={{ width: '100%', height: 10, backgroundColor: '#111827', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#1f2937' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: isOverLimit ? '#F87171' : '#22D3EE' }} />
          </View>

          <View style={{ flexDirection: 'row', marginTop: SPACING.m, gap: 12 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#111827' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Limit</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>{plan.dailyLimitMinutes}m</Text>
            </View>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#111827' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Night boundary</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>{plan.nightBoundary}</Text>
            </View>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#111827' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Goal</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>{plan.goal || 'Focus'}</Text>
            </View>
          </View>
        </Card>

        {activeSessionId && (
          <FadeInView delay={150}>
            <Card style={{ marginBottom: SPACING.l, backgroundColor: '#0B3B3C', borderWidth: 0 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 6, color: '#ECFEFF' }}>
                Session in progress
              </Text>
              <Text style={{ color: '#BAE6FD', marginBottom: SPACING.s }}>
                You started a session. Pick up where you left off or log it now.
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button
                  title="Resume"
                  onPress={() => navigation.navigate('ActiveSession', { sessionId: activeSessionId })}
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <Button
                  title="Log"
                  variant="secondary"
                  onPress={() => navigation.navigate('LogSession', { sessionId: activeSessionId })}
                  style={{ flex: 1, marginBottom: 0 }}
                />
              </View>
            </Card>
          </FadeInView>
        )}

        {/* Streak & Info Row */}
        <View style={{ flexDirection: 'row', gap: SPACING.m }}>
            <Card style={{ flex: 1, paddingVertical: 20 }}>
                <Text style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: COLORS.textSecondary }}>Streak</Text>
                <Text style={{ fontSize: 34, fontWeight: '800', color: COLORS.accent, marginTop: 4 }}>{streak}d</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>Kept under limit</Text>
            </Card>
            <Card style={{ flex: 1, paddingVertical: 20 }}>
                <Text style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: COLORS.textSecondary }}>Today</Text>
                <Text style={{ fontSize: 34, fontWeight: '800', color: COLORS.primary, marginTop: 4 }}>{Math.floor(todayUsage/60)}h {todayUsage%60}m</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>Tracked time</Text>
            </Card>
        </View>

        <FadeInView delay={200}>
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 }}>Plan overview</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.m }}>
              Intentional apps: {plan.apps?.length ? plan.apps.join(', ') : 'None selected'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Daily limit</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textPrimary }}>{plan.dailyLimitMinutes} minutes</Text>
              </View>
              <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Boundary</Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textPrimary }}>{plan.nightBoundary}</Text>
              </View>
            </View>
          </Card>
        </FadeInView>

        <FadeInView delay={250}>
          <Card style={{ backgroundColor: '#111827', borderWidth: 0 }}>
            <Text style={{ color: '#E5E7EB', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>This week</Text>
            <Text style={{ color: '#9CA3AF', marginBottom: 12 }}>Past 7 days of tracked time</Text>
            <Text style={{ color: '#F8FAFC', fontSize: 34, fontWeight: '800' }}>{Math.floor(weekUsage/60)}h {weekUsage%60}m</Text>
            <View style={{ width: '100%', height: 8, backgroundColor: '#1f2937', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(100, (weekUsage / (plan.dailyLimitMinutes * 7 || 1)) * 100)}%`, height: '100%', backgroundColor: '#22D3EE' }} />
            </View>
            {Object.keys(perAppUsage).length > 0 && (
              <View style={{ marginTop: SPACING.m, gap: 8 }}>
                {Object.entries(perAppUsage).map(([app, minutes]) => {
                  const pct = Math.min(100, (minutes / (plan.dailyLimitMinutes * 7 || 1)) * 100);
                  return (
                    <View key={app} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#E5E7EB', width: 80, textTransform: 'capitalize' }}>{app}</Text>
                      <View style={{ flex: 1, height: 8, backgroundColor: '#1f2937', borderRadius: 6, overflow: 'hidden' }}>
                        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#22D3EE' }} />
                      </View>
                      <Text style={{ color: '#9CA3AF', width: 60, textAlign: 'right' }}>{Math.round(minutes)}m</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>
        </FadeInView>

        <FadeInView delay={300}>
          <Card>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 }}>Audio boosts</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.m }}>
              Motivation and focus-friendly tracks. Curated free sources.
            </Text>
            <Button
              title="Open audio"
              onPress={() => navigation.navigate('Audio')}
              style={{ marginBottom: 0 }}
            />
          </Card>
        </FadeInView>

        <FadeInView delay={350}>
          <Card style={{ backgroundColor: COLORS.surface }}>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Quote of the day
            </Text>
            <Text style={{ fontSize: 18, fontStyle: 'italic', fontWeight: '500', color: COLORS.textPrimary, marginBottom: 8, lineHeight: 26 }}>
              "{quote.text}"
            </Text>
            <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>— {quote.author}</Text>
          </Card>
        </FadeInView>

      </ScrollView>
    </ScreenContainer>
  );
};
