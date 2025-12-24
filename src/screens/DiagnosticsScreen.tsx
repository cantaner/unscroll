import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Card, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

type CheckResult = {
    name: string;
    status: 'pending' | 'pass' | 'fail';
    message?: string;
};

export const DiagnosticsScreen = ({ navigation }: any) => {
    const [results, setResults] = useState<CheckResult[]>([
        { name: 'Storage Write', status: 'pending' },
        { name: 'Storage Read', status: 'pending' },
        { name: 'Audio System', status: 'pending' },
        { name: 'Network Audio Reachability', status: 'pending' },
    ]);

    const updateResult = (name: string, status: 'pass' | 'fail', message?: string) => {
        setResults(prev => prev.map(r => r.name === name ? { ...r, status, message } : r));
    };

    const runDiagnostics = async () => {
        // 1. Storage Write
        try {
            await storage.saveSession({ id: 'test_diag', startTime: 0, isComplete: true, appId: 'diag' } as any);
            updateResult('Storage Write', 'pass');
        } catch (e) {
            updateResult('Storage Write', 'fail', String(e));
        }

        // 2. Storage Read
        try {
            const sessions = await storage.getSessions();
            if (Array.isArray(sessions)) updateResult('Storage Read', 'pass', `Found ${sessions.length} sessions`);
            else throw new Error("Not an array");
        } catch (e) {
            updateResult('Storage Read', 'fail', String(e));
        }

        // 3. Audio System
        try {
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
            updateResult('Audio System', 'pass');
        } catch (e) {
            updateResult('Audio System', 'fail', String(e));
        }

        // 4. Network Audio (Head Check)
        try {
            // Check a known track
            const testUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            const response = await fetch(testUrl, { method: 'HEAD' });
            if (response.ok) updateResult('Network Audio Reachability', 'pass', `Status ${response.status}`);
            else updateResult('Network Audio Reachability', 'fail', `Status ${response.status}`);
        } catch (e) {
            updateResult('Network Audio Reachability', 'fail', String(e));
        }
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <ScreenContainer>
            <Text style={[TYPOGRAPHY.h1, { marginBottom: SPACING.l }]}>System Diagnostics</Text>
            
            <ScrollView>
                {results.map((r, i) => (
                    <Card key={i} style={{ marginBottom: SPACING.m, borderLeftWidth: 4, borderLeftColor: r.status === 'pass' ? COLORS.success : r.status === 'fail' ? COLORS.error : COLORS.textTertiary }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={TYPOGRAPHY.h3}>{r.name}</Text>
                            <Text style={{ 
                                fontWeight: 'bold', 
                                color: r.status === 'pass' ? COLORS.success : r.status === 'fail' ? COLORS.error : COLORS.textSecondary 
                            }}>
                                {r.status.toUpperCase()}
                            </Text>
                        </View>
                        {r.message && <Text style={[TYPOGRAPHY.body, { marginTop: SPACING.s, fontSize: 12 }]}>{r.message}</Text>}
                    </Card>
                ))}
            </ScrollView>

            <Button title="Rerun Checks" onPress={runDiagnostics} variant="secondary" />
            <View style={{ height: SPACING.m }} />
            <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
        </ScreenContainer>
    );
};
