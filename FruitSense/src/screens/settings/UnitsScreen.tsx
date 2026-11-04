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
import { spacing, borderRadius } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { useStore } from '../../store';

export default function UnitsScreen() {
  const navigation = useNavigation();
  const units = useStore((s) => s.units);
  const updateUnits = useStore((s) => s.updateUnits);

  const isMetric = units.temperature === 'metric';

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
          <Text style={styles.headerTitle}>Units</Text>
          <View style={styles.backButton} />
        </View>

        {/* Temperature */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Icon name="thermometer" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardLabel}>TEMPERATURE</Text>
          </View>
          <View style={styles.unitRow}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                isMetric && styles.unitButtonActive,
              ]}
              onPress={() => updateUnits({ temperature: 'metric' })}
              activeOpacity={0.7}
            >
              <View style={styles.unitButtonContent}>
                <View
                  style={[
                    styles.radioOuter,
                    isMetric && styles.radioOuterActive,
                  ]}
                >
                  {isMetric && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text
                    style={[
                      styles.unitButtonText,
                      isMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    Metric
                  </Text>
                  <Text style={styles.unitSubtext}>°C, °F</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unitButton,
                !isMetric && styles.unitButtonActive,
              ]}
              onPress={() => updateUnits({ temperature: 'imperial' })}
              activeOpacity={0.7}
            >
              <View style={styles.unitButtonContent}>
                <View
                  style={[
                    styles.radioOuter,
                    !isMetric && styles.radioOuterActive,
                  ]}
                >
                  {!isMetric && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text
                    style={[
                      styles.unitButtonText,
                      !isMetric && styles.unitButtonTextActive,
                    ]}
                  >
                    Imperial
                  </Text>
                  <Text style={styles.unitSubtext}>°F</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Humidity */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Icon name="water-percent" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardLabel}>HUMIDITY</Text>
          </View>
          <View style={styles.fixedUnitRow}>
            <View style={styles.fixedIconWrap}>
              <Icon name="water-percent" size={22} color={Colors.primary} />
            </View>
            <View style={styles.fixedTextWrap}>
              <Text style={styles.fixedUnitTitle}>Percentage (%)</Text>
              <Text style={styles.fixedUnitSubtitle}>
                Humidity is always displayed as a percentage
              </Text>
            </View>
            <View style={styles.fixedBadge}>
              <Text style={styles.fixedBadgeText}>%</Text>
            </View>
          </View>
        </View>

        {/* Ethylene */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Icon name="flask" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardLabel}>ETHYLENE</Text>
          </View>
          <View style={styles.fixedUnitRow}>
            <View style={[styles.fixedIconWrap, { backgroundColor: Colors.orangeLight }]}>
              <Icon name="flask" size={22} color={Colors.orange} />
            </View>
            <View style={styles.fixedTextWrap}>
              <Text style={styles.fixedUnitTitle}>Parts Per Million (PPM)</Text>
              <Text style={styles.fixedUnitSubtitle}>
                Ethylene concentration is measured in PPM
              </Text>
            </View>
            <View style={[styles.fixedBadge, { backgroundColor: Colors.orangeLight }]}>
              <Text style={[styles.fixedBadgeText, { color: Colors.orange }]}>ppm</Text>
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.card}>
          <View style={styles.cardLabelRow}>
            <Icon name="eye-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardLabel}>PREVIEW</Text>
          </View>
          <View style={styles.previewRow}>
            <View style={[styles.previewChip, { backgroundColor: Colors.blueLight }]}>
              <Text style={styles.previewValue}>12.4</Text>
              <Text style={[styles.previewUnit, { color: Colors.blue }]}>°C</Text>
            </View>
            <View style={[styles.previewChip, { backgroundColor: Colors.primaryVeryLight }]}>
              <Text style={styles.previewValue}>68</Text>
              <Text style={[styles.previewUnit, { color: Colors.primary }]}>%</Text>
            </View>
            <View style={[styles.previewChip, { backgroundColor: Colors.orangeLight }]}>
              <Text style={styles.previewValue}>2.8</Text>
              <Text style={[styles.previewUnit, { color: Colors.orange }]}>ppm</Text>
            </View>
          </View>
          <Text style={styles.previewHint}>
            Sample reading with current unit preferences
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  card: {
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
  cardLabel: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    letterSpacing: 1,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  unitButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.grayLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  unitButtonActive: {
    backgroundColor: Colors.primaryVeryLight,
    borderColor: Colors.primary,
  },
  unitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  unitButtonText: {
    ...textStyles.body,
    color: Colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  unitButtonTextActive: {
    color: Colors.primary,
    fontWeight: fontWeight.semibold,
  },
  unitSubtext: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  fixedUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  fixedTextWrap: {
    flex: 1,
  },
  fixedUnitTitle: {
    ...textStyles.body,
    color: Colors.textPrimary,
    fontWeight: fontWeight.semibold,
  },
  fixedUnitSubtitle: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fixedBadge: {
    backgroundColor: Colors.primaryVeryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  fixedBadgeText: {
    ...textStyles.label,
    color: Colors.primary,
    fontWeight: fontWeight.bold,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  previewValue: {
    ...textStyles.h3,
    color: Colors.textPrimary,
  },
  previewUnit: {
    ...textStyles.bodySmall,
    fontWeight: fontWeight.medium,
  },
  previewHint: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
