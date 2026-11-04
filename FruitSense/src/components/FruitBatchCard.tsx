import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface FruitBatchCardProps {
  fruitType: string;
  batchId: string;
  chamberId: string;
  freshnessDays: number;
  freshnessRisk: number;
}

const FRUIT_ICONS: Record<string, string> = {
  banana: '🍌',
  apple: '🍎',
  mango: '🥭',
  pineapple: '🍍',
  orange: '🍊',
  strawberry: '🍓',
  grapes: '🍇',
  watermelon: '🍉',
  avocado: '🥑',
  peach: '🍑',
  cherry: '🍒',
  pear: '🍐',
  lemon: '🍋',
};

const getRiskColor = (risk: number): string => {
  if (risk >= 70) return Colors.red;
  if (risk >= 40) return Colors.orange;
  return Colors.green;
};

const getRiskLabel = (risk: number): string => {
  if (risk >= 70) return 'HIGH';
  if (risk >= 40) return 'MEDIUM';
  return 'LOW';
};

export const FruitBatchCard: React.FC<FruitBatchCardProps> = ({
  fruitType,
  batchId,
  chamberId,
  freshnessDays,
  freshnessRisk,
}) => {
  const icon =
    FRUIT_ICONS[fruitType.toLowerCase()] || FRUIT_ICONS[fruitType] || '🍎';
  const riskColor = getRiskColor(freshnessRisk);
  const riskLabel = getRiskLabel(freshnessRisk);

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Text style={styles.fruitIcon}>{icon}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.fruitName} numberOfLines={1}>
            {fruitType}
          </Text>
          <View style={[styles.riskBadge, { backgroundColor: `${riskColor}22` }]}>
            <Text style={[styles.riskText, { color: riskColor }]}>{riskLabel}</Text>
          </View>
        </View>

        <Text style={styles.batchInfo}>
          Batch #{batchId} · Chamber {chamberId}
        </Text>

        <View style={styles.freshnessRow}>
          <Text style={styles.freshnessLabel}>Freshness</Text>
          <Text style={[styles.freshnessValue, { color: riskColor }]}>
            {freshnessDays} days
          </Text>
        </View>

        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, Math.max(0, freshnessRisk))}%`,
                backgroundColor: riskColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  left: {
    marginRight: spacing.md,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitIcon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  fruitName: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  riskText: {
    ...textStyles.caption,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  batchInfo: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    marginBottom: spacing.md,
  },
  freshnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  freshnessLabel: {
    ...textStyles.caption,
    color: Colors.textTertiary,
  },
  freshnessValue: {
    ...textStyles.label,
    fontWeight: '600',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.grayLight,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default FruitBatchCard;
