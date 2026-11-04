/* eslint-env jest */
// Jest setup: mock AWS Amplify so the render smoke test does not try to load
// the native @aws-amplify/react-native modules (netinfo, async-storage, etc.).
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));

jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: jest.fn(() =>
    Promise.reject(new Error('No current user')),
  ),
  fetchAuthSession: jest.fn(() =>
    Promise.reject(new Error('No session')),
  ),
  fetchUserAttributes: jest.fn(() => Promise.resolve({})),
  signIn: jest.fn(),
  signUp: jest.fn(),
  confirmSignUp: jest.fn(),
  resendSignUpCode: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
  resetPassword: jest.fn(),
  confirmResetPassword: jest.fn(),
}));
