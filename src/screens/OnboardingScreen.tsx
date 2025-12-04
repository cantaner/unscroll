
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, WeeklyPlan } from '../types';
import { ScreenContainer, Button, SelectionItem, Card, FadeInView, AppLogo } from '../components/UiComponents';
import { TYPOGRAPHY, SPACING, COLORS } from '../theme';
import { storage } from '../storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const APPS_LIST = [
  { id: 'instagram', name: 'Instagram', cat: 'Social' },
  { id: 'tiktok', name: 'TikTok', cat: 'Social' },
  { id: 'x', name: 'X / Twitter', cat: 'News' },
  { id: 'youtube', name: 'YouTube', cat: 'Video' },
  { id: 'reddit', name: 'Reddit', cat: 'News' },
];

const GOALS = [
  { id: 'sleep', label: 'Better sleep', sub: 'Wake up rested', img: 'https://images.unsplash.com/photo-1541781777629-1229a1a63cab?auto=format&fit=crop&q=80&w=300' },
  { id: 'focus', label: 'Deep focus', sub: 'Reclaim attention', img: 'https://images.unsplash.com/photo-1499750310159-5418f31b1936?auto=format&fit=crop&q=80&w=300' },
  { id: 'calm', label: 'Calmness', sub: 'Reduce anxiety', img: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&q=80&w=300' },
  { id: 'family', label: 'Presence', sub: 'Be with others', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=300' },
  { id: 'balance', label: 'Balance', sub: 'Healthy limits', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300' },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [customApp, setCustomApp] = useState('');
  const [goal, setGoal] = useState('');
  
  // Daily Limit
  const [limit, setLimit] = useState<string>('');
  const [limitOptions, setLimitOptions] = useState<number[]>([]);
  const [isCustomLimit, setIsCustomLimit] = useState(false);

  // Night Boundary
  const [targetBedtime, setTargetBedtime] = useState('23:00');
  const [boundary, setBoundary] = useState<string>('');
  const [boundaryOptions, setBoundaryOptions] = useState<string[]>([]);
  const [isCustomBoundary, setIsCustomBoundary] = useState(false);

  // --- LOGIC: Calculate Limits ---
  useEffect(() => {
    if (step === 3) {
      // 1. Daily Limit Calculation
      let baseMinutes = 30;
      if (['sleep', 'family', 'focus'].includes(goal)) baseMinutes = 20;
      else if (goal === 'balance') baseMinutes = 45;
      
      const volumeAdjustment = Math.max(0, (selectedApps.length - 1) * 5);
      const mid = baseMinutes + volumeAdjustment;
      const low = Math.max(15, mid - 15);
      const high = mid + 30;
      
      const round5 = (n: number) => Math.ceil(n / 5) * 5;
      setLimitOptions([round5(low), round5(mid), round5(high)]);
      setLimit(round5(mid).toString());

      // 2. Night Boundary Calculation based on Bedtime
      calculateBoundaries(targetBedtime);
    }
  }, [step, goal, selectedApps.length]);

  const calculateBoundaries = (bedTime: string) => {
    const [h, m] = bedTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);

    const format = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    // Option 1: Strict (90 mins before) - Science: Cognitive Detachment
    const strict = new Date(date.getTime() - 90 * 60000);
    // Option 2: Recommended (60 mins before) - Science: Melatonin Ramp Up
    const rec = new Date(date.getTime() - 60 * 60000);
    // Option 3: Relaxed (30 mins before) - Science: Wind Down
    const relaxed = new Date(date.getTime() - 30 * 60000);

    setBoundaryOptions([format(strict), format(rec), format(relaxed)]);
    setBoundary(format(rec));
  };

  const toggleApp = (id: string) => {
    if (selectedApps.includes(id)) setSelectedApps(prev => prev.filter(a => a !== id));
    else setSelectedApps([...selectedApps, id]);
  };

  const addCustomApp = () => {
    const trimmed = customApp.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();
    if (selectedApps.includes(normalized)) {
      setCustomApp('');
      return;
    }
    setSelectedApps(prev => [...prev, normalized]);
    setCustomApp('');
  };

  const finish = async () => {
    const plan: WeeklyPlan = {
      apps: selectedApps,
      goal,
      dailyLimitMinutes: parseInt(limit) || 45,
      nightBoundary: boundary,
      bedtime: targetBedtime
    };
    await storage.savePlan(plan);
    navigation.navigate('SignUp');
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l }}>
          <AppLogo size={32} />
          <Text style={{ color: COLORS.textTertiary, fontWeight: '600' }}>Step {step} of 3</Text>
      </View>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* STEP 1: APPS */}
        {step === 1 && (
          <FadeInView>
            <Text style={TYPOGRAPHY.h1}>Which apps pull your attention?</Text>
            <Text style={TYPOGRAPHY.subtitle}>Select your high-friction environments, or add your own.</Text>
            
            <View style={{ marginBottom: SPACING.xl }}>
              {APPS_LIST.map(app => (
                <SelectionItem
                  key={app.id}
                  label={app.name}
                  subLabel={app.cat}
                  selected={selectedApps.includes(app.id)}
                  onPress={() => toggleApp(app.id)}
                />
              ))}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: SPACING.s }}>
                <TextInput
                  value={customApp}
                  onChangeText={setCustomApp}
                  placeholder="Add your own (e.g., discord)"
                  placeholderTextColor={COLORS.textTertiary}
                  style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, backgroundColor: '#FFF' }}
                  autoCapitalize="none"
                />
                <Button title="Add" variant="secondary" onPress={addCustomApp} style={{ width: 80, marginBottom: 0 }} />
              </View>
            </View>
            <Button title="Continue" disabled={selectedApps.length === 0} onPress={() => setStep(2)} />
          </FadeInView>
        )}

        {/* STEP 2: GOAL */}
        {step === 2 && (
          <FadeInView>
            <Text style={TYPOGRAPHY.h1}>What is your core intention?</Text>
            <Text style={TYPOGRAPHY.subtitle}>We'll adapt the reflection engine to this goal.</Text>
            <View style={{ marginBottom: SPACING.xl }}>
              {GOALS.map(g => (
                <SelectionItem
                  key={g.id}
                  label={g.label}
                  subLabel={g.sub}
                  selected={goal === g.id}
                  onPress={() => setGoal(g.id)}
                  image={g.img} // In a real app this would load the image
                />
              ))}
            </View>
            <Button title="Build Plan" disabled={!goal} onPress={() => setStep(3)} />
          </FadeInView>
        )}

        {/* STEP 3: PLAN */}
        {step === 3 && (
          <FadeInView>
            <Text style={TYPOGRAPHY.h1}>Your Rebalancing Plan</Text>
            <Text style={TYPOGRAPHY.subtitle}>Based on behavioral science, here is a suggested structure.</Text>

            {/* Daily Limit Section */}
            <Card>
              <Text style={TYPOGRAPHY.label}>Daily Limit</Text>
              <Text style={[TYPOGRAPHY.body, { marginBottom: 16, fontSize: 14 }]}>
                Studies suggest limiting high-dopamine inputs to specific windows prevents "attention fragmentation".
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                {limitOptions.map((opt, i) => {
                    const isSel = !isCustomLimit && limit === opt.toString();
                    const labels = ["Strict", "Balanced", "Relaxed"];
                    return (
                        <TouchableOpacity key={i} onPress={() => { setLimit(opt.toString()); setIsCustomLimit(false); }}
                            style={{ 
                                width: '31%', padding: 8, borderRadius: 12, borderWidth: 1, 
                                borderColor: isSel ? COLORS.primary : COLORS.border,
                                backgroundColor: isSel ? COLORS.primary : '#FFF', alignItems: 'center'
                            }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: isSel ? '#FFF' : COLORS.textPrimary }}>{opt}m</Text>
                            <Text style={{ fontSize: 11, color: isSel ? '#D6D3D1' : COLORS.textSecondary }}>{labels[i]}</Text>
                        </TouchableOpacity>
                    );
                })}
              </View>
            </Card>

            {/* Night Boundary Section */}
            <Card>
              <Text style={TYPOGRAPHY.label}>Night Boundary</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ marginRight: 8, color: COLORS.textSecondary }}>I usually sleep at</Text>
                  <TextInput 
                    value={targetBedtime} 
                    onChangeText={(t) => { setTargetBedtime(t); if(t.length===5) calculateBoundaries(t); }} 
                    style={{ borderBottomWidth: 1, fontWeight: '600', fontSize: 18, textAlign: 'center', width: 60 }} 
                  />
              </View>

              <Text style={[TYPOGRAPHY.body, { marginBottom: 16, fontSize: 14 }]}>
                 Blue light suppresses melatonin. Select a detachment window:
              </Text>

              <View style={{ gap: 8 }}>
                {[
                    { val: boundaryOptions[0], label: "Cognitive Detachment", desc: "90m before bed. Optimal for deep sleep." },
                    { val: boundaryOptions[1], label: "Melatonin Ramp-up", desc: "60m before bed. Recommended." },
                    { val: boundaryOptions[2], label: "Wind Down", desc: "30m before bed. Good start." },
                ].map((opt, i) => {
                    const isSel = boundary === opt.val;
                    return (
                        <TouchableOpacity key={i} onPress={() => setBoundary(opt.val)}
                            style={{ 
                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                padding: 12, borderRadius: 12, borderWidth: 1,
                                borderColor: isSel ? COLORS.primary : COLORS.border,
                                backgroundColor: isSel ? '#F5F5F4' : '#FFF'
                            }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary }}>{opt.val}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>{opt.label}</Text>
                            </View>
                            <View style={{ width: 140 }}>
                                <Text style={{ fontSize: 11, color: COLORS.textTertiary, textAlign: 'right' }}>{opt.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
              </View>
            </Card>

            <View style={{ height: 20 }} />
            <Button title="Finalize Plan" onPress={finish} disabled={!limit} />
          </FadeInView>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};
