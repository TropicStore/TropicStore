import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface EthyleneGaugeProps {
  value: number;
  status: string;
  size?: number;
}

export const EthyleneGauge: React.FC<EthyleneGaugeProps> = ({
  value,
  status,
  size = 180,
}) => {
  const clampedValue = Math.min(10, Math.max(0, value));
  const percentage = clampedValue / 10;

  const gaugeColor =
    clampedValue <= 3
      ? Colors.green
      : clampedValue <= 6
      ? Colors.orange
      : Colors.red;

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.grayLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: gaugeColor }]}>
          {clampedValue.toFixed(1)}
        </Text>
        <Text style={styles.unit}>ppm</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: `${gaugeColor}22` }]}>
        <Text style={[styles.statusText, { color: gaugeColor }]}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '28%',
    left: 0,
    right: 0,
  },
  value: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    fontFamily: 'System',
  },
  unit: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    position: 'absolute',
    bottom: '16%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusText: {
    ...textStyles.label,
    fontWeight: '700',
  },
});

export default EthyleneGauge;
