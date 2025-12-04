import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Audio, AVPlaybackStatusSuccess, AVPlaybackStatus } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ScreenContainer, Button, Card } from '../components/UiComponents';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Audio'>;

const TRACKS = [
  {
    id: 'focus',
    title: 'Deep Focus',
    artist: 'Motivation Lab',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'calm',
    title: 'Calm Reset',
    artist: 'Headspace Free',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artwork: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'energy',
    title: 'Energy Lift',
    artist: 'Momentum',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    artwork: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?auto=format&fit=crop&w=400&q=80',
  },
];

export const AudioScreen: React.FC<Props> = ({ navigation }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const statusSubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
      statusSubRef.current?.();
    };
  }, [sound]);

  const playTrack = async (id: string, url: string) => {
    try {
      if (currentId === id && sound) {
        const status = (await sound.getStatusAsync()) as AVPlaybackStatus;
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
          return;
        }
        if (status.isLoaded && !status.isPlaying) {
          await sound.playAsync();
          setIsPlaying(true);
          return;
        }
      }

      // New track
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      if (statusSubRef.current) statusSubRef.current();
      const sub = newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        const s = status as AVPlaybackStatusSuccess;
        setPosition(s.positionMillis);
        setDuration(s.durationMillis ?? 0);
        setIsPlaying(s.isPlaying);
      });
      statusSubRef.current = () => newSound.setOnPlaybackStatusUpdate(null);
      setSound(newSound);
      setCurrentId(id);
      setIsPlaying(true);
    } catch (e) {
      console.warn('Audio playback failed', e);
      setIsPlaying(false);
      setCurrentId(null);
      setPosition(0);
      setDuration(0);
    }
  };

  const progressPct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  const fmt = (millis: number) => {
    const totalSec = Math.max(0, Math.floor(millis / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nowPlaying = TRACKS.find(t => t.id === currentId);

  return (
    <ScreenContainer>
      <Text style={[TYPOGRAPHY.h1, { marginBottom: SPACING.s }]}>Audio boosts</Text>
      <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.l }}>
        Free motivational and focus-friendly tracks. Tap to play/pause.
      </Text>

      {nowPlaying && (
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0B1224', borderWidth: 0 }}>
          <Image source={{ uri: nowPlaying.artwork }} style={{ width: 64, height: 64, borderRadius: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#E5E7EB', fontSize: 16, fontWeight: '700' }}>{nowPlaying.title}</Text>
            <Text style={{ color: '#CBD5F5' }}>{nowPlaying.artist}</Text>
            <View style={{ marginTop: 8 }}>
              <View style={{ width: '100%', height: 6, backgroundColor: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#22D3EE' }} />
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                {fmt(position)} / {fmt(duration)}
              </Text>
            </View>
          </View>
          <Button
            title={isPlaying ? 'Pause' : 'Play'}
            onPress={() => playTrack(nowPlaying.id, nowPlaying.url)}
            style={{ width: 100, marginBottom: 0 }}
          />
        </Card>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {TRACKS.map(track => {
          const active = currentId === track.id && isPlaying;
          const isCurrent = currentId === track.id;
          return (
            <Card key={track.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image source={{ uri: track.artwork }} style={{ width: 72, height: 72, borderRadius: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.textPrimary }}>{track.title}</Text>
                <Text style={{ color: COLORS.textSecondary }}>{track.artist}</Text>
                {isCurrent && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ width: '100%', height: 6, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: COLORS.primary }} />
                    </View>
                    <Text style={{ color: COLORS.textTertiary, fontSize: 12, marginTop: 4 }}>
                      {fmt(position)} / {fmt(duration)}
                    </Text>
                  </View>
                )}
              </View>
              <Button
                title={active ? 'Pause' : isCurrent ? 'Resume' : 'Play'}
                onPress={() => playTrack(track.id, track.url)}
                style={{ width: 100, marginBottom: 0 }}
              />
            </Card>
          );
        })}
      </ScrollView>

      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
};
