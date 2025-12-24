import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ActiveSessionScreen } from '../screens/ActiveSessionScreen';

// Mock dependencies
const mockNavigation = {
    replace: jest.fn(),
    popToTop: jest.fn(),
};

const mockRoute = {
    params: {
        sessionId: '123',
        audioTrack: {
            url: 'http://test.mp3',
            title: 'Test Track',
            artist: 'Test Artist',
            artwork: 'http://art.jpg'
        }
    }
};

// Mock Storage
jest.mock('../storage', () => ({
    storage: {
        getSessionById: jest.fn().mockResolvedValue({ startTime: Date.now(), activityType: 'Focus' }),
        getActiveSession: jest.fn().mockResolvedValue(null),
    }
}));

// Mock Audio
const mockSetUpdateListener = jest.fn();
const mockPlayAsync = jest.fn();
const mockPauseAsync = jest.fn();
const mockUnloadAsync = jest.fn();

jest.mock('expo-av', () => ({
    Audio: {
        Sound: {
            createAsync: jest.fn().mockImplementation(async (source, initialStatus, callback) => {
                // If callback provided in createAsync (old way), call it
                if (callback) callback({ isLoaded: true, isPlaying: true, isBuffering: false });
                
                return {
                    sound: {
                        setOnPlaybackStatusUpdate: mockSetUpdateListener,
                        playAsync: mockPlayAsync,
                        pauseAsync: mockPauseAsync,
                        unloadAsync: mockUnloadAsync,
                    }
                };
            })
        },
        setAudioModeAsync: jest.fn(),
    }
}));

describe('ActiveSessionScreen Audio Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('initializes audio player when track is present', async () => {
        render(<ActiveSessionScreen navigation={mockNavigation as any} route={mockRoute as any} />);
        
        await waitFor(() => {
            // Verify createAsync called
            expect(require('expo-av').Audio.Sound.createAsync).toHaveBeenCalled();
            // Verify listener registered (the robust fix)
            expect(mockSetUpdateListener).toHaveBeenCalled(); 
        });
    });

    it('renders the music player UI', async () => {
        const { getByText } = render(<ActiveSessionScreen navigation={mockNavigation as any} route={mockRoute as any} />);
        
        await waitFor(() => {
            expect(getByText('Test Track')).toBeTruthy();
            expect(getByText('Test Artist')).toBeTruthy();
        });
    });
});
