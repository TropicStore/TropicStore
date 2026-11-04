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
import { Device } from '../types';

interface DeviceCardProps {
  device: Device;
  onPress: () => void;
}

const TYPE_ICONS: Record<Device['type'], string> = {
  hub: 'server-network',
  sensor: 'access-point',
  gateway: 'router-wireless',
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress }) => {
  const icon = TYPE_ICONS[device.type] || 'devices';
  const formattedTime = new Date(device.lastUpdated).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      <View style={[styles.iconCircle, { backgroundColor: Colors.primaryVeryLight }]}>
        <Icon name={icon} size={24} color={Colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {device.name}
        </Text>
        <Text style={styles.detail} numberOfLines={1}>
          {device.model}
        </Text>
        <Text style={styles.serial} numberOfLines={1}>
          SN: {device.serialNumber}
        </Text>
        <Text style={styles.updated}>Updated {formattedTime}</Text>
      </View>

      <View style={styles.right}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: device.connected
                  ? Colors.green
                  : Colors.red,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: device.connected ? Colors.green : Colors.red,
              },
            ]}
          >
            {device.connected ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color={Colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    ...textStyles.h4,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  detail: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  serial: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  updated: {
    ...textStyles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...textStyles.label,
    fontSize: 12,
  },
});

export default DeviceCard;
