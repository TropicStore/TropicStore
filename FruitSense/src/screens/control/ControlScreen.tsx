import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useChamberState } from '../../hooks/useChamberState';
import { useChamberData } from '../../hooks/useChamberData';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius, layout } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { CloudStatusBadge } from '../../components/CloudStatusBadge';
import { SHADOW } from '../../utils/shadow';
import { formatNumber } from '../../utils/format';

function StatusPill({
  label,
  value,
  activeColor,
}: {
  label: string;
  value: boolean | undefined;
  activeColor: string;
}) {
  const isOn = value === true;
  const color = isOn ? activeColor : Colors.textTertiary;
  const bg = isOn ? activeColor + '22' : Colors.grayLight;

  return (
    <View style={[styles.statusItem, { backgroundColor: bg }]}>
      <Icon name={isOn ? 'power' : 'power-off'} size={18} color={color} />
      <View style={styles.statusTextWrap}>
        <Text style={[styles.statusLabel, { color }]}>{label}</Text>
        <Text style={[styles.statusValue, { color }]}>
          {value === undefined ? '--' : isOn ? 'ON' : 'OFF'}
        </Text>
      </View>
    </View>
  );
}

export default function ControlScreen() {
  const {
    state,
    loading,
    error: stateError,
    controlStatus,
    controlError,
    setMode,
    setLed,
    clearControl,
  } = useChamberState();
  const { telemetry, cloudStatus } = useChamberData();

  const reported = SHADOW.reported(state);
  const desired = SHADOW.desired(state);
  const mode = reported.mode ?? (desired.mode as 'AUTO' | 'MANUAL' | undefined);
  const led = reported.led;

  const currentTemp = telemetry?.temperature;
  const currentHumidity = telemetry?.humidity;

  const handleModeSelect = async (nextMode: 'AUTO' | 'MANUAL') => {
    if (controlStatus === 'saving' || mode === nextMode) {
      return;
    }
    await setMode(nextMode);
  };

  const handleLedToggle = async () => {
    if (controlStatus === 'saving') {
      return;
    }
    const next = led !== true;
    await setLed(next);
  };

  const isSaving = controlStatus === 'saving';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackgroundDecor />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chamber Control</Text>
          <CloudStatusBadge status={cloudStatus} connectedLabel="CLOUD" />
        </View>

        {stateError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{stateError}</Text>
          </View>
        ) : null}

        {loading && !state ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Loading chamber state…</Text>
          </View>
        ) : (
          <>
            {/* Live readings */}
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <Icon name="eye-outline" size={16} color={Colors.textTertiary} />
                <Text style={styles.cardLabel}>LIVE READINGS</Text>
              </View>
              <View style={styles.readingsRow}>
                <View style={styles.reading}>
                  <Text style={styles.readingValue}>{formatNumber(currentTemp, 1)}°C</Text>
                  <Text style={styles.readingLabel}>Temperature</Text>
                </View>
                <View style={styles.reading}>
                  <Text style={styles.readingValue}>{formatNumber(currentHumidity, 0)}%</Text>
                  <Text style={styles.readingLabel}>Humidity</Text>
                </View>
              </View>
            </View>

            {/* Mode */}
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <Icon name="swap-horizontal" size={16} color={Colors.textTertiary} />
                <Text style={styles.cardLabel}>OPERATION MODE</Text>
              </View>
              <View style={styles.modeRow}>
                {(['AUTO', 'MANUAL'] as const).map((m) => {
                  const active = mode === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.modeButton,
                        active && styles.modeButtonActive,
                      ]}
                      activeOpacity={0.8}
                      disabled={isSaving}
                      onPress={() => handleModeSelect(m)}
                    >
                      <Icon
                        name={m === 'AUTO' ? 'autorenew' : 'gesture-tap-button'}
                        size={20}
                        color={active ? Colors.white : Colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.modeButtonText,
                          active && styles.modeButtonTextActive,
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.cardHint}>
                {mode === 'MANUAL'
                  ? 'Manual mode: the ESP32 relies on its local manual/auto handling.'
                  : 'Auto mode: the ESP32 adjusts actuators to keep the chamber within the target settings.'}
              </Text>
            </View>

            {/* LED */}
            <View style={styles.card}>
              <View style={styles.ledRow}>
                <View style={styles.ledTextWrap}>
                  <View style={styles.ledTitleRow}>
                    <Icon name="led-strip-variant" size={18} color={Colors.textPrimary} />
                    <Text style={styles.ledTitle}>LED Strip</Text>
                  </View>
                  <Text style={styles.ledSubtitle}>
                    Note: the ESP32 turns the LED off automatically after 5 minutes.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.ledButton,
                    led === true && styles.ledButtonOn,
                  ]}
                  activeOpacity={0.8}
                  disabled={isSaving}
                  onPress={handleLedToggle}
                >
                  <Icon
                    name={led === true ? 'lightbulb-on' : 'lightbulb-off-outline'}
                    size={20}
                    color={led === true ? Colors.orange : Colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.ledButtonText,
                      led === true && styles.ledButtonTextOn,
                    ]}
                  >
                    {led === true ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reported actuator states */}
            <View style={styles.card}>
              <View style={styles.cardLabelRow}>
                <Icon name="cpu" size={16} color={Colors.textTertiary} />
                <Text style={styles.cardLabel}>ACTUATOR STATUS (REPORTED)</Text>
              </View>
              <View style={styles.statusWrap}>
                <StatusPill label="Peltier" value={reported.peltier} activeColor={Colors.blue} />
                <StatusPill label="Mist Maker" value={reported.humidifier} activeColor={Colors.primary} />
                <StatusPill label="Exhaust Fan" value={reported.exhaust} activeColor={Colors.orange} />
                <StatusPill label="LED Strip" value={reported.led} activeColor={Colors.green} />
              </View>
              <Text style={styles.cardHint}>
                States shown are what the ESP32 reports in its device shadow.
                Mist maker status is the ESP32 expected state, not a physical sensor.
              </Text>
            </View>

            {/* Feedback */}
            {controlStatus === 'success' ? (
              <View style={styles.successBanner}>
                <Icon name="check-circle" size={18} color={Colors.green} />
                <Text style={styles.successText}>Command accepted by the cloud.</Text>
              </View>
            ) : null}
            {controlStatus === 'error' && controlError ? (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={18} color={Colors.red} />
                <Text style={styles.errorText}>{controlError}</Text>
              </View>
            ) : null}
            {controlStatus !== 'idle' ? (
              <TouchableOpacity onPress={clearControl} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Dismiss</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
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
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.pageHorizontalPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: Colors.textPrimary,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.redLight,
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: Colors.red,
    flex: 1,
  },

  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  loadingText: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.lg,
    padding: spacing.xl,
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
    letterSpacing: 1.5,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.lg,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  cardHint: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    marginTop: spacing.md,
    lineHeight: 16,
  },

  readingsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  reading: {
    flex: 1,
    backgroundColor: Colors.grayLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  readingValue: {
    ...textStyles.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  readingLabel: {
    ...textStyles.caption,
    color: Colors.textSecondary,
  },

  modeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.grayLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modeButtonText: {
    ...textStyles.label,
    color: Colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  modeButtonTextActive: {
    color: Colors.white,
  },

  ledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ledTextWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  ledTitle: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ledTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  ledSubtitle: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  ledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.grayLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ledButtonOn: {
    backgroundColor: Colors.orangeLight,
    borderColor: Colors.orange,
  },
  ledButtonText: {
    ...textStyles.label,
    color: Colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  ledButtonTextOn: {
    color: Colors.orange,
  },

  statusWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minWidth: '46%',
    flexGrow: 1,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusLabel: {
    ...textStyles.caption,
    fontWeight: fontWeight.medium,
  },
  statusValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.greenLight,
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  successText: {
    ...textStyles.bodySmall,
    color: Colors.green,
    flex: 1,
  },

  clearButton: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  clearButtonText: {
    ...textStyles.label,
    color: Colors.textTertiary,
  },
});
