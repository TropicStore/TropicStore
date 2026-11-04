import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CloudStatus } from '../hooks/useChamberData';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { fontSize, fontWeight } from '../constants/typography';

interface CloudStatusBadgeProps {
  status: CloudStatus;
  connectedLabel?: string;
}

const CONFIG: Record<CloudStatus, { label: string; color: string; bg: string }> = {
  connecting: { label: 'CONNECTING', color: Colors.orange, bg: Colors.orangeLight },
  connected: { label: 'CONNECTED', color: Colors.green, bg: Colors.greenLight },
  error: { label: 'ERROR', color: Colors.red, bg: Colors.redLight },
};

export const CloudStatusBadge: React.FC<CloudStatusBadgeProps> = ({
  status,
  connectedLabel,
}) => {
  const config = CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>
        {status === 'connected' && connectedLabel ? connectedLabel : config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
});

export default CloudStatusBadge;
