import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { PrimaryButton } from '../../components/PrimaryButton';
import BrandLogo from '../../components/BrandLogo';
import { spacing, borderRadius } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { NavigationParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

type AuthNavigation = NativeStackNavigationProp<NavigationParamList>;

interface FormErrors {
  email?: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigation>();
  const { colors } = useTheme();
  const {
    resetPassword,
    confirmResetPassword,
    loading,
    error,
    clearError,
  } = useAuth();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const validateRequest = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_RE.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateReset = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!code.trim()) {
      nextErrors.code = 'Please enter the verification code';
    }
    if (!newPassword) {
      nextErrors.newPassword = 'New password is required';
    } else if (
      newPassword.length < 8 ||
      !/[a-z]/.test(newPassword) ||
      !/[A-Z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      nextErrors.newPassword =
        'Password must be at least 8 characters with uppercase, lowercase, a number, and a symbol';
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your new password';
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRequest = async () => {
    if (!validateRequest()) {
      return;
    }
    setSuccess(false);
    clearError();
    try {
      await resetPassword(email.trim());
      setStep('reset');
    } catch {
      // Error handled by useAuth hook
    }
  };

  const handleReset = async () => {
    if (!validateReset()) {
      return;
    }
    setSuccess(false);
    clearError();
    try {
      await confirmResetPassword(email.trim(), code.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch {
      // Error handled by useAuth hook
    }
  };

  return (
    <BackgroundDecor>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.header, { marginTop: spacing.xxxl * 2 }]}>
              <BrandLogo size={80} />
              <Text style={[styles.title, { color: colors.text }]}>
                {step === 'request' ? 'Reset Password' : 'Create New Password'}
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {step === 'request'
                  ? "Enter your email address and we'll send you a verification code."
                  : `Enter the verification code sent to ${email}, then choose a new password.`}
              </Text>
            </View>

            <View style={styles.formContainer}>
              {step === 'request' ? (
                <View style={styles.inputGroup}>
                  <View
                    style={[
                      styles.inputWrapper,
                      { borderColor: errors.email ? colors.red : colors.border },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={22}
                      color={colors.textTertiary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Email"
                      placeholderTextColor={colors.textTertiary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.errorText, { color: colors.red }]}>
                      {errors.email}
                    </Text>
                  )}
                </View>
              ) : (
                <View>
                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputWrapper,
                        { borderColor: errors.code ? colors.red : colors.border },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="form-textbox-password"
                        size={22}
                        color={colors.textTertiary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Verification code"
                        placeholderTextColor={colors.textTertiary}
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    {errors.code && (
                      <Text style={[styles.errorText, { color: colors.red }]}>
                        {errors.code}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          borderColor: errors.newPassword
                            ? colors.red
                            : colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={22}
                        color={colors.textTertiary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="New password"
                        placeholderTextColor={colors.textTertiary}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={
                            showPassword ? 'eye-off-outline' : 'eye-outline'
                          }
                          size={22}
                          color={colors.textTertiary}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.newPassword && (
                      <Text style={[styles.errorText, { color: colors.red }]}>
                        {errors.newPassword}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <View
                      style={[
                        styles.inputWrapper,
                        {
                          borderColor: errors.confirmPassword
                            ? colors.red
                            : colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={22}
                        color={colors.textTertiary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Confirm new password"
                        placeholderTextColor={colors.textTertiary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={
                            showConfirmPassword
                              ? 'eye-off-outline'
                              : 'eye-outline'
                          }
                          size={22}
                          color={colors.textTertiary}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={[styles.errorText, { color: colors.red }]}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {error && (
                <Text style={[styles.errorText, { color: colors.red }]}>
                  {error.message}
                </Text>
              )}

              {success && (
                <View
                  style={[
                    styles.successContainer,
                    { backgroundColor: colors.greenLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={colors.green}
                  />
                  <Text style={[styles.successText, { color: colors.green }]}>
                    Password reset successful! Signing you in...
                  </Text>
                </View>
              )}

              {step === 'request' ? (
                <PrimaryButton
                  title="Send Reset Code"
                  onPress={handleRequest}
                  loading={loading}
                  style={styles.resetButton}
                />
              ) : (
                <PrimaryButton
                  title="Reset Password"
                  onPress={handleReset}
                  loading={loading}
                  style={styles.resetButton}
                />
              )}

              {step === 'reset' && (
                <TouchableOpacity
                  onPress={() => {
                    setStep('request');
                    setCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setSuccess(false);
                    clearError();
                  }}
                  style={styles.backToRequest}
                >
                  <Text
                    style={[
                      styles.backToRequestText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Re-enter your email instead
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.backButton}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.backText, { color: colors.primary }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundDecor>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxxl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...textStyles.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...textStyles.body,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    padding: 0,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    marginTop: spacing.xs,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
    flex: 1,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
  backToRequest: {
    marginTop: spacing.lg,
  },
  backToRequestText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  footer: {
    marginTop: spacing.xxl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
});

export default ForgotPasswordScreen;
