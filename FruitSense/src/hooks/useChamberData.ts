import { useEffect } from 'react';
import useChamberStore, {
  CloudStatus,
  registerChamberConsumer,
} from '../store/chamberStore';
import { ChamberTelemetry, ChamberHistoryPoint } from '../types';

export type { CloudStatus };

export interface UseChamberData {
  telemetry: ChamberTelemetry | null;
  history: ChamberHistoryPoint[];
  telemetryLoading: boolean;
  telemetryError: string | null;
  historyLoading: boolean;
  historyError: string | null;
  cloudStatus: CloudStatus;
  lastUpdated: number | null;
  refreshNow: () => void;
}

/**
 * Subscribes to the shared chamber data store (telemetry + history).
 * Polling is started when the first consumer mounts and stopped when the
 * last one unmounts, so screens never create duplicate intervals.
 */
export function useChamberData(): UseChamberData {
  const telemetry = useChamberStore((s) => s.telemetry);
  const history = useChamberStore((s) => s.history);
  const telemetryLoading = useChamberStore((s) => s.telemetryLoading);
  const telemetryError = useChamberStore((s) => s.telemetryError);
  const historyLoading = useChamberStore((s) => s.historyLoading);
  const historyError = useChamberStore((s) => s.historyError);
  const cloudStatus = useChamberStore((s) => s.cloudStatus);
  const lastUpdated = useChamberStore((s) => s.lastUpdated);
  const refreshAll = useChamberStore((s) => s.refreshAll);

  useEffect(() => registerChamberConsumer(), []);

  return {
    telemetry,
    history,
    telemetryLoading,
    telemetryError,
    historyLoading,
    historyError,
    cloudStatus,
    lastUpdated,
    refreshNow: refreshAll,
  };
}

export default useChamberData;
