import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Button, Card, CardContent, CardHeader, CardTitle, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent, UserStats } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1 });
  const [sessions, setSessions] = useState<SessionEvent[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, sess, str] = await Promise.all([
        storage.getUserStats(),
        storage.getSessions(),
        storage.getStreak()
      ]);
      setStats(s);
      setSessions(sess.filter(s => s.isComplete));
      setStreak(str);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenContainer>
    );
  }

  // Calculate XP Progress
  const currentLevelXP = 100 * Math.pow(stats.level - 1, 2);
  const nextLevelXP = 100 * Math.pow(stats.level, 2);
  const xpInCurrentLevel = stats.xp - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

  // Weekly Stats (last 7 days bar chart logic)
  const getWeeklyData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
      const dayStr = d.toDateString();
      
      const dayMinutes = sessions
        .filter(s => new Date(s.startTime).toDateString() === dayStr)
        .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
      
      data.push({ label: dayLabel, value: dayMinutes });
    }
    return data;
  };

  const weeklyData = getWeeklyData();
  const maxMins = Math.max(...weeklyData.map(d => d.value), 60);

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.l }}>
          <Button 
            title="←" 
            variant="ghost" 
            onPress={() => navigation.goBack()} 
            style={{ width: 44, height: 44, paddingHorizontal: 0, paddingVertical: 0, marginBottom: 0, marginRight: 8, justifyContent: 'center', alignItems: 'center' }} 
          />
          <Text style={[TYPOGRAPHY.h1]}>My Progress</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
        
        {/* Level Card */}
        <Card style={{ backgroundColor: COLORS.primary, borderWidth: 0, marginBottom: SPACING.m }}>
            <View style={{ alignItems: 'center', paddingVertical: SPACING.m }}>
                <View style={{ 
                    width: 80, height: 80, borderRadius: 40, 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: SPACING.s
                }}>
                    <Text style={{ fontSize: 40 }}>🏆</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Level {stats.level}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{stats.xp} Total XP</Text>
            </View>
            
            <View style={{ paddingHorizontal: SPACING.m, paddingBottom: SPACING.m }}>
                <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                    <View style={{ width: `${progress}%`, height: '100%', backgroundColor: 'white' }} />
                </View>
                <Text style={{ color: 'white', fontSize: 11, textAlign: 'center' }}>
                    {Math.round(xpNeededForNext - xpInCurrentLevel)} XP to Level {stats.level + 1}
                </Text>
            </View>
        </Card>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: SPACING.m, marginBottom: SPACING.m }}>
            <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>STREAK</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.accent }}>{streak}d</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>SESSIONS</Text>
                <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.primary }}>{sessions.length}</Text>
            </Card>
        </View>

        {/* Weekly Activity Chart */}
        <Card>
            <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 10 }}>
                    {weeklyData.map((d, i) => (
                        <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                            <View style={{ 
                                width: 12, 
                                height: `${(d.value / maxMins) * 100}%`, 
                                backgroundColor: d.value > 0 ? COLORS.primary : COLORS.surfaceHighlight,
                                borderRadius: 6,
                                marginBottom: 8
                            }} />
                            <Text style={{ fontSize: 10, color: COLORS.textTertiary }}>{d.label}</Text>
                        </View>
                    ))}
                </View>
            </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card style={{ marginTop: SPACING.m }}>
            <CardHeader>
                <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: SPACING.s }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: stats.level >= 1 ? 1 : 0.3 }}>
                    <Text style={{ fontSize: 24 }}>🌱</Text>
                    <View>
                        <Text style={[TYPOGRAPHY.body, { fontWeight: '700' }]}>Early Bloomer</Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Reached Level 1</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: streak >= 3 ? 1 : 0.3 }}>
                    <Text style={{ fontSize: 24 }}>🔥</Text>
                    <View>
                        <Text style={[TYPOGRAPHY.body, { fontWeight: '700' }]}>Consistency King</Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Maintain a 3-day streak</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: stats.level >= 5 ? 1 : 0.3 }}>
                    <Text style={{ fontSize: 24 }}>⛰️</Text>
                    <View>
                        <Text style={[TYPOGRAPHY.body, { fontWeight: '700' }]}>Mountain Mover</Text>
                        <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Reached Level 5</Text>
                    </View>
                </View>
            </CardContent>
        </Card>

      </ScrollView>
    </ScreenContainer>
  );
};
