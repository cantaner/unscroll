import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionEvent, WeeklyPlan } from './types';

const PLAN_KEY = 'unhook_plan';
const SESSIONS_KEY = 'unhook_sessions';
const REFLECTIONS_KEY = 'unhook_reflections';
const ACTIVE_SESSION_KEY = 'unhook_active_session';
const GOOGLE_USER_KEY = 'unhook_google_user';
const GOOGLE_TOKEN_KEY = 'unhook_google_token';
const USER_STATS_KEY = 'unhook_user_stats';

export const storage = {
  savePlan: async (plan: WeeklyPlan) => {
    try {
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    } catch (e) { console.error(e); }
  },
  
  getPlan: async (): Promise<WeeklyPlan | null> => {
    try {
      const data = await AsyncStorage.getItem(PLAN_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  getUserStats: async (): Promise<{ xp: number, level: number }> => {
    try {
      const data = await AsyncStorage.getItem(USER_STATS_KEY);
      return data ? JSON.parse(data) : { xp: 0, level: 1 };
    } catch (e) {
      return { xp: 0, level: 1 };
    }
  },

  saveUserStats: async (stats: { xp: number, level: number }) => {
    try {
      await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(stats));
    } catch (e) { console.error(e); }
  },

  addXP: async (amount: number) => {
    try {
      const stats = await storage.getUserStats();
      stats.xp += amount;
      // Level up logic: Level = floor(sqrt(xp/100)) + 1
      // e.g. 0xp->L1, 100xp->L2, 400xp->L3, 900xp->L4
      const newLevel = Math.floor(Math.sqrt(stats.xp / 100)) + 1;
      if (newLevel > stats.level) {
        stats.level = newLevel;
        // Ideally trigger a modal or toast here, but for now just save state
      }
      await storage.saveUserStats(stats);
      return stats;
    } catch (e) { console.error(e); return { xp: 0, level: 1 }; }
  },

  saveSession: async (session: SessionEvent) => {
    try {
      const sessions = await storage.getSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) sessions[index] = session;
      else sessions.push(session);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

      if (session.isComplete) {
        await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
      } else {
        await AsyncStorage.setItem(ACTIVE_SESSION_KEY, session.id);
      }
    } catch (e) { console.error(e); }
  },

  getSessions: async (): Promise<SessionEvent[]> => {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  getSessionById: async (id: string): Promise<SessionEvent | null> => {
    const sessions = await storage.getSessions();
    return sessions.find(s => s.id === id) || null;
  },

  getActiveSessionId: async (): Promise<string | null> => {
    try {
      return (await AsyncStorage.getItem(ACTIVE_SESSION_KEY)) ?? null;
    } catch {
      return null;
    }
  },

  setActiveSessionId: async (id: string | null) => {
    try {
      if (id) await AsyncStorage.setItem(ACTIVE_SESSION_KEY, id);
      else await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch (e) { console.error(e); }
  },

  getActiveSession: async (): Promise<SessionEvent | null> => {
    const sessions = await storage.getSessions();
    const pointer = await storage.getActiveSessionId();
    const fromPointer = pointer ? sessions.find(s => s.id === pointer && s.isComplete !== true) : null;
    if (fromPointer) return fromPointer;

    // Fallback: latest incomplete session
    const incomplete = sessions
      .filter(s => s.isComplete !== true)
      .sort((a, b) => (b.startTime || 0) - (a.startTime || 0))[0];
    return incomplete ?? null;
  },

  // --- Calculate Streak: consecutive days (including today) with any tracked usage under limit ---
  getStreak: async (): Promise<number> => {
    const sessions = await storage.getSessions();
    const plan = await storage.getPlan();
    if (!plan) return 0;

    const target = plan.dailyLimitMinutes || 15; // Focus Target
    const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const dayKey = (d: Date) => startOfDay(d).toISOString();

    // Group daily usage
    const usageByDay: Record<string, number> = {};
    sessions.filter(s => s.isComplete).forEach(s => {
      const key = dayKey(new Date(s.startTime));
      usageByDay[key] = (usageByDay[key] || 0) + (s.durationMinutes || 0);
    });

    let streak = 0;
    
    // Check Today (i=0)
    const today = new Date();
    const todayUsage = usageByDay[dayKey(today)] || 0;
    if (todayUsage >= target) {
      streak++;
    }

    // Check Past Days (i=1 to 365)
    for (let i = 1; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const usage = usageByDay[dayKey(d)] || 0;
        
        if (usage >= target) {
            streak++;
        } else {
            break; // Streak broken
        }
    }
    
    return streak;
  },

  // Google Auth
  setGoogleUser: async (user: any) => {
    try {
      if (user) await AsyncStorage.setItem(GOOGLE_USER_KEY, JSON.stringify(user));
      else await AsyncStorage.removeItem(GOOGLE_USER_KEY);
    } catch (e) { console.error(e); }
  },

  getGoogleUser: async (): Promise<any> => {
    try {
      const data = await AsyncStorage.getItem(GOOGLE_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  setGoogleToken: async (token: string | null) => {
    try {
      if (token) await AsyncStorage.setItem(GOOGLE_TOKEN_KEY, token);
      else await AsyncStorage.removeItem(GOOGLE_TOKEN_KEY);
    } catch (e) { console.error(e); }
  },

  getGoogleToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(GOOGLE_TOKEN_KEY);
    } catch (e) { return null; }
  },
  
  // --- Unified Usage (Negative) ---
  logAppUsage: async (usage: { appId: string, durationMinutes: number, timestamp: number }) => {
    try {
      const KEY = 'unhook_app_usage';
      const existing = await AsyncStorage.getItem(KEY);
      const data = existing ? JSON.parse(existing) : [];
      data.push(usage);
      await AsyncStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) { console.error(e); }
  },

  getAppUsage: async (): Promise<{ appId: string, durationMinutes: number, timestamp: number }[]> => {
    try {
      const KEY = 'unhook_app_usage';
      const existing = await AsyncStorage.getItem(KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) { return []; }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([PLAN_KEY, SESSIONS_KEY, REFLECTIONS_KEY, ACTIVE_SESSION_KEY, GOOGLE_USER_KEY, GOOGLE_TOKEN_KEY, 'unhook_app_usage']);
    } catch (e) { console.error(e); }
  }
};
