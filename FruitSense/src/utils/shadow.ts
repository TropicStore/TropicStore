import { ChamberState, ChamberSettings, ChamberActuators } from '../types';

/**
 * Safe accessors for the classic Device Shadow returned by GET /chamber/state.
 * All accessors return undefined instead of throwing when the shape is
 * absent/missing, so the UI can render fallbacks like "--".
 */

export const SHADOW = {
  /** Preferred source is "desired"; falls back to "reported". */
  desired(state: ChamberState | null): Partial<ChamberSettings & { mode?: string; led?: boolean }> {
    return state?.state?.desired ?? {};
  },

  /** Actual applied/current actuator state as reported by the ESP32. */
  reported(state: ChamberState | null): Partial<ChamberActuators> {
    return state?.state?.reported ?? {};
  },

  /** Writeable numeric settings with a typed fallback when absent. */
  settings(state: ChamberState | null): ChamberSettings {
    const d = SHADOW.desired(state);
    return {
      targetTemperature: toNum(d.targetTemperature),
      temperatureTolerance: toNum(d.temperatureTolerance),
      targetHumidity: toNum(d.targetHumidity),
      humidityTolerance: toNum(d.humidityTolerance),
      gasThresholdHigh: toNum(d.gasThresholdHigh),
      gasThresholdLow: toNum(d.gasThresholdLow),
    };
  },
};

function toNum(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}
