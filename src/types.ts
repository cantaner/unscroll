

export interface TrackedApp {
  id: string;
  name: string;
}

export interface WeeklyPlan {
  apps: string[];
  goal: string;
  dailyLimitMinutes: number;
  nightBoundary: string; // HH:mm
  bedtime?: string; // HH:mm
}

export interface SessionEvent {
  id: string;
  startTime: number;
  endTime?: number;
  durationMinutes?: number;
  appId: string;
  reason: string;
  isComplete: boolean;
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  Pause: undefined;
  Breathe: undefined;
  Audio: undefined;
  ActiveSession: { sessionId: string };
  LogSession: { sessionId: string };
  Settings: undefined;
};
