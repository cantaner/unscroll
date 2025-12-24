import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';
import { SessionEvent } from '../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves a session correctly', async () => {
    const session: SessionEvent = {
        id: '123',
        startTime: 1000,
        activityType: 'Reading',
        isComplete: false,
        appId: 'focus'
    };

    await storage.saveSession(session);

    // Should first get existing sessions (which mock returns null/empty), then save new array
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('sessions');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('sessions', expect.stringContaining('"id":"123"'));
  });

  it('adds XP correctly', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ xp: 100, level: 1 }));
    
    await storage.addXP(50);
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user_stats', expect.stringContaining('"xp":150'));
  });
});
