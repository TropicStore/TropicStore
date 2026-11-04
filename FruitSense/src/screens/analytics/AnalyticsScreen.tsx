import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { CloudStatusBadge } from '../../components/CloudStatusBadge';
import { useChamberData } from '../../hooks/useChamberData';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius, layout } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { ChamberHistoryPoint } from '../../types';
import { formatTimeLabel } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = spacing.xl * 2;
const Y_AXIS_SPACE = 50;
const CHART_WIDTH = SCREEN_WIDTH - layout.pageHorizontalPadding * 2 - CARD_PADDING - Y_AXIS_SPACE;

type TimePeriod = '24h' | '7d' | '30d';

interface ChartDatum {
  value: number;
  label: string;
}

// Backend returns up to a fixed number of points (limit). Period pills only
// control client-side downsampling for the chart; we stay honest about the
// data we actually received.
function sampleData(
  data: ChartDatum[],
  period: TimePeriod,
): ChartDatum[] {
  let maxPoints = data.length;
  if (period === '7d') {
    maxPoints = 28;
  } else if (period === '30d') {
    maxPoints = 30;
  }
  if (data.length <= maxPoints) {
    return data;
  }
  const step = data.length / maxPoints;
  const sampled: ChartDatum[] = [];
  for (let i = 0; i < maxPoints; i++) {
    sampled.push(data[Math.floor(i * step)]);
  }
  return sampled;
}

function toChartData(
  points: ChamberHistoryPoint[],
  select: (p: ChamberHistoryPoint) => number | null | undefined,
): ChartDatum[] {
  return points
    .map((p) => {
      const value = select(p);
      if (value == null || !Number.isFinite(value)) {
        return null;
      }
      return { value, label: formatTimeLabel(p.timestamp) };
    })
    .filter((d): d is ChartDatum => d !== null);
}

