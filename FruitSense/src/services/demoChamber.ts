import { config } from '../constants/config';
import {
  ChamberTelemetry,
  ChamberHistoryPoint,
  ChamberHistoryResponse,
  ChamberState,
  ChamberSettings,
  ChamberControl,
  ChamberWriteResponse,
  HealthResponse,
} from '../types';

/**
 * Built-in offline backend used while the real API Gateway URL is not
 * configured (config.apiBaseUrl still contains "YOUR_API_ID"). It exposes the
 * same eight methods as ChamberApi so the store and screens can switch without
 * changes. Simulated values are deterministic within a run and animate with
 * wall-clock time, so history charts and live readings feel real.
 */

const GENERATE_POINTS = 50;

function baseTemperature(): number {
  return 27.2 + Math.sin(Date.now() / 60000) * 1.6;
}

function baseHumidity(): number {
  return 84 + Math.sin(Date.now() / 45000 + 0.7) * 4;
}

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function nowTimestamp(): number {
  return Date.now();
}

function buildTelemetry(timestamp: number): ChamberTelemetry {
  const warmed = true;
  const calibrated = false;
  const filtered = round(950 + Math.sin(timestamp / 90000) * 260 + timestamp % 90, 0);
  const raw = round(filtered * (1.04 + (timestamp % 7) * 0.004), 0);
  return {
    deviceId: config.deviceId,
    timestamp,
    temperature: round(baseTemperature() + Math.sin(timestamp / 30000) * 0.4, 1),
    humidity: round(baseHumidity() + Math.sin(timestamp / 40000) * 1.2, 1),
    dht_valid: true,
    mq3_raw: raw,
    mq3_filtered: filtered,
    mq3_ppm: calibrated ? round(filtered / 100, 1) : 0,
    mq3_voltage: round(0.2 + (timestamp % 1000) / 6000, 2),
    mq3_rs: round(12 + (timestamp % 500) / 70, 1),
    mq3_ro: round(1.2 + (timestamp % 23) / 20, 1),
    mq3_calibrated: calibrated,
    mq3_warmed_up: warmed,
  };
}

interface ShadowState {
  desired: {
    mode: 'AUTO' | 'MANUAL';
    led: boolean;
    targetTemperature: number;
    temperatureTolerance: number;
    targetHumidity: number;
    humidityTolerance: number;
    gasThresholdHigh: number;
    gasThresholdLow: number;
  };
  reported: {
    mode: 'AUTO' | 'MANUAL';
    targetTemperature: number;
    temperatureTolerance: number;
    targetHumidity: number;
    humidityTolerance: number;
    gasThresholdHigh: number;
    gasThresholdLow: number;
    peltier: boolean;
    humidifier: boolean;
    exhaust: boolean;
    led: boolean;
  };
}

let shadow: ShadowState = {
  desired: {
    mode: 'AUTO',
    led: false,
    targetTemperature: 9,
    temperatureTolerance: 2,
    targetHumidity: 90,
    humidityTolerance: 5,
    gasThresholdHigh: 500,
    gasThresholdLow: 200,
  },
  reported: {
    mode: 'AUTO',
    targetTemperature: 9,
    temperatureTolerance: 2,
    targetHumidity: 90,
    humidityTolerance: 5,
    gasThresholdHigh: 500,
    gasThresholdLow: 200,
    peltier: false,
    humidifier: false,
    exhaust: false,
    led: false,
  },
};

function buildState(): ChamberState {
  return {
    state: {
      desired: { ...shadow.desired },
      reported: { ...shadow.reported },
    },
  };
}

export const DemoChamber = {
  getHealth(): Promise<HealthResponse> {
    return Promise.resolve({ status: 'ok', service: 'TropicStore (demo mode)' });
  },

  getLatestTelemetry(): Promise<ChamberTelemetry> {
    return Promise.resolve(buildTelemetry(nowTimestamp()));
  },

  getHistory(limit = GENERATE_POINTS): Promise<ChamberHistoryResponse> {
    const now = nowTimestamp();
    const step = 15 * 60 * 1000;
    const items: ChamberHistoryPoint[] = [];
    for (let i = 0; i < limit; i += 1) {
      const timestamp = now - (limit - 1 - i) * step;
      const point = buildTelemetry(timestamp);
      items.push({
        deviceId: point.deviceId,
        timestamp: point.timestamp,
        temperature: point.temperature,
        humidity: point.humidity,
        mq3_raw: point.mq3_raw,
        mq3_filtered: point.mq3_filtered,
        mq3_ppm: point.mq3_ppm,
        mq3_calibrated: point.mq3_calibrated,
      });
    }
    return Promise.resolve({ count: items.length, items });
  },

  getChamberState(): Promise<ChamberState> {
    return Promise.resolve(buildState());
  },

  updateSettings(settings: Partial<ChamberSettings>): Promise<ChamberWriteResponse> {
    const nextDesired: Partial<ShadowState['desired']> = { ...settings } as Partial<ShadowState['desired']>;
    shadow = {
      ...shadow,
      desired: { ...shadow.desired, ...nextDesired },
      reported: {
        ...shadow.reported,
        targetTemperature:
          (settings.targetTemperature as number) ?? shadow.reported.targetTemperature,
        temperatureTolerance:
          (settings.temperatureTolerance as number) ?? shadow.reported.temperatureTolerance,
        targetHumidity:
          (settings.targetHumidity as number) ?? shadow.reported.targetHumidity,
        humidityTolerance:
          (settings.humidityTolerance as number) ?? shadow.reported.humidityTolerance,
        gasThresholdHigh:
          (settings.gasThresholdHigh as number) ?? shadow.reported.gasThresholdHigh,
        gasThresholdLow:
          (settings.gasThresholdLow as number) ?? shadow.reported.gasThresholdLow,
      },
    };
    return Promise.resolve({
      message: 'Settings accepted.',
      desired: { ...shadow.desired },
      shadow: { ...shadow },
    });
  },

  updateControl(control: Partial<ChamberControl>): Promise<ChamberWriteResponse> {
    if (control.mode !== undefined) {
      shadow.desired.mode = control.mode;
      shadow.reported.mode = control.mode;
    }
    if (control.led !== undefined) {
      shadow.desired.led = control.led;
      shadow.reported.led = control.led;
    }
    return Promise.resolve({
      message: 'Control command accepted.',
      desired: { ...shadow.desired },
      shadow: { ...shadow },
    });
  },
};

export default DemoChamber;
