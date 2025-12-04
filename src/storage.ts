import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionEvent, WeeklyPlan } from './types';

const PLAN_KEY = 'unhook_plan';
const SESSIONS_KEY = 'unhook_sessions';
const REFLECTIONS_KEY = 'unhook_reflections';
const ACTIVE_SESSION_KEY = 'unhook_active_session';
const GOOGLE_USER_KEY = 'unhook_google_user';
const GOOGLE_TOKEN_KEY = 'unhook_google_token';

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

    const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const dayKey = (d: Date) => startOfDay(d).toISOString();

    // Group daily usage (only completed sessions)
    const usageByDay: Record<string, number> = {};
    sessions.filter(s => s.isComplete).forEach(s => {
      const key = dayKey(new Date(s.startTime));
      usageByDay[key] = (usageByDay[key] || 0) + (s.durationMinutes || 0);
    });

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const usage = usageByDay[key] || 0;
      if (usage === 0) {
        // No tracked usage breaks the streak
        if (i === 0) {
          // If today has no usage, treat as 0-day streak
          break;
        }
        break;
      }
      if (usage <= plan.dailyLimitMinutes) {
        streak++;
      } else {
        break;
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
  
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([PLAN_KEY, SESSIONS_KEY, REFLECTIONS_KEY, ACTIVE_SESSION_KEY, GOOGLE_USER_KEY, GOOGLE_TOKEN_KEY]);
    } catch (e) { console.error(e); }
  }
};
