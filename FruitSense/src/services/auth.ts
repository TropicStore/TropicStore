import {
  confirmResetPassword,
  confirmSignUp,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  resendSignUpCode,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from 'aws-amplify/auth';
import { cognitoConfigured } from '../constants/config';
import { User } from '../types';

export interface AuthErrorPayload {
  code: string;
  message: string;
}

export interface SignUpResult {
  username: string;
  userConfirmed: boolean;
}

// ------------------------------------------------------------------
// AWS Amplify wrapper.
//
// Authentication is handled directly against Cognito via AWS Amplify, which
// stores and auto-refreshes tokens internally. The app never writes the JWT or
// password to AsyncStorage itself.
// ------------------------------------------------------------------

function profileFromAttributes(
  currentUser: Awaited<ReturnType<typeof getCurrentUser>>,
  attributes: Awaited<ReturnType<typeof fetchUserAttributes>>,
): User {
  const fallbackEmail =
    attributes.email ??
    currentUser.signInDetails?.loginId ??
    currentUser.username;
  const localPart = String(fallbackEmail).split('@')[0] || 'TropicStore User';
  return {
    uid: attributes.sub ?? currentUser.userId ?? currentUser.username,
    email: fallbackEmail,
    displayName: attributes.name ?? fallbackEmail ?? localPart,
    phoneNumber: attributes.phone_number,
    photoURL: attributes.picture,
    createdAt: attributes.created_at ?? '',
  };
}

async function currentUserProfile(): Promise<User> {
  const currentUser = await getCurrentUser();
  const attributes = await fetchUserAttributes();
  return profileFromAttributes(currentUser, attributes);
}

async function currentAccessToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}

export async function register(
  email: string,
  password: string,
  displayName: string,
): Promise<SignUpResult> {
  if (!cognitoConfigured) {
    throw new AuthServiceError(
      'auth/not-configured',
      'Cognito is not configured yet. Set config.aws.cognito in src/constants/config.ts.',
    );
  }
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name: displayName,
      },
    },
  });
  return {
    username: email,
    userConfirmed: result.isSignUpComplete,
  };
}

export async function confirmRegistration(
  username: string,
  confirmationCode: string,
): Promise<void> {
  await confirmSignUp({ username, confirmationCode });
}

export async function resendRegistrationCode(username: string): Promise<void> {
  await resendSignUpCode({ username });
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ user: User; token: string | null }> {
  const result = await signIn({ username: email, password });
  if (!result.isSignedIn) {
    const step = result.nextStep.signInStep as string;
    if (step === 'CONFIRM_SIGN_UP_WITH_CODE') {
      throw new AuthServiceError(
        'UserNotConfirmedException',
        'Please confirm your email with the verification code we sent you.',
      );
    }
    throw new AuthServiceError(
      'auth/next-step-required',
      'Additional authentication steps are required. Please try again.',
    );
  }
  const [user, token] = await Promise.all([currentUserProfile(), currentAccessToken()]);
  return { user, token };
}

export async function signOutUser(): Promise<void> {
  await signOut();
}

export async function requestPasswordReset(email: string): Promise<void> {
  await resetPassword({ username: email });
}

export async function confirmPasswordReset(
  username: string,
  confirmationCode: string,
  newPassword: string,
): Promise<void> {
  await confirmResetPassword({ username, confirmationCode, newPassword });
}

export async function getAuthenticatedUser(): Promise<{
  user: User;
  token: string | null;
}> {
  const [user, token] = await Promise.all([currentUserProfile(), currentAccessToken()]);
  return { user, token };
}

export class AuthServiceError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
  }
}

interface CognitoErrorLike {
  name?: string;
  message?: string;
  code?: string;
  underlyingError?: { name?: string; message?: string };
}

export function mapAuthError(error: unknown): AuthErrorPayload {
  if (error instanceof AuthServiceError) {
    return { code: error.code, message: error.message };
  }

  const err = (error as CognitoErrorLike) ?? {};
  const name = err.name ?? err.code ?? 'auth/unknown';
  const message = err.message || 'An unexpected error occurred.';

  switch (name) {
    case 'UsernameExistsException':
      return {
        code: 'auth/email-already-in-use',
        message: 'An account with this email already exists. Please sign in.',
      };
    case 'UserNotConfirmedException':
      return {
        code: 'auth/user-not-confirmed',
        message: 'Please confirm your email with the verification code we sent you.',
      };
    case 'CodeMismatchException':
    case 'ExpiredCodeException':
      return {
        code: 'auth/invalid-code',
        message:
          name === 'CodeMismatchException'
            ? 'The code you entered is incorrect.'
            : 'That code has expired. Please request a new one.',
      };
    case 'InvalidPasswordException':
      return {
        code: 'auth/weak-password',
        message: message || 'Password does not meet the required policy.',
      };
    case 'NotAuthorizedException':
      return {
        code: 'auth/invalid-credential',
        message: 'Incorrect email or password.',
      };
    case 'UserNotFoundException':
      return {
        code: 'auth/user-not-found',
        message: 'No account found with this email address.',
      };
    case 'PasswordResetRequiredException':
      return {
        code: 'auth/password-reset-required',
        message: 'You must reset your password before signing in.',
      };
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return {
        code: 'auth/too-many-requests',
        message: 'Too many attempts. Please try again later.',
      };
    case 'InvalidParameterException':
      return {
        code: 'auth/invalid-input',
        message: message || 'Please check the details you entered.',
      };
    case 'NetworkError':
      return {
        code: 'auth/network-request-failed',
        message: 'Network error. Check your connection.',
      };
    default:
      return { code: 'auth/unknown', message };
  }
}

export default {
  register,
  confirmRegistration,
  resendRegistrationCode,
  signInWithPassword,
  signOutUser,
  requestPasswordReset,
  confirmPasswordReset,
  getAuthenticatedUser,
  mapAuthError,
  AuthServiceError,
};
