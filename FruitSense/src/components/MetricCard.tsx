import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: string;
  iconColor: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconColor,
  trend,
  trendValue,
  onPress,
}) => {
  const trendColor = trend === 'up' ? Colors.green : Colors.red;
  const trendIcon = trend === 'up' ? 'trending-up' : 'trending-down';

  const Content = (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
          <Icon name={icon} size={22} color={iconColor} />
        </View>
        {trend && trendValue ? (
          <View style={styles.trendContainer}>
            <Icon name={trendIcon} size={16} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trendValue}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.wrapper}>
        {Content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{Content}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    ...textStyles.label,
    marginLeft: spacing.xs,
  },
  title: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...textStyles.value,
    color: Colors.textPrimary,
    fontSize: 28,
    lineHeight: 34,
  },
  unit: {
    ...textStyles.bodySmall,
    color: Colors.textTertiary,
    marginLeft: spacing.xs,
  },
});

export default MetricCard;
