import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BrandLogo from '../../components/BrandLogo';
import { spacing } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { useTheme } from '../../context/ThemeContext';

export const SplashScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BrandLogo size={96} />
      <Text style={[styles.brand, { color: colors.primary }]}>TropicStore</Text>
      <Text style={[styles.tagline, { color: colors.textSecondary }]}>
        Smart Fruit Ripening Chamber
      </Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  brand: {
    ...textStyles.h1,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...textStyles.body,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  spinner: {
    marginTop: spacing.xl,
  },
});

export default SplashScreen;
