import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppLogo, Button, Card, FadeInView, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING } from '../theme';
import { RootStackParamList, UserStats, WeeklyPlan } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, level: 1 });
  const [todayUsage, setTodayUsage] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [weekUsage, setWeekUsage] = useState(0);
  const [perAppUsage, setPerAppUsage] = useState<Record<string, number>>({});
  const [focusQuality, setFocusQuality] = useState(100);
  
  const defaultPlan: WeeklyPlan = {
    apps: [],
    goal: 'balance',
    dailyLimitMinutes: 60,
    nightBoundary: '22:00',
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadData = async () => {
        try {
          // Load data in parallel, including negative usage
          const [sessions = [], storedPlan, storedStreak, activePointer, stats, negativeUsage = []] = await Promise.all([
            storage.getSessions?.() ?? [],
            storage.getPlan?.(),
            storage.getStreak?.(),
            storage.getActiveSessionId?.(),
            storage.getUserStats(),
            storage.getAppUsage?.() ?? [] // Unified: Negative
          ]);

          if (!isActive) return;

          const planCandidate = storedPlan ?? defaultPlan;
          setPlan(planCandidate);
          setUserStats(stats);

          // Focus Quality Calculation
          const totalSessions = sessions.length;
          const completedSessions = sessions.filter(s => s.isComplete).length;
          setFocusQuality(totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100);

          const todayStr = new Date().toDateString();
          // Calculate Today Usage (Positive)
          const positiveToday = sessions
            .filter(s => new Date(s.startTime).toDateString() === todayStr && s.isComplete)
            .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
          
          setTodayUsage(positiveToday); 

          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          
          // Weekly Stats (Positive)
          const weeklyPositive = sessions
            .filter(s => {
              const d = new Date(s.startTime);
              d.setHours(0,0,0,0);
              return d >= sevenDaysAgo && s.isComplete;
            })
            .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

          setWeekUsage(weeklyPositive);
          
          const appUsage: Record<string, number> = {};
          
          // Positive apps
          sessions
            .filter(s => s.isComplete && new Date(s.startTime) >= sevenDaysAgo)
            .forEach(s => {
              const key = s.activityType || s.appId || 'Focus';
              appUsage[key] = (appUsage[key] || 0) + (s.durationMinutes || 0);
            });
            
          // Negative apps (mark with prefix for UI)
          negativeUsage
             .filter((u: any) => new Date(u.timestamp) >= sevenDaysAgo)
             .forEach((u: any) => {
                 const key = `(Scrolled) ${u.appId}`; 
                 appUsage[key] = (appUsage[key] || 0) + (u.durationMinutes || 0);
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

          // Streak Logic
          const calculatedStreak = positiveToday >= (planCandidate.dailyLimitMinutes || 15) ? 1 : 0;
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

  const targetMinutes = plan.dailyLimitMinutes;
  const remainingToGoal = Math.max(0, targetMinutes - todayUsage);
  const progress = targetMinutes > 0
    ? Math.min(100, (todayUsage / targetMinutes) * 100)
    : 100;
  const isGoalMet = todayUsage >= targetMinutes;

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
           <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Slip Up" variant="secondary" onPress={async () => {
                await storage.logAppUsage?.({ appId: 'Instagram', durationMinutes: 5, timestamp: Date.now() });
                navigation.replace('Dashboard' as any);
            }} style={{ width: 'auto', marginBottom: 0, paddingVertical: 4, height: 32 }} />
            <Button title="Settings" variant="ghost" onPress={() => navigation.navigate('Settings')} style={{ width: 'auto', marginBottom: 0 }} />
          </View>
        </View>

        <Card style={{ marginBottom: SPACING.m, paddingVertical: 16, backgroundColor: '#1E293B', borderWidth: 0 }}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
             <View>
                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>Current Status</Text>
                <Text style={{ color: '#FCD34D', fontSize: 24, fontWeight: '800' }}>Level {userStats.level}</Text>
             </View>
             <View style={{ backgroundColor: '#FCD34D22', padding: 8, borderRadius: 20 }}>
                <Text style={{ fontSize: 24 }}>🌱</Text>
             </View>
           </View>
           
           <View style={{ height: 12, backgroundColor: '#334155', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              <View style={{ 
                width: `${Math.min(100, Math.max(0, ((userStats.xp - (100 * Math.pow(userStats.level - 1, 2))) / ((100 * Math.pow(userStats.level, 2)) - (100 * Math.pow(userStats.level - 1, 2))) * 100)))}%`, 
                height: '100%', 
                backgroundColor: '#FCD34D' 
              }} />
           </View>
           <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'right' }}>
             {Math.floor(userStats.xp)} / {100 * Math.pow(userStats.level, 2)} XP to next level
           </Text>
        </Card>

        <Card style={{ paddingVertical: 28, backgroundColor: '#0F172A', borderWidth: 0, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#22d3ee22', top: -60, right: -80 }} />
          <Text style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: '#E5E7EB', marginBottom: 8 }}>
            Daily Focus Goal
          </Text>
          <View style={{ marginBottom: SPACING.s }}>
            <Text style={{ fontSize: 52, fontWeight: '300', color: '#F8FAFC' }}>
              {isGoalMet ? 'Goal Met!' : <>{remainingToGoal}<Text style={{ fontSize: 18, fontWeight: '600' }}>m to go</Text></>}
            </Text>
              <Text style={{ fontSize: 14, color: '#cbd5f5', marginTop: 4 }}>
                {isGoalMet ? 'You are crushing it today.' : 'Keep building your streak.'}
              </Text>
          </View>

            <View style={{ flexDirection: 'row', marginTop: SPACING.m, gap: 10 }}>
            <Button
              title={activeSessionId ? 'Resume session' : 'Start session'}
              onPress={() => activeSessionId
                ? navigation.navigate('ActiveSession', { sessionId: activeSessionId })
                : navigation.navigate('Pause')}
              style={{ flex: 1, marginBottom: 0 }}
              icon=">"
            />
            <Button
              title="Guided breath"
              variant="secondary"
              onPress={() => navigation.navigate('Breathe')}
              style={{ width: 150, marginBottom: 0 }}
            />
          </View>

          <View style={{ width: '100%', height: 10, backgroundColor: '#111827', borderRadius: 6, marginTop: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#1f2937' }}>
            <View style={{ width: `${progress}%`, height: '100%', backgroundColor: isGoalMet ? '#FCD34D' : '#22D3EE' }} />
          </View>

          <View style={{ flexDirection: 'row', marginTop: SPACING.m, gap: 12 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#111827' }}>
              <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Target</Text>
              <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>{targetMinutes}m</Text>
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
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>Daily Focus Goal</Text>
            </Card>
            <Card style={{ flex: 1, paddingVertical: 20 }}>
                <Text style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8, color: COLORS.textSecondary }}>Today</Text>
                <Text style={{ fontSize: 34, fontWeight: '800', color: COLORS.primary, marginTop: 4 }}>{Math.floor(todayUsage/60)}h {todayUsage%60}m</Text>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>Focus Time</Text>
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
            {/* Weekly Insights */}
            <Card style={{ backgroundColor: '#0F172A', borderWidth: 0 }}>
                <Text style={{ color: '#E5E7EB', fontSize: 16, fontWeight: '700', marginBottom: 2 }}>Weekly Insights</Text>
                <Text style={{ color: '#9CA3AF', marginBottom: SPACING.m, fontSize: 13 }}>Analysis of your tracked sessions</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.l }}>
                <View>
                    <Text style={{ color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tracked Focus</Text>
                    <Text style={{ color: '#F8FAFC', fontSize: 28, fontWeight: '700' }}>{Math.floor(weekUsage/60)}<Text style={{fontSize:16, color:'#94A3B8'}}>h</Text> {weekUsage%60}<Text style={{fontSize:16, color:'#94A3B8'}}>m</Text></Text>
                </View>

                {/* Unified Usage (Slip Ups) */}
                <View>
                    <Text style={{ color: '#EF4444', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Slip Ups</Text>
                    <Text style={{ color: '#EF4444', fontSize: 28, fontWeight: '700', textAlign: 'right' }}>
                        {
                            Object.entries(perAppUsage)
                            .filter(([k]) => k.startsWith('(Scrolled)'))
                            .reduce((acc, [, v]) => acc + v, 0)
                        }m
                    </Text>
                </View>
                </View>

                <View style={{ height: 1, backgroundColor: '#1E293B', marginBottom: SPACING.m }} />

                <Text style={{ color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Top Activity Areas</Text>
                {Object.keys(perAppUsage).length > 0 ? (
                <View style={{ gap: 12 }}>
                    {Object.entries(perAppUsage)
                    .sort(([, a], [, b]) => b - a) // Sort by usage
                    .slice(0, 4) // Top 4
                    .map(([activity, minutes]) => {
                    const total = Object.values(perAppUsage).reduce((a, b) => a + b, 0);
                    const pct = Math.min(100, (minutes / (total || 1)) * 100);
                    const displayPct = Math.round(pct);
                    const isNegative = activity.startsWith('(Scrolled)');

                    return (
                        <View key={activity} style={{}}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ color: isNegative ? '#F87171' : '#E5E7EB', textTransform: 'capitalize', fontSize: 14 }}>{activity}</Text>
                            <Text style={{ color: '#94A3B8', fontSize: 13 }}>{Math.round(minutes)}m ({displayPct}%)</Text>
                        </View>
                        <View style={{ width: '100%', height: 6, backgroundColor: '#1E293B', borderRadius: 4, overflow: 'hidden' }}>
                            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: isNegative ? '#EF4444' : COLORS.primary }} />
                        </View>
                        </View>
                    );
                    })}
                </View>
                ) : (
                    <Text style={{ color: '#64748B', fontStyle: 'italic' }}>No activity logged yet.</Text>
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
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Daily note
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>
              Attention is your most valuable currency.
            </Text>
            <Text style={{ color: COLORS.textTertiary }}>- Unscroll mantra</Text>
          </Card>
        </FadeInView>

      </ScrollView>
    </ScreenContainer>
  );
};
