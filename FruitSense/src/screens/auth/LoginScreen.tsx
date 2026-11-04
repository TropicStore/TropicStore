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
  password?: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigation>();
  const { colors } = useTheme();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (err) {
      if ((err as { code?: string })?.code === 'UserNotConfirmedException') {
        navigation.navigate('ConfirmSignUp', { username: email.trim() });
      }
      // Otherwise the error is shown by the useAuth hook.
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
            <View style={[styles.logoContainer, { marginTop: spacing.xxxl * 2 }]}>
              <BrandLogo size={96} />
              <Text style={[styles.title, { color: colors.primary }]}>
                TropicStore
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
              >
                Smart Fruit Preservation Monitor
              </Text>
            </View>

            <View style={styles.formContainer}>
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

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: errors.password ? colors.red : colors.border },
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
                    placeholder="Password"
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={[styles.errorText, { color: colors.red }]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {error && (
                <Text style={[styles.errorText, { color: colors.red }]}>
                  {error.message}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotContainer}
              >
                <Text style={[styles.forgotText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                title="Login"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
              />
            </View>

            <View style={styles.footer}>
              <Text
                style={[
                  styles.footerText,
                  { color: colors.textSecondary },
                ]}
              >
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={[styles.signUpText, { color: colors.primary }]}>
                  Sign Up
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
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    ...textStyles.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: spacing.xxxl,
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  loginButton: {
    marginBottom: spacing.xxl,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
  },
  signUpText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

export default LoginScreen;
