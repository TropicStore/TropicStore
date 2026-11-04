import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  timeSelector?: boolean;
  onTimeChange?: (time: string) => void;
  selectedTime?: string;
}

const TIME_OPTIONS = ['D', 'W', 'M'];

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  timeSelector,
  onTimeChange,
  selectedTime = 'D',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {timeSelector ? (
          <View style={styles.timeSelector}>
            {TIME_OPTIONS.map((option) => {
              const isActive = selectedTime === option;
              return (
                <Text
                  key={option}
                  onPress={() => onTimeChange?.(option)}
                  style={[
                    styles.timeOption,
                    isActive && styles.timeOptionActive,
                  ]}
                >
                  {option}
                </Text>
              );
            })}
          </View>
        ) : null}
      </View>
      <View style={styles.chartContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h4,
    color: Colors.textPrimary,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.grayLight,
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  timeOption: {
    ...textStyles.label,
    color: Colors.textTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm - 2,
  },
  timeOptionActive: {
    backgroundColor: Colors.white,
    color: Colors.primary,
    fontWeight: '700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartContainer: {
    alignItems: 'stretch',
  },
});

export default ChartCard;
