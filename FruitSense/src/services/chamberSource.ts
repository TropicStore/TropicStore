import { backendConfigured } from '../constants/config';
import { ChamberApi } from './chamberApi';
import { DemoChamber } from './demoChamber';
import {
  ChamberTelemetry,
  ChamberHistoryResponse,
  ChamberState,
  ChamberSettings,
  ChamberControl,
  ChamberWriteResponse,
  HealthResponse,
} from '../types';

// Central switch between the real API Gateway backend and the built-in demo
// backend. Screens and the store call these functions - never ChamberApi or
// DemoChamber directly - so wiring the real DynamoDB backend is just a config
// change (src/constants/config.ts -> apiBaseUrl).
export interface ChamberDataSource {
  getHealth: () => Promise<HealthResponse>;
  getLatestTelemetry: () => Promise<ChamberTelemetry>;
  getHistory: (limit?: number) => Promise<ChamberHistoryResponse>;
  getChamberState: () => Promise<ChamberState>;
  updateSettings: (
    settings: Partial<ChamberSettings>,
  ) => Promise<ChamberWriteResponse>;
  updateControl: (
    control: Partial<ChamberControl>,
  ) => Promise<ChamberWriteResponse>;
}

export const chamberSource: ChamberDataSource = backendConfigured
  ? ChamberApi
  : DemoChamber;

export function getBackendMode(): 'demo' | 'cloud' {
  return backendConfigured ? 'cloud' : 'demo';
}
