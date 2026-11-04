import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { config, cognitoConfigured } from '../constants/config';
import { setAuthTokenProvider } from './chamberApi';

// ------------------------------------------------------------------
// AWS Amplify (Cognito) configuration.
//
// Imported from the app entry point (index.js) so it runs before any
// auth/API calls. Values are public configuration - never put AWS keys here.
// ------------------------------------------------------------------
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: config.aws.cognito.userPoolId,
      userPoolClientId: config.aws.cognito.userPoolClientId,
      loginWith: {
        email: true,
      },
    },
  },
});

// Attach the Cognito access token to every protected API Gateway request.
// Amplify handles token refresh internally, so the provider simply reads the
// current (possibly refreshed) session at request time. Returns null when the
// user is not signed in, so /health and demo mode remain unauthenticated.
async function cognitoTokenProvider(): Promise<string | null> {
  if (!cognitoConfigured) {
    return null;
  }
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    return token ?? null;
  } catch {
    return null;
  }
}

setAuthTokenProvider(cognitoTokenProvider);

export default Amplify;
