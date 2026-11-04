import { useState, useCallback } from 'react';
import {
  mapAuthError,
  register as registerUser,
  confirmRegistration,
  resendRegistrationCode,
  signInWithPassword,
  signOutUser,
  requestPasswordReset,
  confirmPasswordReset,
} from '../services/auth';
import { useStore } from '../store';
import { User } from '../types';

export interface AuthError {
  code: string;
  message: string;
}

export interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ username: string }>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendCode: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<void>;
  loading: boolean;
  error: AuthError | null;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const { login: storeLogin, logout: storeLogout } = useStore();

  const applySession = useCallback(
    async (user: User, token: string | null) => {
      storeLogin(user, token);
    },
    [storeLogin],
  );

  const withErrorHandling = useCallback(
    async <T,>(operation: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const result = await operation();
        return result;
      } catch (err) {
        setError(mapAuthError(err));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const login = useCallback(
    (email: string, password: string) =>
      withErrorHandling(async () => {
        const { user, token } = await signInWithPassword(email, password);
        await applySession(user, token);
      }),
    [withErrorHandling, applySession],
  );

  const signUp = useCallback(
    (email: string, password: string, displayName: string) =>
      withErrorHandling(async () => {
        const result = await registerUser(email, password, displayName);
        return { username: result.username };
      }),
    [withErrorHandling],
  );

  const confirmSignUp = useCallback(
    (username: string, code: string) =>
      withErrorHandling(async () => {
        await confirmRegistration(username, code);
      }),
    [withErrorHandling],
  );

  const resendCode = useCallback(
    (username: string) =>
      withErrorHandling(async () => {
        try {
          await resendRegistrationCode(username);
        } catch (err) {
          setError(mapAuthError(err));
          throw err;
        }
      }),
    [withErrorHandling, setError],
  );

  const logout = useCallback(
    () =>
      withErrorHandling(async () => {
        try {
          await signOutUser();
        } catch {
          // Already signed out or token invalid - still clear local state.
        }
        storeLogout();
      }),
    [withErrorHandling, storeLogout],
  );

  const resetPassword = useCallback(
    (email: string) =>
      withErrorHandling(async () => {
        await requestPasswordReset(email);
      }),
    [withErrorHandling],
  );

  const confirmResetPassword = useCallback(
    (email: string, code: string, newPassword: string) =>
      withErrorHandling(async () => {
        await confirmPasswordReset(email, code, newPassword);
      }),
    [withErrorHandling],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    signUp,
    confirmSignUp,
    resendCode,
    logout,
    resetPassword,
    confirmResetPassword,
    loading,
    error,
    clearError,
  };
}
