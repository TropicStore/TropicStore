export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  ethylene: number;
  timestamp: string;
  chamberId: string;
}

export interface FruitBatch {
  id: string;
  fruitType: string;
  chamberId: string;
  freshnessDays: number;
  freshnessRisk: number;
  batchId: string;
  startDate: string;
}

export interface ThresholdSettings {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  ethyleneMin: number;
  ethyleneMax: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'resolved';
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  read: boolean;
  sensorType?: 'temperature' | 'humidity' | 'ethylene' | 'system';
}

export interface Device {
  id: string;
  name: string;
  type: 'hub' | 'sensor' | 'gateway';
  model: string;
  serialNumber: string;
  chamberId: string;
  connected: boolean;
  lastUpdated: string;
  sensors?: DeviceSensor[];
}

export interface DeviceSensor {
  id: string;
  name: string;
  type: 'ethylene' | 'temperature_humidity' | 'gateway';
  model: string;
  serialNumber: string;
  connected: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL?: string;
}

export interface NotificationSettings {
  pushAlerts: boolean;
  highEthylene: boolean;
  temperature: boolean;
  dailyReport: boolean;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly';
  time: string;
  deliveryMethod: 'push' | 'in_app' | 'both';
  lastReport?: string;
}

export interface Units {
  temperature: 'metric' | 'imperial';
  humidity: 'percentage';
  ethylene: 'ppm';
}

export interface HourlyData {
  hour: string;
  ethylene: number;
  temperature: number;
  humidity: number;
}

export interface MonitoringHistory {
  timestamp: string;
  data: SensorData[];
}

export type NavigationParamList = {
  Auth: undefined;
  Login: undefined;
  SignUp: undefined;
  ConfirmSignUp: { username: string };
  ForgotPassword: undefined;
  MainTabs: undefined;
  Profile: undefined;
  MonitoringThresholds: undefined;
  Notifications: undefined;
  ReportSchedule: undefined;
  Units: undefined;
  AboutTropicStore: undefined;
  ChamberSettings: undefined;
  DeviceDetail: { device: Device };
  AlertDetail: { alert: Alert };
};

// ============================================================
// Smart Fruit Ripening Chamber - back-end (API Gateway) types
// ============================================================

/** GET /chamber/latest - live sensor telemetry from DynamoDB */
export interface ChamberTelemetry {
  deviceId: string;
  timestamp?: number;
  temperature?: number | null;
  humidity?: number | null;
  dht_valid?: boolean;
  mq3_raw?: number | null;
  mq3_filtered?: number | null;
  mq3_ppm?: number | null;
  mq3_voltage?: number | null;
  mq3_rs?: number | null;
  mq3_ro?: number | null;
  mq3_calibrated?: boolean;
  mq3_warmed_up?: boolean;
  [key: string]: any;
}

/** A single historical telemetry point from GET /chamber/history */
export interface ChamberHistoryPoint {
  deviceId?: string;
  timestamp?: number;
  temperature?: number | null;
  humidity?: number | null;
  mq3_raw?: number | null;
  mq3_filtered?: number | null;
  mq3_ppm?: number | null;
  mq3_calibrated?: boolean;
  [key: string]: any;
}

/** Response shape of GET /chamber/history */
export interface ChamberHistoryResponse {
  count?: number;
  items?: ChamberHistoryPoint[];
}

/** Persistent target/settings values (desired shadow state) */
export interface ChamberSettings {
  targetTemperature?: number;
  temperatureTolerance?: number;
  targetHumidity?: number;
  humidityTolerance?: number;
  gasThresholdHigh?: number;
  gasThresholdLow?: number;
}

/** Reported actuator state from the ESP32 (reported shadow state) */
export interface ChamberActuators {
  mode?: 'AUTO' | 'MANUAL';
  targetTemperature?: number;
  temperatureTolerance?: number;
  targetHumidity?: number;
  humidityTolerance?: number;
  gasThresholdHigh?: number;
  gasThresholdLow?: number;
  peltier?: boolean;
  humidifier?: boolean;
  exhaust?: boolean;
  led?: boolean;
}

/** Classic unnamed Device Shadow returned by GET /chamber/state */
export interface ChamberState {
  state?: {
    desired?: ChamberSettings & { mode?: 'AUTO' | 'MANUAL'; led?: boolean };
    reported?: ChamberActuators;
  };
}

/** Control payload for POST /chamber/control (only 'mode' and 'led' are supported) */
export interface ChamberControl {
  mode?: 'AUTO' | 'MANUAL';
  led?: boolean;
}

/** Response from PUT /chamber/settings and POST /chamber/control */
export interface ChamberWriteResponse {
  message?: string;
  desired?: Record<string, any>;
  shadow?: Record<string, any>;
}

/** GET /health */
export interface HealthResponse {
  status?: string;
  service?: string;
}
