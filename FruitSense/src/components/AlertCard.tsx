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
import { Alert } from '../types';

interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
  onClear?: () => void;
}

const TYPE_COLORS: Record<Alert['type'], string> = {
  critical: Colors.red,
  warning: Colors.orange,
  info: Colors.blue,
  resolved: Colors.green,
};

const TYPE_ICONS: Record<Alert['type'], string> = {
  critical: 'alert-octagon',
  warning: 'alert',
  info: 'information',
  resolved: 'check-circle',
};

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onPress,
  onClear,
}) => {
  const color = TYPE_COLORS[alert.type];
  const icon = TYPE_ICONS[alert.type];
  const formattedTime = new Date(alert.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, { borderLeftColor: color }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Icon name={icon} size={22} color={color} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.typeLabel, { color }]}>
            {alert.type.toUpperCase()}
          </Text>
          <View style={styles.headerRight}>
            <Text style={styles.time}>{formattedTime}</Text>
            {!alert.read ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {alert.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {alert.message}
        </Text>

        {alert.value !== undefined ? (
          <View style={styles.valueRow}>
            <Text style={styles.value}>{alert.value}</Text>
            {alert.threshold !== undefined ? (
              <Text style={styles.threshold}>
                {' '}
                / threshold {alert.threshold}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {onClear ? (
        <TouchableOpacity
          onPress={() => onClear()}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="close" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    flexDirection: 'row',
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
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
  typeLabel: {
    ...textStyles.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    ...textStyles.caption,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: spacing.sm,
  },
  title: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    ...textStyles.h4,
    color: Colors.textPrimary,
  },
  threshold: {
    ...textStyles.caption,
    color: Colors.textTertiary,
  },
  clearButton: {
    alignSelf: 'flex-start',
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default AlertCard;
