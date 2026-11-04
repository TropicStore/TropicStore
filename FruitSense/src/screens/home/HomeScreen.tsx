import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle, G, Text as SvgText } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from '../../store';
import { useChamberData } from '../../hooks/useChamberData';
import { useChamberState } from '../../hooks/useChamberState';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius, layout } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { CloudStatusBadge } from '../../components/CloudStatusBadge';
import {
  formatNumber,
  gasReadingValue,
  gasUnit,
  gasStateLabel,
} from '../../utils/format';
import { SHADOW } from '../../utils/shadow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = SCREEN_WIDTH * 0.52;
const GAUGE_STROKE = 12;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

interface GasStatus {
  label: string;
  color: string;
  bg: string;
}

function getGasStatus(value: number, low: number, high: number): GasStatus {
  if (value >= high) {
    return { label: 'HIGH', color: Colors.red, bg: Colors.redLight };
  }
  if (value <= low) {
    return { label: 'LOW', color: Colors.green, bg: Colors.greenLight };
  }
  return { label: 'NORMAL', color: Colors.orange, bg: Colors.orangeLight };
}

function GasGauge({
  value,
  oxygenMax,
  unit,
}: {
  value: number;
  oxygenMax: number;
  unit: string;
}) {
  const progress = Math.min(value / oxygenMax, 1);
  const strokeDashoffset = GAUGE_CIRCUMFERENCE * (1 - progress * 0.75);

  return (
    <View style={gaugeStyles.container}>
      <Svg
        width={GAUGE_SIZE}
        height={GAUGE_SIZE}
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
      >
        <G rotation="-90" origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}>
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={GAUGE_RADIUS}
            stroke={Colors.border}
            strokeWidth={GAUGE_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${GAUGE_CIRCUMFERENCE * 0.75} ${GAUGE_CIRCUMFERENCE * 0.25}`}
          />
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={GAUGE_RADIUS}
            stroke={Colors.primary}
            strokeWidth={GAUGE_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${GAUGE_CIRCUMFERENCE * 0.75} ${GAUGE_CIRCUMFERENCE * 0.25}`}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
        <SvgText
          x={GAUGE_SIZE / 2}
          y={GAUGE_SIZE / 2 - 8}
          textAnchor="middle"
          fontSize={fontSize.xxxl}
          fontWeight={fontWeight.bold}
          fill={Colors.textPrimary}
        >
          {formatNumber(value, 0)}
        </SvgText>
        <SvgText
          x={GAUGE_SIZE / 2}
          y={GAUGE_SIZE / 2 + 16}
          textAnchor="middle"
          fontSize={fontSize.sm}
          fontWeight={fontWeight.medium}
          fill={Colors.textSecondary}
        >
          {unit}
        </SvgText>
      </Svg>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
});

function SensorCard({
  iconName,
  label,
  value,
  unit,
  tint,
  iconColor,
}: {
  iconName: string;
  label: string;
  value: string;
  unit: string;
  tint: string;
  iconColor: string;
}) {
  return (
    <View style={[styles.sensorCard, { backgroundColor: tint }]}>
      <View style={[styles.sensorIconWrap, { backgroundColor: iconColor + '20' }]}>
        <Icon name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.sensorValue}>
        {value}
        <Text style={styles.sensorUnit}> {unit}</Text>
      </Text>
      <Text style={styles.sensorLabel}>{label}</Text>
    </View>
  );
}