function SummaryCard({
  iconName,
  label,
  value,
  unit,
  bgColor,
  iconColor,
}: {
  iconName: string;
  label: string;
  value: string;
  unit: string;
  bgColor: string;
  iconColor: string;
}) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <View style={[styles.summaryIconWrap, { backgroundColor: iconColor + '18' }]}>
        <Icon name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={styles.summaryValue}>
        {value}
        <Text style={styles.summaryUnit}> {unit}</Text>
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function StatRowItem({ iconName, label, value, color }: { iconName: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statRowItem}>
      <Icon name={iconName} size={16} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('24h');
  const {
    history,
    historyLoading,
    historyError,
    cloudStatus,
  } = useChamberData();

  const { tempData, humidityData, gasData } = useMemo(() => {
    const temp = toChartData(history, (p) => p.temperature);
    const hum = toChartData(history, (p) => p.humidity);
    const gas = toChartData(history, (p) =>
      p.mq3_calibrated && p.mq3_ppm != null
        ? p.mq3_ppm
        : p.mq3_filtered != null
          ? p.mq3_filtered
          : p.mq3_raw,
    );
    return {
      tempData: sampleData(temp, selectedPeriod),
      humidityData: sampleData(hum, selectedPeriod),
      gasData: sampleData(gas, selectedPeriod),
    };
  }, [history, selectedPeriod]);

  const avgTemp = useMemo(() => {
    if (tempData.length === 0) {
      return '--';
    }
    const sum = tempData.reduce((acc, d) => acc + d.value, 0);
    return (sum / tempData.length).toFixed(1);
  }, [tempData]);

  const avgHumidity = useMemo(() => {
    if (humidityData.length === 0) {
      return '--';
    }
    const sum = humidityData.reduce((acc, d) => acc + d.value, 0);
    return Math.round(sum / humidityData.length).toString();
  }, [humidityData]);

  const avgGas = useMemo(() => {
    if (gasData.length === 0) {
      return '--';
    }
    const sum = gasData.reduce((acc, d) => acc + d.value, 0);
    return Math.round(sum / gasData.length).toString();
  }, [gasData]);

  const maxGas = useMemo(() => {
    if (gasData.length === 0) {
      return '--';
    }
    return Math.max(...gasData.map((d) => d.value)).toFixed(0);
  }, [gasData]);

  const minTemp = useMemo(() => {
    if (tempData.length === 0) {
      return '--';
    }
    return Math.min(...tempData.map((d) => d.value)).toFixed(1);
  }, [tempData]);

  const maxTemp = useMemo(() => {
    if (tempData.length === 0) {
      return '--';
    }
    return Math.max(...tempData.map((d) => d.value)).toFixed(1);
  }, [tempData]);

  const minTempLabel = minTemp === '--' ? '--' : `${minTemp} °C`;
  const maxTempLabel = maxTemp === '--' ? '--' : `${maxTemp} °C`;

  const periods: { key: TimePeriod; label: string }[] = [
    { key: '24h', label: 'Live' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
  ];

  const makeChartProps = (dataLen: number) => ({
    height: 180,
    spacing: Math.max(
      30,
      (CHART_WIDTH - 60) / Math.max(dataLen, 1),
    ),
    color1: Colors.primary,
    color2: Colors.primaryLight,
    dataPointsColor1: Colors.primary,
    dataPointsColor2: Colors.primaryLight,
    thickness: 2,
    yAxisColor: Colors.border,
    xAxisColor: Colors.border,
    yAxisTextStyle: styles.axisText,
    xAxisLabelTextStyle: styles.axisText,
    hideYAxisText: false,
    noOfSections: 5,
    yAxisOffset: 0,
    curved: true,
    areaChart: true,
    startFillColor: Colors.primaryLight,
    endFillColor: Colors.primaryVeryLight,
    startOpacity: 0.3,
    endOpacity: 0.05,
    isAnimated: true,
    animationDuration: 500,
    hideDataPoints: dataLen > 28,
    xAxisLabelsVertical: false,
    showVerticalLines: false,
    verticalLinesStrokeDashArray: [4, 4],
    verticalLinesColor: Colors.border,
  });

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
          <Text style={styles.title}>Analytics</Text>
          <CloudStatusBadge status={cloudStatus} connectedLabel="CLOUD" />
        </View>

        {/* Time Selector */}
        <View style={styles.periodRow}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.periodPill,
                selectedPeriod === p.key && styles.periodPillActive,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedPeriod(p.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === p.key && styles.periodTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {historyError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{historyError}</Text>
          </View>
        ) : null}

        {historyLoading && history.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Loading chamber history…</Text>
          </View>
        ) : tempData.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Icon name="chart-line" size={40} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptySubtitle}>
              Historical readings will appear here once the chamber has
              reported telemetry to the cloud.
            </Text>
          </View>
        ) : (
          <>
            {/* Temperature Chart */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Icon name="thermometer" size={18} color={Colors.blue} />
                <Text style={styles.cardTitle}>Temperature</Text>
              </View>
              <View style={styles.chartContainer}>
                <LineChart
                  data={tempData}
                  width={CHART_WIDTH}
                  {...makeChartProps(tempData.length)}
                  color1={Colors.blue}
                  color2={Colors.blue}
                  dataPointsColor1={Colors.blue}
                  dataPointsColor2={Colors.blue}
                  startFillColor={Colors.blueLight}
                  endFillColor={Colors.blueLight}
                  yAxisLabelSuffix="°C"
                />
              </View>
            </View>

            {/* Humidity Chart */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Icon name="water-percent" size={18} color={Colors.primary} />
                <Text style={styles.cardTitle}>Humidity</Text>
              </View>
              <View style={styles.chartContainer}>
                <LineChart
                  data={humidityData}
                  width={CHART_WIDTH}
                  {...makeChartProps(humidityData.length)}
                  color1={Colors.primary}
                  color2={Colors.primary}
                  dataPointsColor1={Colors.primary}
                  dataPointsColor2={Colors.primary}
                  startFillColor={Colors.primaryLight}
                  endFillColor={Colors.primaryVeryLight}
                  yAxisLabelSuffix="%"
                />
              </View>
            </View>

            {/* Gas Chart */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Icon name="flask" size={18} color={Colors.orange} />
                <Text style={styles.cardTitle}>Gas Level (MQ3)</Text>
              </View>
              <View style={styles.chartContainer}>
                <LineChart
                  data={gasData}
                  width={CHART_WIDTH}
                  {...makeChartProps(gasData.length)}
                  color1={Colors.orange}
                  color2={Colors.orange}
                  dataPointsColor1={Colors.orange}
                  dataPointsColor2={Colors.orange}
                  startFillColor={Colors.orangeLight}
                  endFillColor={Colors.orangeLight}
                  yAxisLabelPrefix=""
                  yAxisLabelSuffix=""
                />
              </View>
            </View>

            {/* Summary Cards Grid */}
            <View style={styles.summaryGrid}>
              <SummaryCard
                iconName="flask"
                label="Avg Gas"
                value={avgGas}
                unit=""
                bgColor={Colors.orangeLight}
                iconColor={Colors.orange}
              />
              <SummaryCard
                iconName="water-percent"
                label="Avg Humidity"
                value={avgHumidity}
                unit="%"
                bgColor={Colors.blueLight}
                iconColor={Colors.blue}
              />
              <SummaryCard
                iconName="thermometer"
                label="Avg Temperature"
                value={avgTemp}
                unit="°C"
                bgColor={Colors.blueLight}
                iconColor={Colors.blue}
              />
              <SummaryCard
                iconName="chart-line"
                label="Highest Gas"
                value={maxGas}
                unit=""
                bgColor={Colors.redLight}
                iconColor={Colors.red}
              />
            </View>

            {/* Additional Stats */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Icon name="chart-bar" size={18} color={Colors.textPrimary} />
                <Text style={styles.cardSectionTitle}>Additional Statistics</Text>
              </View>
              <View style={styles.statRow}>
                <StatRowItem iconName="thermometer-minus" label="Lowest Temp" value={minTempLabel} color={Colors.green} />
                <StatRowItem iconName="thermometer-plus" label="Highest Temp" value={maxTempLabel} color={Colors.red} />
              </View>
            </View>
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
    paddingBottom: 100,
  },

  // Header
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

  // Period pills
  periodRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.pageHorizontalPadding,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  periodPill: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    ...textStyles.label,
    fontSize: fontSize.xs,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.white,
    fontWeight: fontWeight.semibold,
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

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    overflow: 'hidden',
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
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardSectionTitle: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Chart
  chartContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  axisText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },

  // Summary grid
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: layout.pageHorizontalPadding,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    ...textStyles.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  summaryUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: Colors.textSecondary,
  },
  summaryLabel: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },

  // Stat row
  statRow: {
    gap: spacing.md,
  },
  statRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  statValue: {
    ...textStyles.body,
    fontWeight: fontWeight.semibold,
    color: Colors.textPrimary,
  },
});
