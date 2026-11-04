import { ChamberTelemetry } from '../types';

/** Format a numeric value, returning "--" for null/undefined/non-finite. */
export function formatNumber(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--';
  }
  return value.toFixed(decimals);
}

export function toNumber(
  value: number | null | undefined,
): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return null;
}

/** Convert an epoch-millis timestamp to a short HH:MM label. */
export function formatTimeLabel(timestamp?: number | null): string {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

/** MQ3 gas level shown to the user, per the calibration rules. */
export function gasReadingValue(telemetry: ChamberTelemetry | null): number | null {
  if (!telemetry) {
    return null;
  }
  if (telemetry.mq3_calibrated && telemetry.mq3_ppm != null) {
    return toNumber(telemetry.mq3_ppm);
  }
  if (telemetry.mq3_filtered != null) {
    return toNumber(telemetry.mq3_filtered);
  }
  return toNumber(telemetry.mq3_raw);
}

export function gasUnit(telemetry: ChamberTelemetry | null): string {
  if (!telemetry) {
    return '';
  }
  if (telemetry.mq3_calibrated && telemetry.mq3_ppm != null) {
    return 'ppm';
  }
  return '';
}

export function gasStateLabel(telemetry: ChamberTelemetry | null): string | null {
  if (!telemetry) {
    return null;
  }
  if (telemetry.mq3_warmed_up === false) {
    return 'Warming up';
  }
  if (telemetry.mq3_calibrated === false) {
    return 'Not calibrated';
  }
  return null;
}
