import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSession'>;

export const ActiveSessionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [activity, setActivity] = useState<string>('Focus');
  const [missing, setMissing] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(true); // Default to true for auto-start
  const audioTrack = (route.params as any)?.audioTrack;
  
  // expo-audio player
  // Hook must be unconditional. Use empty string if no track, handle validation inside logic.
  const player = useAudioPlayer(audioTrack?.url ?? '');

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Background Audio Logic
  useEffect(() => {
    const playAudio = async () => {
        if (audioTrack && player) {
            try {
                // expo-audio handles session configuration automatically or defaults are sufficient for now.
                // Note: Background audio capability depends on app.json permissions and expo-audio's internal handling.
                
                // Configure Player
                player.loop = true;
                player.play();
                setIsPlaying(true);
            } catch(e) { console.log("Error playing active audio", e); }
        }
    };
    playAudio();

    return () => {
        if (player) {
            try {
                player.pause();
            } catch (e) {
                // Player might be already released by the hook
            }
        }
    };
  }, [audioTrack, player]); 

  const togglePlayback = () => {
    if (!player || !audioTrack) return;
    if (player.playing) {
        player.pause();
        setIsPlaying(false);
    } else {
        player.play();
        setIsPlaying(true);
    }
  };

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
        if (session.activityType) setActivity(session.activityType);
      } else {
        const fallback = await storage.getActiveSession?.();
        if (!isActive) return;
        if (fallback) {
          if (String(sessionId) !== fallback.id) {
            navigation.replace('ActiveSession', { sessionId: fallback.id } as any);
          }
          setStartTime(fallback.startTime);
          if (fallback.activityType) setActivity(fallback.activityType);
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
            Focus Session
          </Text>
          <Text style={[TYPOGRAPHY.statValue, { fontSize: 80, color: COLORS.primary, lineHeight: 84 }]}>
            {formatTime(duration)}
          </Text>
           <Text style={[TYPOGRAPHY.subtitle, { color: COLORS.textSecondary, marginTop: 4 }]}>{activity}</Text>
      </View>

      {/* Center Section: Visuals (Album Art or Pulse) */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {/* Pulse Background */}
          <Animated.View style={{
              position: 'absolute',
              width: 320, height: 320, borderRadius: 160,
              backgroundColor: COLORS.surfaceHighlight,
              opacity: 0.15,
              transform: [{ scale: pulseAnim }]
          }} />

          {audioTrack ? (
             <View style={{ alignItems: 'center' }}>
                <Image 
                    source={{ uri: audioTrack.artwork }} 
                    style={{ 
                        width: 240, height: 240, borderRadius: 20, 
                    }} 
                />
                <View style={{ marginTop: SPACING.l, alignItems: 'center' }}>
                    <Text style={[TYPOGRAPHY.h2, { textAlign: 'center' }]}>{audioTrack.title}</Text>
                    <Text style={[TYPOGRAPHY.body, { color: COLORS.textSecondary }]}>{audioTrack.artist}</Text>
                </View>
                
                {/* Player Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.m, gap: 20 }}>
                     <Button 
                        title={isPlaying ? "PAUSE" : "PLAY"} 
                        onPress={togglePlayback}
                        variant={isPlaying ? "secondary" : "default"}
                        style={{ width: 120 }}
                     />
                </View>
             </View>
          ) : (
             <Animated.View style={{
                width: 240, height: 240, borderRadius: 120,
                backgroundColor: COLORS.surfaceHighlight,
                opacity: 0.1,
                alignItems: 'center', justifyContent: 'center',
                transform: [{ scale: Animated.multiply(pulseAnim, 0.95) }]
             }}>
                <Text style={{ fontSize: 40 }}>🧘</Text>
             </Animated.View>
          )}
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