function ActuatorChip({
  iconName,
  label,
  value,
  activeColor,
}: {
  iconName: string;
  label: string;
  value: boolean | undefined;
  activeColor: string;
}) {
  const isOn = value === true;
  const color = isOn ? activeColor : Colors.textTertiary;
  const bg = isOn ? activeColor + '20' : Colors.grayLight;
  return (
    <View style={[styles.actuatorChip, { backgroundColor: bg }]}>
      <Icon name={iconName} size={14} color={color} />
      <Text style={[styles.actuatorLabel, { color }]}>
        {label} {value === undefined ? '--' : isOn ? 'ON' : 'OFF'}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const {
    telemetry,
    telemetryLoading,
    telemetryError,
    cloudStatus,
    lastUpdated,
  } = useChamberData();
  const { state, error: stateError } = useChamberState();
  const user = useStore((s) => s.user);

  const greeting = useMemo(() => getGreeting(), []);

  const reported = SHADOW.reported(state);
  const desired = SHADOW.desired(state);

  const temperature = telemetry?.temperature ?? undefined;
  const humidity = telemetry?.humidity ?? undefined;
  const gas = gasReadingValue(telemetry);
  const gasUnitLabel = gasUnit(telemetry);
  const gasState = gasStateLabel(telemetry);

  const gasHigh = (desired.gasThresholdHigh ?? reported.gasThresholdHigh) ?? 500;
  const gasLow = (desired.gasThresholdLow ?? reported.gasThresholdLow) ?? 200;

  const gasMax = telemetry?.mq3_calibrated ? 10 : 3000;
  const gasStatus =
    gas != null && gasState !== 'Warming up'
      ? getGasStatus(gas, gasLow, gasHigh)
      : { label: gasState ?? 'GAS', color: Colors.orange, bg: Colors.orangeLight };

  const mode = reported.mode ?? desired.mode;

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const connectionError = telemetryError || stateError;

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
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>
              {user?.displayName ?? 'User'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.chamberBadge}>
              <View style={styles.chamberDot} />
              <Text style={styles.chamberText}>Chamber A-01</Text>
            </View>
            <CloudStatusBadge status={cloudStatus} />
          </View>
        </View>

        {connectionError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{connectionError}</Text>
          </View>
        ) : null}

        {/* Gas Gauge Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Icon name="flask" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardTitle}>GAS LEVEL (MQ3)</Text>
          </View>
          {telemetryLoading && !telemetry ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingText}>Reading chamber sensors…</Text>
            </View>
          ) : (
            <>
              <GasGauge value={gas ?? 0} oxygenMax={gasMax} unit={gasUnitLabel} />
              <View style={styles.gaugeMeta}>
                <View style={[styles.statusBadge, { backgroundColor: gasStatus.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: gasStatus.color }]} />
                  <Text style={[styles.statusText, { color: gasStatus.color }]}>
                    {gasState ? gasState.toUpperCase() : gasStatus.label}
                  </Text>
                </View>
                <View style={styles.riskWrap}>
                  <Text style={styles.riskLabel}>
                    {gasState && gasState !== 'Warming up'
                      ? 'MQ3 SENSOR'
                      : 'Gas status'}
                  </Text>
                  <Text style={styles.riskValue}>
                    {lastUpdatedLabel ? `Updated ${lastUpdatedLabel}` : '--'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Sensor Monitoring Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sensorRow}
        >
          <SensorCard
            iconName="thermometer"
            label="Temperature"
            value={
              telemetryLoading && !telemetry
                ? '--'
                : formatNumber(temperature, 1)
            }
            unit="°C"
            tint={Colors.blueLight}
            iconColor={Colors.blue}
          />
          <SensorCard
            iconName="water-percent"
            label="Humidity"
            value={
              telemetryLoading && !telemetry
                ? '--'
                : formatNumber(humidity, 0)
            }
            unit="%"
            tint={Colors.blueLight}
            iconColor={Colors.blue}
          />
          <SensorCard
            iconName="flask"
            label="Gas"
            value={telemetryLoading && !telemetry ? '--' : formatNumber(gas, 0)}
            unit={gasUnitLabel}
            tint={Colors.orangeLight}
            iconColor={Colors.orange}
          />
        </ScrollView>

        {/* Chamber / Actuator status */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Icon name="tower-beach" size={16} color={Colors.textTertiary} />
            <Text style={styles.cardTitle}>CHAMBER STATUS</Text>
          </View>
          <View style={styles.modeRow}>
            <Text style={styles.modeLabel}>Mode</Text>
            <Text
              style={[
                styles.modeValue,
                { color: mode === 'AUTO' ? Colors.primary : Colors.orange },
              ]}
            >
              {mode ?? '--'}
            </Text>
          </View>
          <View style={styles.actuatorRow}>
            <ActuatorChip iconName="snowflake" label="Peltier" value={reported.peltier} activeColor={Colors.blue} />
            <ActuatorChip iconName="water" label="Mist" value={reported.humidifier} activeColor={Colors.primary} />
            <ActuatorChip iconName="fan" label="Fan" value={reported.exhaust} activeColor={Colors.orange} />
            <ActuatorChip iconName="led-strip-variant" label="LED" value={reported.led} activeColor={Colors.green} />
          </View>
          <Text style={styles.hintText}>
            Actuator state comes from the ESP32 device shadow (reported).
            Mist status is the ESP32 expected state, not a physical sensor.
          </Text>
        </View>

        {/* Fruit Batch Info */}
        <View style={styles.card}>
          <View style={styles.batchHeader}>
            <View style={[styles.batchIconWrap, { backgroundColor: Colors.greenLight }]}>
              <Icon name="fruit-cherries" size={28} color={Colors.green} />
            </View>
            <View style={styles.batchInfo}>
              <Text style={styles.batchTitle}>Banana • Batch B-104</Text>
              <Text style={styles.batchSubtitle}>
                Ripening chamber in progress
              </Text>
            </View>
          </View>
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
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: layout.pageHorizontalPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: {
    ...textStyles.body,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    ...textStyles.h2,
    color: Colors.textPrimary,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  chamberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chamberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: spacing.sm,
  },
  chamberText: {
    ...textStyles.label,
    color: Colors.textPrimary,
    fontSize: fontSize.xs,
  },

  errorBanner: {
    backgroundColor: Colors.redLight,
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    ...textStyles.bodySmall,
    color: Colors.red,
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

  // Card
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
  cardTitle: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    letterSpacing: 1.5,
    textAlign: 'left',
    marginBottom: spacing.xs,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  // Gauge meta
  gaugeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },
  riskWrap: {
    alignItems: 'flex-end',
  },
  riskLabel: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  riskValue: {
    ...textStyles.body,
    fontWeight: fontWeight.bold,
    color: Colors.textPrimary,
    fontSize: fontSize.lg,
  },

  // Sensor row
  sensorRow: {
    paddingHorizontal: layout.pageHorizontalPadding,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sensorCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 3,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  sensorIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sensorValue: {
    ...textStyles.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sensorUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: Colors.textSecondary,
  },
  sensorLabel: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },

  // Mode row
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: spacing.md,
  },
  modeLabel: {
    ...textStyles.label,
    color: Colors.textSecondary,
  },
  modeValue: {
    ...textStyles.h4,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },

  // Actuators
  actuatorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actuatorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  actuatorLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  hintText: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    lineHeight: 16,
  },

  // Batch card
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  batchInfo: {
    flex: 1,
  },
  batchTitle: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  batchSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
  },
});
