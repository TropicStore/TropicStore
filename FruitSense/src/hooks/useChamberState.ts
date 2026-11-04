import { useEffect } from 'react';
import useChamberStore, {
  ControlStatus,
  registerChamberConsumer,
} from '../store/chamberStore';
import { ChamberState } from '../types';

export type { ControlStatus };

export interface UseChamberState {
  state: ChamberState | null;
  loading: boolean;
  error: string | null;
  controlStatus: ControlStatus;
  controlError: string | null;
  setMode: (mode: 'AUTO' | 'MANUAL') => Promise<boolean>;
  setLed: (led: boolean) => Promise<boolean>;
  refreshState: () => Promise<void>;
  clearControl: () => void;
}

/**
 * Subscribes to the shared chamber shadow state store.
 * Cloud reported state is treated as authoritative - we never assume a local
 * toggle value is correct (e.g. the ESP32 has a 5-minute LED auto-off timer).
 */
export function useChamberState(): UseChamberState {
  const state = useChamberStore((s) => s.state);
  const loading = useChamberStore((s) => s.stateLoading);
  const error = useChamberStore((s) => s.stateError);
  const controlStatus = useChamberStore((s) => s.controlStatus);
  const controlError = useChamberStore((s) => s.controlError);
  const setMode = useChamberStore((s) => s.setMode);
  const setLed = useChamberStore((s) => s.setLed);
  const refreshState = useChamberStore((s) => s.refreshState);
  const clearControl = useChamberStore((s) => s.clearControlFeedback);

  useEffect(() => registerChamberConsumer(), []);

  return {
    state,
    loading,
    error,
    controlStatus,
    controlError,
    setMode,
    setLed,
    refreshState,
    clearControl,
  };
}

export default useChamberState;
