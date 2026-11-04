import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { PrimaryButton } from '../../components/PrimaryButton';

interface SensorThreshold {
  key: string;
  title: string;
  icon: string;
  currentValue: string;
  unit: string;
  minKey: string;
  maxKey: string;
  defaultMin: string;
  defaultMax: string;
  color: string;
  lightColor: string;
}

const SENSORS: SensorThreshold[] = [
  {
    key: 'temperature',
    title: 'Temperature',
    icon: 'thermometer',
    currentValue: '12.4',
    unit: '°C',
    minKey: 'temperatureMin',
    maxKey: 'temperatureMax',
    defaultMin: '10',
    defaultMax: '14',
    color: Colors.blue,
    lightColor: Colors.blueLight,
  },
  {
    key: 'humidity',
    title: 'Humidity',
    icon: 'water-percent',
    currentValue: '68',
    unit: '%',
    minKey: 'humidityMin',
    maxKey: 'humidityMax',
    defaultMin: '60',
    defaultMax: '75',
    color: Colors.primary,
    lightColor: Colors.primaryVeryLight,
  },
  {
    key: 'ethylene',
    title: 'Ethylene',
    icon: 'flask',
    currentValue: '2.8',
    unit: 'ppm',
    minKey: 'ethyleneMin',
    maxKey: 'ethyleneMax',
    defaultMin: '0',
    defaultMax: '5',
    color: Colors.orange,
    lightColor: Colors.orangeLight,
  },
];

function ThresholdCard({
  sensor,
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  sensor: SensorThreshold;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}) {
  const minVal = parseFloat(min) || 0;
  const maxVal = parseFloat(max) || 1;
  const range = maxVal - minVal;
  const currentVal = parseFloat(sensor.currentValue);
  const barStart = Math.max(0, Math.min(((minVal - 0) / (maxVal + 5)) * 100, 100));
  const barWidth = Math.max(5, Math.min((range / (maxVal + 5)) * 100, 100 - barStart));
  const indicatorPos = Math.max(0, Math.min(((currentVal - minVal) / range) * 100, 100));

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.cardHeader}>
        <View style={[cardStyles.iconWrap, { backgroundColor: sensor.lightColor }]}>
          <Icon name={sensor.icon} size={22} color={sensor.color} />
        </View>
        <View style={cardStyles.headerText}>
          <Text style={cardStyles.title}>{sensor.title}</Text>
          <Text style={cardStyles.currentValue}>
            Current:{' '}
            <Text style={{ color: sensor.color, fontWeight: fontWeight.bold }}>
              {sensor.currentValue}
              {sensor.unit}
            </Text>
          </Text>
        </View>
      </View>

      <Text style={cardStyles.rangeLabel}>Safe Range</Text>

      <View style={cardStyles.inputsRow}>
        <View style={cardStyles.inputGroup}>
          <Text style={cardStyles.inputLabel}>Min</Text>
          <View style={[cardStyles.inputWrap, { borderColor: sensor.color + '40' }]}>
            <TextInput
              style={cardStyles.input}
              value={min}
              onChangeText={onMinChange}
              keyboardType="decimal-pad"
              placeholder={sensor.defaultMin}
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={cardStyles.unitText}>{sensor.unit}</Text>
          </View>
        </View>

        <View style={cardStyles.rangeBarContainer}>
          <View style={cardStyles.rangeBarTrack}>
            <View
              style={[
                cardStyles.rangeBarFill,
                {
                  left: `${barStart}%`,
                  width: `${barWidth}%`,
                  backgroundColor: sensor.color,
                },
              ]}
            />
            <View
              style={[
                cardStyles.rangeIndicator,
                {
                  left: `${barStart + (indicatorPos * barWidth) / 100}%`,
                  backgroundColor: sensor.color,
                },
              ]}
            />
          </View>
        </View>

        <View style={cardStyles.inputGroup}>
          <Text style={cardStyles.inputLabel}>Max</Text>
          <View style={[cardStyles.inputWrap, { borderColor: sensor.color + '40' }]}>
            <TextInput
              style={cardStyles.input}
              value={max}
              onChangeText={onMaxChange}
              keyboardType="decimal-pad"
              placeholder={sensor.defaultMax}
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={cardStyles.unitText}>{sensor.unit}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...textStyles.h4,
    color: Colors.textPrimary,
  },
  currentValue: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rangeLabel: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    letterSpacing: 1,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    marginBottom: 4,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: Colors.textPrimary,
    paddingVertical: spacing.sm,
    textAlign: 'center',
  },
  unitText: {
    ...textStyles.caption,
    color: Colors.textTertiary,
  },
  rangeBarContainer: {
    width: 40,
    alignItems: 'center',
  },
  rangeBarTrack: {
    width: 6,
    height: 40,
    borderRadius: 3,
    backgroundColor: Colors.grayLight,
    position: 'relative',
    overflow: 'visible',
  },
  rangeBarFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
    opacity: 0.4,
  },
  rangeIndicator: {
    position: 'absolute',
    top: '50%',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -2,
    marginTop: -5,
  },
});

export default function MonitoringThresholdsScreen() {
  const navigation = useNavigation();
  const thresholds = useStore((s) => s.thresholds);
  const updateThresholds = useStore((s) => s.updateThresholds);

  const [minValues, setMinValues] = useState({
    temperatureMin: String(thresholds.temperatureMin),
    humidityMin: String(thresholds.humidityMin),
    ethyleneMin: String(thresholds.ethyleneMin),
  });

  const [maxValues, setMaxValues] = useState({
    temperatureMax: String(thresholds.temperatureMax),
    humidityMax: String(thresholds.humidityMax),
    ethyleneMax: String(thresholds.ethyleneMax),
  });

  const handleMinChange = useCallback(
    (key: string, value: string) => {
      setMinValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleMaxChange = useCallback(
    (key: string, value: string) => {
      setMaxValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSave = () => {
    updateThresholds({
      temperatureMin: parseFloat(minValues.temperatureMin) || 10,
      temperatureMax: parseFloat(maxValues.temperatureMax) || 14,
      humidityMin: parseFloat(minValues.humidityMin) || 60,
      humidityMax: parseFloat(maxValues.humidityMax) || 75,
      ethyleneMin: parseFloat(minValues.ethyleneMin) || 0,
      ethyleneMax: parseFloat(maxValues.ethyleneMax) || 5,
    });
    navigation.goBack();
  };

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
          <Text style={styles.headerTitle}>Monitoring Thresholds</Text>
          <View style={styles.backButton} />
        </View>

        {SENSORS.map((sensor) => (
          <ThresholdCard
            key={sensor.key}
            sensor={sensor}
            min={minValues[sensor.minKey as keyof typeof minValues]}
            max={maxValues[sensor.maxKey as keyof typeof maxValues]}
            onMinChange={(v) => handleMinChange(sensor.minKey, v)}
            onMaxChange={(v) => handleMaxChange(sensor.maxKey, v)}
          />
        ))}

        <View style={styles.buttonSection}>
          <PrimaryButton
            title="Save Thresholds"
            onPress={handleSave}
            fullWidth
          />
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
  buttonSection: {
    marginTop: spacing.md,
  },
});
