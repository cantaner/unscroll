import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer } from 'expo-audio';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Card, ScreenContainer } from '../components/UiComponents';
import { storage } from '../storage';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { RootStackParamList, SessionEvent } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Audio'>;

const TRACKS = [
  {
    id: 'guided-breath',
    title: 'Using the Breath',
    artist: 'Thanissaro Bhikkhu',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    artwork: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    description: 'A classic guided session on using the breath as an anchor.'
  },
  {
    id: 'guided-metta',
    title: 'Guided Goodwill',
    artist: 'Thanissaro Bhikkhu',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    artwork: 'https://images.unsplash.com/photo-1518531933037-9a8Ebf5ec5e8?auto=format&fit=crop&w=600&q=80',
    description: 'Generate thoughts of goodwill for yourself and others.'
  },
  {
    id: 'forest-sanctuary',
    title: 'Forest Sanctuary',
    artist: 'Nature Sounds',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Satin/Kai_Engel_-_04_-_Sentinel.mp3',
    artwork: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    description: 'Peaceful ambient instrumental to reset your mind.'
  },
  {
    id: 'deep-focus',
    title: 'Deep Work Flow',
    artist: 'Focus Pulse',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Tours/Enthusiast/Tours_-_01_-_Enthusiast.mp3',
    artwork: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    description: 'Steady rhythm to keep you in the flow state.'
  },
    {
    id: 'moonlight',
    title: 'Moonlight Reprise',
    artist: 'Kai Engel',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Irsens_Tale/Kai_Engel_-_04_-_Moonlight_Reprise.mp3',
    artwork: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=600&q=80',
    description: 'Melancholic yet hopeful piano for deep thought.'
  },
  {
    id: 'basics',
    title: 'The Basics',
    artist: 'Dhamma Talk',
    url: 'https://www.dhammatalks.org/Archive/y2023/230101_The_Basics.mp3',
    artwork: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=600&q=80',
    description: 'A short talk on the fundamentals of practice.'
  },
  {
    id: 'inner-wealth',
    title: 'Inner Wealth',
    artist: 'Dhamma Talk',
    url: 'https://www.dhammatalks.org/Archive/y2023/230103_Inner_Wealth.mp3',
    artwork: 'https://images.unsplash.com/photo-1605125950879-88125869a84d?auto=format&fit=crop&w=600&q=80',
    description: 'Cultivating resources within yourself.'
  },
  {
    id: 'steady-practice',
    title: 'A Steady Practice',
    artist: 'Dhamma Talk',
    url: 'https://www.dhammatalks.org/Archive/y2023/230104_A_Steady_Practice.mp3',
    artwork: 'https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&w=600&q=80',
    description: 'Consistency over intensity.'
  },
  {
    id: 'rain-storm',
    title: 'Heavy Rain',
    artist: 'Nature',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
    artwork: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    description: 'White noise for blocking distraction.'
  },
  {
    id: 'oecumene',
    title: 'Oecumene Sleeps',
    artist: 'Kai Engel',
    url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Kai_Engel/Chapter_One_-_Cold/Kai_Engel_-_09_-_Oecumene_Sleeps.mp3',
    artwork: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80',
    description: 'Cold, spacious ambient soundscape.'
  }
];

export const AudioScreen: React.FC<Props> = ({ navigation }) => {
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // expo-audio player
  const player = useAudioPlayer(currentTrack.url);

  useEffect(() => {
    // When track changes, replace the source but DO NOT auto-play.
    if (player) {
       player.replace(currentTrack.url);
       player.pause();
       setIsPlaying(false);
    }
  }, [currentTrack, player]);

  const handleTrackSelect = (track: typeof TRACKS[0]) => {
    setCurrentTrack(track);
  };

  const togglePlayback = () => {
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={TYPOGRAPHY.h1}>Audio Library</Text>
        <Text style={styles.subtitle}>
          Curated sounds for focus and calm.
        </Text>
      </View>

      {/* Playlist */}
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionTitle}>Library</Text>
        <Text style={styles.subtitle}>Tap a track to start a focus session immediately.</Text> 
        {TRACKS.map((track) => {
          return (
            <TouchableOpacity 
              key={track.id}
              activeOpacity={0.9}
              onPress={async () => {
                  // Unify Audio & Focus: Immediate Start
                  const session: SessionEvent = {
                      id: Date.now().toString(),
                      startTime: Date.now(),
                      appId: 'focus',
                      activityType: 'Deep Listening',
                      reason: 'intentional',
                      isComplete: false
                  };
                  await storage.saveSession(session);
                  navigation.replace('ActiveSession', { sessionId: session.id, audioTrack: track } as any);
              }}
            >
              <Card style={styles.trackCard}>
                <View style={styles.trackRow}>
                  <Image source={{ uri: track.artwork }} style={styles.trackArtwork} />
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={styles.listTitle}>{track.title}</Text>
                    <Text numberOfLines={1} style={styles.listArtist}>{track.artist}</Text>
                  </View>
                  <View>
                     <Text style={{ fontSize: 24, color: COLORS.primary }}>▶</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Button title="Back to Dashboard" variant="ghost" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.l,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.s,
  },
  playerContainer: {
    marginBottom: SPACING.m,
  },
  playerCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: '#121212', // Darker background
    borderWidth: 0,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  artworkImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#000',
    opacity: 0.8
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, elevation: 6
  },
  quickStartButton: {
      paddingVertical: 12, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.2)', 
      borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  trackInfo: {
    padding: SPACING.m,
    backgroundColor: COLORS.surface,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  trackArtist: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  trackDesc: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 80, // More padding for bottom scrolling
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.m,
  },
  trackCard: {
    marginBottom: SPACING.m,
    padding: SPACING.m,
  },
  activeTrackCard: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  listArtist: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
