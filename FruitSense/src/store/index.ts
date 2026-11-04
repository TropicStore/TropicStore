import { create } from 'zustand';
import { getAuthenticatedUser } from '../services/auth';
import {
  User,
  SensorData,
  Alert,
  Device,
  ThresholdSettings,
  NotificationSettings,
  ReportSchedule,
  Units,
  UserProfile,
} from '../types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
  login: (user: User, token: string | null) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  restoreSession: () => Promise<void>;

  currentSensorData: SensorData | null;
  monitoringHistory: SensorData[];
  isMonitoring: boolean;
  setSensorData: (data: SensorData) => void;
  setHistory: (history: SensorData[]) => void;
  setIsMonitoring: (monitoring: boolean) => void;

  alerts: Alert[];
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markRead: (alertId: string) => void;
  clearAlert: (alertId: string) => void;
  setAlerts: (alerts: Alert[]) => void;

  devices: Device[];
  selectedDevice: Device | null;
  setDevices: (devices: Device[]) => void;
  selectDevice: (device: Device | null) => void;

  thresholds: ThresholdSettings;
  notificationSettings: NotificationSettings;
  reportSchedule: ReportSchedule;
  units: Units;
  updateThresholds: (thresholds: Partial<ThresholdSettings>) => void;
  updateNotifications: (settings: Partial<NotificationSettings>) => void;
  updateReportSchedule: (schedule: Partial<ReportSchedule>) => void;
  updateUnits: (units: Partial<Units>) => void;

  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
}

export const useStore = create<AppState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authToken: null,

  login: (user: User, token: string | null) =>
    set({ user, isAuthenticated: true, isLoading: false, authToken: token }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      authToken: null,
      userProfile: null,
      currentSensorData: null,
      monitoringHistory: [],
      isMonitoring: false,
      alerts: [],
      unreadCount: 0,
      devices: [],
      selectedDevice: null,
    }),

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const { user, token } = await getAuthenticatedUser();
      set({
        user,
        isAuthenticated: true,
        authToken: token,
        isLoading: false,
      });
    } catch {
      // No valid session in Amplify's storage - user is signed out.
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        authToken: null,
      });
    }
  },

  currentSensorData: null,
  monitoringHistory: [],
  isMonitoring: false,

  setSensorData: (data: SensorData) =>
    set((state) => ({
      currentSensorData: data,
      monitoringHistory: [...state.monitoringHistory, data].slice(-100),
    })),

  setHistory: (monitoringHistory: SensorData[]) => set({ monitoringHistory }),

  setIsMonitoring: (isMonitoring: boolean) => set({ isMonitoring }),

  alerts: [],
  unreadCount: 0,

  addAlert: (alert: Alert) =>
    set((state) => {
      const exists = state.alerts.some((a) => a.id === alert.id);
      if (exists) {
        return state;
      }
      const alerts = [alert, ...state.alerts];
      const unreadCount = alerts.filter((a) => !a.read).length;
      return { alerts: alerts.slice(0, 200), unreadCount };
    }),

  markRead: (alertId: string) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === alertId ? { ...a, read: true } : a,
      );
      const unreadCount = alerts.filter((a) => !a.read).length;
      return { alerts, unreadCount };
    }),

  clearAlert: (alertId: string) =>
    set((state) => {
      const alerts = state.alerts.filter((a) => a.id !== alertId);
      const unreadCount = alerts.filter((a) => !a.read).length;
      return { alerts, unreadCount };
    }),

  setAlerts: (alerts: Alert[]) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.read).length,
    }),

  devices: [],
  selectedDevice: null,

  setDevices: (devices: Device[]) => set({ devices }),

  selectDevice: (selectedDevice: Device | null) => set({ selectedDevice }),

  thresholds: {
    temperatureMin: 10,
    temperatureMax: 14,
    humidityMin: 60,
    humidityMax: 75,
    ethyleneMin: 0,
    ethyleneMax: 5,
  },

  notificationSettings: {
    pushAlerts: true,
    highEthylene: true,
    temperature: true,
    dailyReport: true,
  },

  reportSchedule: {
    frequency: 'daily',
    time: '18:00',
    deliveryMethod: 'both',
  },

  units: {
    temperature: 'metric',
    humidity: 'percentage',
    ethylene: 'ppm',
  },

  updateThresholds: (partial: Partial<ThresholdSettings>) =>
    set((state) => ({
      thresholds: { ...state.thresholds, ...partial },
    })),

  updateNotifications: (partial: Partial<NotificationSettings>) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...partial },
    })),

  updateReportSchedule: (partial: Partial<ReportSchedule>) =>
    set((state) => ({
      reportSchedule: { ...state.reportSchedule, ...partial },
    })),

  updateUnits: (partial: Partial<Units>) =>
    set((state) => ({
      units: { ...state.units, ...partial },
    })),

  userProfile: null,
  setUserProfile: (userProfile: UserProfile | null) => set({ userProfile }),
}));
