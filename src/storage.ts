import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './lib/supabase';
import { SessionEvent, WeeklyPlan } from './types';

const PLAN_KEY = 'unhook_plan';
const SESSIONS_KEY = 'unhook_sessions';
const REFLECTIONS_KEY = 'unhook_reflections';
const ACTIVE_SESSION_KEY = 'unhook_active_session';
const GOOGLE_USER_KEY = 'unhook_google_user';
const GOOGLE_TOKEN_KEY = 'unhook_google_token';
const USER_STATS_KEY = 'unhook_user_stats';
const CMS_CACHE_PREFIX = 'unscroll_cms_';

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

  calculateSessionXP: async (durationMinutes: number, isNegative: boolean): Promise<number> => {
    if (durationMinutes <= 0) return 0;
    
    const streak = await storage.getStreak();
    const multiplier = 1 + Math.min(0.5, streak * 0.05);

    if (isNegative) {
      // Deduct XP for slip-ups (5 XP per minute)
      return -Math.ceil(durationMinutes * 5);
    } else {
      // Award XP for positive sessions (10 XP per minute + streak bonus)
      const baseXP = durationMinutes * 10;
      return Math.round(Math.max(10, baseXP * multiplier));
    }
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

      // Sync with Supabase if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_stats')
          .upsert({
            user_id: user.id,
            xp: stats.xp,
            level: stats.level,
            modified_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }

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

      // Sync with Supabase if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          await supabase
            .from('sessions')
            .upsert({
                id: session.id,
                user_id: user.id,
                start_time: new Date(session.startTime).toISOString(),
                duration_minutes: session.durationMinutes,
                activity_type: session.activityType,
                is_complete: session.isComplete,
                reason: session.reason,
            });
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
    
    // For streak: count days where user stayed UNDER or AT the daily limit
    // AND has at least some tracked usage for today to start the streak
    if (todayUsage > 0 && todayUsage <= target) {
      streak++;
    } else if (todayUsage > target) {
      // If today exceeded limit, streak is broken
      return 0;
    }
    // If todayUsage is 0, we don't increment streak for today yet, 
    // but we can still count past days if they existed.

    // Determine startDate (when plan was created, or fallback to today if new)
    const startDate = plan.createdAt ? new Date(plan.createdAt) : new Date();
    startDate.setHours(0,0,0,0);

    // Check Past Days (i=1 to 365)
    for (let i = 1; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Stop if we go before the user joined
        if (d < startDate) break;

        const usage = usageByDay[dayKey(d)] || 0;
        
        // Count days staying under/at limit
        if (usage <= target) {
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

  // --- CMS Content (FAQ, Terms, About) ---
  getCMSContent: async (slug: string): Promise<{ title: string, content: string } | null> => {
    try {
      // 1. Check Cache
      const cacheKey = `${CMS_CACHE_PREFIX}${slug}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
          // Return cached but trigger background refresh
          storage.refreshCMSCache(slug); 
          return JSON.parse(cached);
      }

      // 2. Fetch from DB
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('id', slug)
        .single();
      
      if (error || !data) {
        return storage.getFallbackCMSContent(slug);
      }

      // 3. Update Cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) { 
      return storage.getFallbackCMSContent(slug);
    }
  },

  refreshCMSCache: async (slug: string) => {
    try {
        const { data } = await supabase.from('cms_content').select('*').eq('id', slug).single();
        if (data) {
            await AsyncStorage.setItem(`${CMS_CACHE_PREFIX}${slug}`, JSON.stringify(data));
        }
    } catch (e) {}
  },

  getFallbackCMSContent: (slug: string) => {
    const fallbacks: Record<string, { title: string, content: string }> = {
        about: {
            title: 'About Unscroll',
            content: '### Our Mission\nUnscroll is your digital sanctuary. In an age of infinite scrolls and attention-hijacking algorithms, we help you reclaim your most precious resource: your time.\n\n### The Problem\nApps today are designed to keep you trapped in "doomscrolling" loops. This leads to reduced focus, increased anxiety, and a feeling of lost days.\n\n### Our Solution\nBy introducing intentional pauses and a reward system for focus, Unscroll retrains your brain to use technology as a tool, not a trap.\n\n### Built for Privacy\nYour data stays with you. We prioritize local storage and secure cloud sync, ensuring your habits are your business and no one else’s.'
        },
        faq: {
            title: 'Help Center',
            content: '### 1. How do I earn XP?\nYou earn 10 XP for every full minute of a Focus session. Streak multipliers (up to +50%) apply if you remain consistent!\n\n### 2. What are "Slip-ups"?\nIf you log time spent on a distracting app, it’s recorded as a Slip-up. This deducts a small amount of XP (5 per min) to keep you accountable.\n\n### 3. How is my streak calculated?\nA streak grows for every consecutive day you log at least one focus session and stay under your daily goal limit.\n\n### 4. Is my data secure?\nYes. We use industry-standard encryption and Supabase for cloud sync. Your data is never sold or shared with advertisers.\n\n### 5. Can I use the app offline?\nAbsolutely. Your sessions are saved locally and will sync to the cloud once you’re back online.\n\n### 6. What happens if I delete my account?\nDeleting your account permanently removes all your history, stats, and profile details from both our servers and your device.\n\n### 7. How do I change my focus goals?\nYou can update your daily limits and intentional categories in the "Plan" section of the app.\n\n### 8. Does Unscroll block other apps?\nUnscroll uses a "soft-blocking" approach by encouraging intentionality. We don’t forcibly lock apps, as we believe true habit change comes from conscious choice.\n\n### 9. Why is there a 5-second breath pause?\nThat pause is designed to break the "impulse loop." It gives your prefrontal cortex a moment to catch up before you dive into a distracting app.\n\n### 10. How do I contact support?\nIf your question isn’t answered here, tap the "Send Message" button below or email us at info@rulesimple.com.'
        },
        terms: {
            title: 'Terms & Privacy',
            content: '### 1. Acceptance\nBy using Unscroll, you agree to these terms. Our goal is to help you, not exploit you.\n\n### 2. Privacy First\nWe collect only what is necessary: focus durations, app categories, and basic profile info. We do not track keystrokes, messages, or sensitive content.\n\n### 3. Account Security\nYou are responsible for your account credentials. We provide Apple and Google sign-in for maximum security.\n\n### 4. Data Ownership\nYou own your data. You can export or delete it at any time.\n\n### 5. No Warranty\nWhile we strive for perfection, the app is provided "as-is". We are not responsible for any lost productivity or unintended focus gains.'
        }
    };
    return fallbacks[slug] || null;
  },

  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove([
        PLAN_KEY, SESSIONS_KEY, REFLECTIONS_KEY, ACTIVE_SESSION_KEY, 
        GOOGLE_USER_KEY, GOOGLE_TOKEN_KEY, 'unhook_app_usage', USER_STATS_KEY
      ]);
    } catch (e) { console.error(e); }
  }
};
