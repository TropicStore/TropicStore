import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store';
import {
  ThresholdSettings,
  NotificationSettings,
  ReportSchedule,
  Units,
} from '../types';
import { config } from '../constants/config';

const STORAGE_KEYS = {
  thresholds: '@fruitsense:thresholds',
  notifications: config.storage.notificationSettings,
  reportSchedule: config.storage.reportSchedule,
  units: config.storage.unitPreference,
} as const;

interface StoredSettings {
  thresholds?: ThresholdSettings;
  notifications?: NotificationSettings;
  reportSchedule?: ReportSchedule;
  units?: Units;
}

function parseJson<T>(raw: string | null): T | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

async function loadAllSettings(): Promise<StoredSettings> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    const results = await Promise.all(keys.map((key) => AsyncStorage.getItem(key)));
    const entries: Record<string, string | null> = {};
    keys.forEach((key, index) => {
      entries[key] = results[index];
    });

    return {
      thresholds: parseJson<ThresholdSettings>(entries[STORAGE_KEYS.thresholds]),
      notifications: parseJson<NotificationSettings>(
        entries[STORAGE_KEYS.notifications],
      ),
      reportSchedule: parseJson<ReportSchedule>(
        entries[STORAGE_KEYS.reportSchedule],
      ),
      units: parseJson<Units>(entries[STORAGE_KEYS.units]),
    };
  } catch {
    return {};
  }
}

async function saveSetting<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage write failure is non-critical; in-memory store still has the value
  }
}

export function useSettings() {
  const {
    thresholds,
    notificationSettings,
    reportSchedule,
    units,
    updateThresholds,
    updateNotifications,
    updateReportSchedule,
    updateUnits,
  } = useStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const stored = await loadAllSettings();
      if (cancelled) {
        return;
      }

      if (stored.thresholds) {
        updateThresholds(stored.thresholds);
      }
      if (stored.notifications) {
        updateNotifications(stored.notifications);
      }
      if (stored.reportSchedule) {
        updateReportSchedule(stored.reportSchedule);
      }
      if (stored.units) {
        updateUnits(stored.units);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    saveSetting(STORAGE_KEYS.thresholds, thresholds);
  }, [thresholds]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.notifications, notificationSettings);
  }, [notificationSettings]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.reportSchedule, reportSchedule);
  }, [reportSchedule]);

  useEffect(() => {
    saveSetting(STORAGE_KEYS.units, units);
  }, [units]);

  const setThresholds = useCallback(
    (partial: Partial<ThresholdSettings>) => {
      updateThresholds(partial);
    },
    [updateThresholds],
  );

  const setNotifications = useCallback(
    (partial: Partial<NotificationSettings>) => {
      updateNotifications(partial);
    },
    [updateNotifications],
  );

  const setReportSchedule = useCallback(
    (partial: Partial<ReportSchedule>) => {
      updateReportSchedule(partial);
    },
    [updateReportSchedule],
  );

  const setUnits = useCallback(
    (partial: Partial<Units>) => {
      updateUnits(partial);
    },
    [updateUnits],
  );

  return {
    thresholds,
    notificationSettings,
    reportSchedule,
    units,
    setThresholds,
    setNotifications,
    setReportSchedule,
    setUnits,
  };
}
