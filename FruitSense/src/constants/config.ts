export const config = {
  // ------------------------------------------------------------------
  // AWS API Gateway HTTP API (FruitChamberHTTPAPI) base URL.
  //
  // The React app talks ONLY to API Gateway over HTTPS.
  // Replace with the real invoke URL, e.g.:
  //   'https://<api-id>.execute-api.ap-southeast-1.amazonaws.com'
  // Do NOT add a trailing slash.
  // Never place AWS access keys / IoT certificates / private keys here.
  // ------------------------------------------------------------------
  apiBaseUrl: 'https://wxc5pvde9b.execute-api.ap-southeast-1.amazonaws.com',

  // Device id stored as the DynamoDB partition key (deviceId).
  deviceId: 'chamber01',

  // Polling intervals (ms) for the cloud dashboard.
  telemetryRefreshMs: 5000,
  stateRefreshMs: 5000,
  historyRefreshMs: 30000,

  aws: {
    region: 'ap-southeast-1',
    cognito: {
      // Amazon Cognito user pool settings used by AWS Amplify.
      // These are public configuration values, not secret credentials.
      // Replace with your real pool values (Cognito -> User pools -> your pool).
      userPoolId: 'ap-southeast-1_M0TcNpAO7', // e.g. ap-southeast-1_ABC123456
      userPoolClientId: '7mjktmbrmljls874gcn0012jim', // the app-client ID (audience)
    },
    dynamoDb: {
      sensorDataTable: 'FruitChamberTelemetry',
      deviceTable: 'FruitSense-Devices',
      userTable: 'FruitSense-Users',
      alertTable: 'FruitSense-Alerts',
      batchTable: 'FruitSense-Batches',
    },
  },

  refreshInterval: 5000,
  chartHours: 24,
  gatherDataPoints: 12,

  storage: {
    userToken: '@fruitsense:user_token',
    refreshToken: '@fruitsense:refresh_token',
    notificationSettings: '@fruitsense:notification_settings',
    unitPreference: '@fruitsense:unit_preference',
    reportSchedule: '@fruitsense:report_schedule',
    lastSync: '@fruitsense:last_sync',
  },

  validation: {
    temperatureRange: { min: -20, max: 60 },
    humidityRange: { min: 0, max: 100 },
    ethyleneRange: { min: 0, max: 100 },
    maxBatchNameLength: 100,
    maxAlertsPerPage: 50,
  },

  defaults: {
    temperature: { min: 0, max: 8 },
    humidity: { min: 85, max: 95 },
    ethylene: { min: 0, max: 1 },
    reportFrequency: 'daily' as const,
    reportTime: '08:00',
    reportDeliveryMethod: 'both' as const,
  },
} as const;

// True while the real API Gateway URL is not configured yet. When true the app
// falls back to a built-in demo backend (simulated chamber data + local login)
// so every screen works without AWS. Set apiBaseUrl above and this switches to
// real DynamoDB-backed endpoints automatically.
export const backendConfigured = !config.apiBaseUrl.includes('YOUR_API_ID');

// True when real Cognito pool values have been set in config.aws.cognito.
// While false the app refuses auth calls instead of hitting an invalid pool.
export const cognitoConfigured =
  !config.aws.cognito.userPoolId.startsWith('YOUR_') &&
  !config.aws.cognito.userPoolClientId.startsWith('YOUR_');
