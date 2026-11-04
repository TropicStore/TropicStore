import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import BrandLogo from '../../components/BrandLogo';
import { spacing, borderRadius } from '../../constants/spacing';
import { fontWeight, textStyles } from '../../constants/typography';

export default function AboutTropicStoreScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.backButton} />
        </View>

        {/* Logo & Title */}
        <View style={styles.heroSection}>
          <BrandLogo size={100} style={styles.logoCircle} />
          <Text style={styles.appName}>TropicStore</Text>
          <Text style={styles.appSubtitle}>
            Smart fruit preservation monitoring
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <InfoRow label="Version" value="1.0.0" />
          <View style={styles.infoDivider} />
          <InfoRow label="Platform" value="Mobile" />
          <View style={styles.infoDivider} />
          <InfoRow
            label="Monitoring"
            value="Temperature • Humidity • Ethylene"
          />
          <View style={styles.infoDivider} />
          <InfoRow label="Report interval" value="Hourly" />
        </View>

        {/* Links */}
        <View style={styles.linksCard}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconWrap, { backgroundColor: Colors.blueLight }]}>
                <Icon name="shield-lock-outline" size={22} color={Colors.blue} />
              </View>
              <Text style={styles.linkText}>Privacy & Terms</Text>
            </View>
            <Icon name="chevron-right" size={22} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2026 TropicStore
          </Text>
          <Text style={styles.copyrightSubtext}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    color: Colors.textPrimary,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  logoCircle: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appName: {
    ...textStyles.h1,
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    ...textStyles.body,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...textStyles.body,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...textStyles.body,
    color: Colors.textPrimary,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.lg,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  linksCard: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    ...textStyles.body,
    color: Colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  copyrightText: {
    ...textStyles.bodySmall,
    color: Colors.textTertiary,
  },
  copyrightSubtext: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
