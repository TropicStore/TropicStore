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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { PrimaryButton } from '../../components/PrimaryButton';
import BrandLogo from '../../components/BrandLogo';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { NavigationParamList } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

type Navigation = NativeStackNavigationProp<NavigationParamList>;
type Route = RouteProp<NavigationParamList, 'ConfirmSignUp'>;

const ConfirmSignUpScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const { colors } = useTheme();
  const { confirmSignUp, resendCode, loading, error, clearError } = useAuth();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>(undefined);
  const [resent, setResent] = useState(false);

  const username = params?.username ?? '';

  const handleConfirm = async () => {
    if (!code.trim()) {
      setCodeError('Please enter the verification code');
      return;
    }
    setCodeError(undefined);
    clearError();
    try {
      await confirmSignUp(username, code.trim());
      navigation.navigate('Login');
    } catch {
      // Error handled by useAuth hook
    }
  };

  const handleResend = async () => {
    setResent(false);
    clearError();
    try {
      await resendCode(username);
      setResent(true);
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
                Verify your Email
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                We sent a verification code to{' '}
                <Text style={styles.emailHighlight}>
                  {username}
                </Text>
                . Enter it below to activate your account.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: codeError ? colors.red : colors.border },
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
                    maxLength={8}
                  />
                </View>
                {codeError && (
                  <Text style={[styles.errorText, { color: colors.red }]}>
                    {codeError}
                  </Text>
                )}
              </View>

              {error && (
                <Text style={[styles.errorText, { color: colors.red }]}>
                  {error.message}
                </Text>
              )}

              {resent && (
                <Text style={[styles.successText, { color: colors.green }]}>
                  A new verification code has been sent.
                </Text>
              )}

              <PrimaryButton
                title="Verify Email"
                onPress={handleConfirm}
                loading={loading}
                style={styles.confirmButton}
              />

              <View style={styles.resendRow}>
                <Text
                  style={{
                    fontSize: fontSize.sm,
                    color: colors.textSecondary,
                  }}
                >
                  Didn't receive the code?{' '}
                </Text>
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text
                    style={[
                      styles.resendText,
                      { color: loading ? colors.textTertiary : colors.primary },
                    ]}
                  >
                    Resend code
                  </Text>
                </TouchableOpacity>
              </View>
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
  emailHighlight: {
    color: Colors.primary,
    fontWeight: fontWeight.semibold,
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
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    marginTop: spacing.xs,
  },
  successText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
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

export default ConfirmSignUpScreen;
