import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import { config } from '../constants/config';
import {
  ChamberTelemetry,
  ChamberHistoryResponse,
  ChamberState,
  ChamberSettings,
  ChamberControl,
  ChamberWriteResponse,
  HealthResponse,
} from '../types';

const REQUEST_TIMEOUT_MS = 15000;

// ------------------------------------------------------------------
// API Gateway HTTP API client.
//
// The React app talks ONLY to API Gateway (FruitChamberHTTPAPI) over
// HTTPS. It never connects to AWS IoT Core directly and never embeds
// AWS access keys or IoT certificates.
//
// A request interceptor is provided so an `Authorization: Bearer <JWT>`
// header can be added later when Amazon Cognito is enabled, without
// rewriting the rest of the application.
// ------------------------------------------------------------------
const httpClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authTokenProvider: (() => Promise<string | null>) | null = null;

/**
 * Register a token provider for future authenticated calls (e.g. Cognito).
 * When no provider is set, requests are sent unauthenticated.
 */
export function setAuthTokenProvider(
  provider: (() => Promise<string | null>) | null,
): void {
  authTokenProvider = provider;
}

httpClient.interceptors.request.use(
  async (requestConfig: InternalAxiosRequestConfig) => {
    if (authTokenProvider) {
      const token = await authTokenProvider();
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return requestConfig;
  },
  (error: AxiosError) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      throw new Error(
        'Network request failed. Please check your connection to the cloud backend.',
      );
    }

    const status = error.response.status;
    const message =
      (error.response.data as { message?: string } | undefined)?.message ||
      error.message;

    switch (status) {
      case 400:
        throw new Error(`Bad request: ${message}`);
      case 401:
        throw new Error('Unauthorized. Please sign in again.');
      case 403:
        throw new Error('Access denied.');
      case 404:
        throw new Error('Requested resource not found on the cloud backend.');
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        throw new Error('Cloud server error. Please try again later.');
      default:
        throw new Error(`Request failed: ${message}`);
    }
  },
);

async function request<T>(options: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.request<T>(options);
  return response.data;
}

export const ChamberApi = {
  // Diagnostics - not intended for constant polling.
  getHealth(): Promise<HealthResponse> {
    return request<HealthResponse>({ method: 'GET', url: '/health' });
  },

  // Latest live sensor telemetry.
  getLatestTelemetry(): Promise<ChamberTelemetry> {
    return request<ChamberTelemetry>({
      method: 'GET',
      url: '/chamber/latest',
    });
  },

  // Historical telemetry for charts.
  getHistory(limit = 50): Promise<ChamberHistoryResponse> {
    return request<ChamberHistoryResponse>({
      method: 'GET',
      url: `/chamber/history?limit=${encodeURIComponent(limit)}`,
    });
  },

  // Device Shadow (desired + reported).
  getChamberState(): Promise<ChamberState> {
    return request<ChamberState>({
      method: 'GET',
      url: '/chamber/state',
    });
  },

  // Update persistent target settings via the Device Shadow.
  updateSettings(settings: Partial<ChamberSettings>): Promise<ChamberWriteResponse> {
    return request<ChamberWriteResponse>({
      method: 'PUT',
      url: '/chamber/settings',
      data: settings,
    });
  },

  // Send supported user controls (mode / led).
  updateControl(control: Partial<ChamberControl>): Promise<ChamberWriteResponse> {
    return request<ChamberWriteResponse>({
      method: 'POST',
      url: '/chamber/control',
      data: control,
    });
  },
};

export default ChamberApi;
