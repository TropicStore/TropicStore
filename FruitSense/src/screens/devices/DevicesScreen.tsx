import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius, layout } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Device, DeviceSensor } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const MOCK_HUB: Device = {
  id: 'device-hub-01',
  name: 'Chamber A-01',
  type: 'hub',
  model: 'TropicStore Hub',
  serialNumber: 'FS-1042',
  chamberId: 'chamber-a-01',
  connected: true,
  lastUpdated: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
};

const MOCK_SENSORS: DeviceSensor[] = [
  {
    id: 'sensor-ethylene-01',
    name: 'Ethylene Sensor',
    type: 'ethylene',
    model: 'ETH-01',
    serialNumber: 'ETH-01',
    connected: true,
  },
  {
    id: 'sensor-th-01',
    name: 'Temperature & Humidity Sensor',
    type: 'temperature_humidity',
    model: 'TH-01',
    serialNumber: 'TH-01',
    connected: true,
  },
  {
    id: 'sensor-gw-01',
    name: 'Gateway',
    type: 'gateway',
    model: 'GW-01',
    serialNumber: 'GW-01',
    connected: true,
  },
];

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function getSensorIcon(type: DeviceSensor['type']): string {
  switch (type) {
    case 'ethylene':
      return 'weather-windy';
    case 'temperature_humidity':
      return 'thermometer';
    case 'gateway':
      return 'router-wireless';
    default:
      return 'chip';
  }
}

interface BackgroundDecorProps {
  isDark: boolean;
}

function BackgroundDecor({ isDark }: BackgroundDecorProps) {
  return (
    <View style={styles.backgroundDecor} pointerEvents="none">
      <View
        style={[
          styles.bgCircle1,
          { backgroundColor: isDark ? 'rgba(30,80,50,0.3)' : 'rgba(31,122,77,0.08)' },
        ]}
      />
      <View
        style={[
          styles.bgCircle2,
          { backgroundColor: isDark ? 'rgba(30,80,50,0.2)' : 'rgba(31,122,77,0.05)' },
        ]}
      />
    </View>
  );
}

export default function DevicesScreen() {
  const { colors, isDark } = useTheme();
  const [hub] = useState<Device>(MOCK_HUB);
  const [sensors] = useState<DeviceSensor[]>(MOCK_SENSORS);

  const connectedCount = sensors.filter((s) => s.connected).length;

  const handleAddDevice = useCallback(() => {
    RNAlert.alert(
      'Add New Device',
      'Device pairing will be available in a future update. Please ensure your device is powered on and in pairing mode.',
      [{ text: 'OK' }],
    );
  }, []);

  const handleSensorPress = useCallback((sensor: DeviceSensor) => {
    RNAlert.alert(
      sensor.name,
      `Model: ${sensor.model}\nSerial: ${sensor.serialNumber}\nStatus: ${sensor.connected ? 'Connected' : 'Disconnected'}`,
      [{ text: 'OK' }],
    );
  }, []);

  const renderSensorCard = (sensor: DeviceSensor) => (
    <TouchableOpacity
      key={sensor.id}
      style={[
        styles.sensorCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handleSensorPress(sensor)}
    >
      <View style={styles.sensorLeft}>
        <View
          style={[
            styles.sensorIconContainer,
            {
              backgroundColor: sensor.connected
                ? isDark
                  ? 'rgba(16,185,129,0.15)'
                  : Colors.greenLight
                : isDark
                  ? 'rgba(239,68,68,0.15)'
                  : Colors.redLight,
            },
          ]}
        >
          <Icon
            name={getSensorIcon(sensor.type)}
            size={22}
            color={sensor.connected ? Colors.green : Colors.red}
          />
        </View>
        <View style={styles.sensorInfo}>
          <Text style={[styles.sensorName, { color: colors.text }]} numberOfLines={1}>
            {sensor.name}
          </Text>
          <Text style={[styles.sensorModel, { color: colors.textTertiary }]}>{sensor.model}</Text>
        </View>
      </View>
      <View style={styles.sensorRight}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: sensor.connected ? Colors.green : Colors.red },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: sensor.connected ? Colors.green : Colors.red },
            ]}
          >
            {sensor.connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <BackgroundDecor isDark={isDark} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Devices</Text>
        </View>

        <View
          style={[
            styles.hubCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.hubTopRow}>
            <View style={[styles.hubIconContainer, { backgroundColor: Colors.primaryVeryLight }]}>
              <Icon name="server-network" size={24} color={Colors.primary} />
            </View>
            <View style={styles.hubInfo}>
              <Text style={[styles.hubName, { color: colors.text }]}>{hub.name}</Text>
              <Text style={[styles.hubModel, { color: colors.textSecondary }]}>
                {hub.model} • {hub.serialNumber}
              </Text>
            </View>
          </View>
          <View style={[styles.hubDivider, { backgroundColor: colors.border }]} />
          <View style={styles.hubBottomRow}>
            <View style={styles.hubStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: hub.connected ? Colors.green : Colors.red },
                ]}
              />
              <Text
                style={[
                  styles.hubStatusText,
                  { color: hub.connected ? Colors.green : Colors.red },
                ]}
              >
                {hub.connected ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Text style={[styles.hubLastUpdated, { color: colors.textTertiary }]}>
              Updated {formatTimestamp(hub.lastUpdated)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Icon name="chip" size={18} color={Colors.textPrimary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sensors</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.primaryVeryLight }]}>
            <Text style={[styles.badgeText, { color: Colors.primary }]}>
              {connectedCount}/{sensors.length}
            </Text>
          </View>
        </View>

        <View style={styles.sensorList}>
          {sensors.map(renderSensorCard)}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={handleAddDevice}
        >
          <Icon name="plus" size={20} color={Colors.primary} />
          <Text style={[styles.addButtonText, { color: Colors.primary }]}>Add New Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: 150,
    left: -120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    paddingHorizontal: layout.pageHorizontalPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...textStyles.h2,
  },
  hubCard: {
    marginHorizontal: layout.pageHorizontalPadding,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  hubTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  hubIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubInfo: {
    flex: 1,
  },
  hubName: {
    ...textStyles.h3,
  },
  hubModel: {
    ...textStyles.bodySmall,
    marginTop: 2,
  },
  hubDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  hubBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hubStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hubStatusText: {
    ...textStyles.label,
  },
  hubLastUpdated: {
    ...textStyles.caption,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...textStyles.label,
  },
  sensorList: {
    paddingHorizontal: layout.pageHorizontalPadding,
  },
  sensorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sensorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  sensorIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    ...textStyles.label,
    flexShrink: 1,
  },
  sensorModel: {
    ...textStyles.caption,
    marginTop: 2,
  },
  sensorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...textStyles.caption,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: layout.pageHorizontalPadding,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  addButtonText: {
    ...textStyles.button,
  },
});
