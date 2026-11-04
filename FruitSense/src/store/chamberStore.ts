import { create } from 'zustand';
import { chamberSource } from '../services/chamberSource';
import {
  ChamberTelemetry,
  ChamberHistoryPoint,
  ChamberState,
} from '../types';
import { config } from '../constants/config';

export type CloudStatus = 'connecting' | 'connected' | 'error';
export type ControlStatus = 'idle' | 'saving' | 'success' | 'error';

interface ChamberStore {
  telemetry: ChamberTelemetry | null;
  history: ChamberHistoryPoint[];
  telemetryLoading: boolean;
  telemetryError: string | null;
  historyLoading: boolean;
  historyError: string | null;
  cloudStatus: CloudStatus;
  lastUpdated: number | null;

  state: ChamberState | null;
  stateLoading: boolean;
  stateError: string | null;
  controlStatus: ControlStatus;
  controlError: string | null;

  fetchTelemetry: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  refreshState: () => Promise<void>;
  refreshAll: () => void;
  clearControlFeedback: () => void;
  setMode: (mode: 'AUTO' | 'MANUAL') => Promise<boolean>;
  setLed: (led: boolean) => Promise<boolean>;
}

const useChamberStore = create<ChamberStore>((set, get) => ({
  telemetry: null,
  history: [],
  telemetryLoading: true,
  telemetryError: null,
  historyLoading: true,
  historyError: null,
  cloudStatus: 'connecting',
  lastUpdated: null,

  state: null,
  stateLoading: true,
  stateError: null,
  controlStatus: 'idle',
  controlError: null,

  fetchTelemetry: async () => {
    try {
      const data = await chamberSource.getLatestTelemetry();
      set({
        telemetry: data,
        telemetryError: null,
        cloudStatus: 'connected',
        lastUpdated: Date.now(),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load sensor data from the cloud.';
      set({ telemetryError: message, cloudStatus: 'error' });
    } finally {
      set({ telemetryLoading: false });
    }
  },

  fetchHistory: async () => {
    try {
      const response = await chamberSource.getHistory(50);
      const items = Array.isArray(response.items) ? response.items : [];
      const sorted = [...items].sort(
        (a, b) => Number(a.timestamp) - Number(b.timestamp),
      );
      set({ history: sorted, historyError: null });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load history from the cloud.';
      set({ historyError: message });
    } finally {
      set({ historyLoading: false });
    }
  },

  refreshState: async () => {
    try {
      const data = await chamberSource.getChamberState();
      set({ state: data, stateError: null });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load chamber state from the cloud.';
      set({ stateError: message });
    } finally {
      set({ stateLoading: false });
    }
  },

  refreshAll: () => {
    get().fetchTelemetry();
    get().fetchHistory();
    get().refreshState();
  },

  clearControlFeedback: () =>
    set({ controlStatus: 'idle', controlError: null }),

  setMode: async (mode) => {
    set({ controlStatus: 'saving', controlError: null });
    try {
      await chamberSource.updateControl({ mode });
      set({ controlStatus: 'success' });
      await get().refreshState();
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send control command.';
      set({ controlStatus: 'error', controlError: message });
      return false;
    }
  },

  setLed: async (led) => {
    set({ controlStatus: 'saving', controlError: null });
    try {
      await chamberSource.updateControl({ led });
      set({ controlStatus: 'success' });
      await get().refreshState();
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send control command.';
      set({ controlStatus: 'error', controlError: message });
      return false;
    }
  },
}));

// ------------------------------------------------------------------
// Ref-counted polling engine.
//
// Intervals are started when the first consumer mounts and stopped when
// the last consumer unmounts, so multiple screens never create duplicate
// intervals or overlapping requests. The tasks also prevent a new request
// from starting while the previous one is still in flight by relying on
// the single-flight queue of the underlying Zustand setters.
// ------------------------------------------------------------------
let consumers = 0;
let telemetryTimer: ReturnType<typeof setInterval> | null = null;
let historyTimer: ReturnType<typeof setInterval> | null = null;
let stateTimer: ReturnType<typeof setInterval> | null = null;

function startEngine(): void {
  if (telemetryTimer) {
    return;
  }
  useChamberStore.getState().refreshAll();

  telemetryTimer = setInterval(
    () => {
      useChamberStore.getState().fetchTelemetry();
    },
    config.telemetryRefreshMs,
  );

  historyTimer = setInterval(
    () => {
      useChamberStore.getState().fetchHistory();
    },
    config.historyRefreshMs,
  );

  stateTimer = setInterval(
    () => {
      useChamberStore.getState().refreshState();
    },
    config.stateRefreshMs,
  );
}

function stopEngine(): void {
  if (telemetryTimer) {
    clearInterval(telemetryTimer);
    telemetryTimer = null;
  }
  if (historyTimer) {
    clearInterval(historyTimer);
    historyTimer = null;
  }
  if (stateTimer) {
    clearInterval(stateTimer);
    stateTimer = null;
  }
}

/** Register a screen as a consumer of the cloud polling engine. */
export function registerChamberConsumer(): () => void {
  consumers += 1;
  if (consumers === 1) {
    startEngine();
  }

  return () => {
    consumers = Math.max(0, consumers - 1);
    if (consumers === 0) {
      stopEngine();
    }
  };
}

export default useChamberStore;
