import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert as RNAlert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius, layout } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { Alert } from '../../types';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'critical' | 'warning' | 'info' | 'resolved';

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warning' },
  { key: 'info', label: 'Info' },
  { key: 'resolved', label: 'Resolved' },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    type: 'critical',
    title: 'HIGH ETHYLENE DETECTED',
    message:
      'Ethylene concentration has exceeded the critical threshold of 5.0 ppm. Immediate action is recommended to prevent accelerated ripening and spoilage of stored fruits.',
    value: 6.8,
    threshold: 5.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    sensorType: 'ethylene',
  },
  {
    id: 'alert-002',
    type: 'warning',
    title: 'TEMPERATURE RISING',
    message:
      'Chamber temperature is increasing and approaching the upper threshold. Current reading of 15.2°C is above the ideal range for fruit preservation.',
    value: 15.2,
    threshold: 14.0,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    read: false,
    sensorType: 'temperature',
  },
  {
    id: 'alert-003',
    type: 'resolved',
    title: 'SENSOR RECONNECTING',
    message:
      'The ethylene sensor was temporarily offline and has successfully reconnected. All readings are now being transmitted normally.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: true,
    sensorType: 'system',
  },
  {
    id: 'alert-004',
    type: 'warning',
    title: 'HUMIDITY LOW',
    message:
      'Chamber humidity has dropped below the recommended minimum. Low humidity may cause dehydration and quality loss in stored fruits.',
    value: 45,
    threshold: 60,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    sensorType: 'humidity',
  },
  {
    id: 'alert-005',
    type: 'info',
    title: 'DAILY REPORT READY',
    message:
      'Your daily preservation report for Chamber A-01 is ready to view. Tap to review sensor summaries, freshness trends, and recommendations.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: true,
    sensorType: 'system',
  },
];

function getAlertColor(type: Alert['type']): string {
  switch (type) {
    case 'critical':
      return Colors.red;
    case 'warning':
      return Colors.orange;
    case 'info':
      return Colors.infoBlue;
    case 'resolved':
      return Colors.green;
    default:
      return Colors.gray;
  }
}

function getAlertBgColor(type: Alert['type']): string {
  switch (type) {
    case 'critical':
      return Colors.redLight;
    case 'warning':
      return Colors.orangeLight;
    case 'info':
      return Colors.blueLight;
    case 'resolved':
      return Colors.greenLight;
    default:
      return Colors.grayLight;
  }
}

function getAlertIcon(type: Alert['type']): string {
  switch (type) {
    case 'critical':
      return 'alert-circle';
    case 'warning':
      return 'alert';
    case 'info':
      return 'information';
    case 'resolved':
      return 'check-circle';
    default:
      return 'bell';
  }
}

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

export default function AlertsScreen() {
  const { colors, isDark } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    return alerts.filter((a) => a.type === activeFilter);
  }, [alerts, activeFilter]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0 };
    alerts.forEach((a) => {
      if (a.type === 'critical') c.critical++;
      else if (a.type === 'warning') c.warning++;
      else if (a.type === 'info') c.info++;
    });
    return c;
  }, [alerts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleClear = useCallback(
    (id: string) => {
      RNAlert.alert('Clear Alert', 'Remove this alert from the list?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setAlerts((prev) => prev.filter((a) => a.id !== id));
            if (expandedId === id) setExpandedId(null);
          },
        },
      ]);
    },
    [expandedId],
  );

  const handleMarkRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const handleClearAll = useCallback(() => {
    if (filteredAlerts.length === 0) return;
    RNAlert.alert(
      'Clear All',
      `Clear all ${activeFilter === 'all' ? '' : activeFilter} alerts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            if (activeFilter === 'all') {
              setAlerts([]);
            } else {
              setAlerts((prev) => prev.filter((a) => a.type !== activeFilter));
            }
            setExpandedId(null);
          },
        },
      ],
    );
  }, [activeFilter, filteredAlerts.length]);

  const renderFilterTab = (tab: (typeof FILTER_TABS)[number]) => {
    const isActive = activeFilter === tab.key;
    return (
      <TouchableOpacity
        key={tab.key}
        style={[
          styles.filterPill,
          {
            backgroundColor: isActive ? Colors.primary : isDark ? colors.surface : Colors.white,
            borderColor: isActive ? Colors.primary : colors.border,
          },
        ]}
        onPress={() => {
          setActiveFilter(tab.key);
          setExpandedId(null);
        }}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterPillText,
            {
              color: isActive ? Colors.white : colors.text,
            },
          ]}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAlertItem = ({ item }: { item: Alert }) => {
    const isExpanded = expandedId === item.id;
    const accentColor = getAlertColor(item.type);
    const bgColor = getAlertBgColor(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.alertCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderLeftColor: accentColor,
          },
          !item.read && styles.alertCardUnread,
        ]}
        activeOpacity={0.7}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        <View style={styles.alertCardHeader}>
          <View style={[styles.alertIconContainer, { backgroundColor: bgColor }]}>
            <Icon name={getAlertIcon(item.type)} size={20} color={accentColor} />
          </View>
          <View style={styles.alertCardContent}>
            <View style={styles.alertTitleRow}>
              <Text
                style={[styles.alertTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />
              )}
            </View>
            <Text style={[styles.alertTime, { color: colors.textTertiary }]}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textTertiary}
          />
        </View>

        <Text
          style={[styles.alertPreview, { color: colors.textSecondary }]}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {item.message}
        </Text>

        {item.value !== undefined && item.threshold !== undefined && (
          <View style={styles.valueRow}>
            <View style={[styles.valueChip, { backgroundColor: bgColor }]}>
              <Text style={[styles.valueChipLabel, { color: colors.textTertiary }]}>
                Value
              </Text>
              <Text style={[styles.valueChipValue, { color: accentColor }]}>
                {item.value}
                {item.sensorType === 'ethylene'
                  ? ' ppm'
                  : item.sensorType === 'temperature'
                    ? ' °C'
                    : item.sensorType === 'humidity'
                      ? '%'
                      : ''}
              </Text>
            </View>
            <View style={[styles.valueChip, { backgroundColor: isDark ? colors.surface : Colors.grayLight }]}>
              <Text style={[styles.valueChipLabel, { color: colors.textTertiary }]}>
                Threshold
              </Text>
              <Text style={[styles.valueChipValue, { color: colors.textSecondary }]}>
                {item.threshold}
                {item.sensorType === 'ethylene'
                  ? ' ppm'
                  : item.sensorType === 'temperature'
                    ? ' °C'
                    : item.sensorType === 'humidity'
                      ? '%'
                      : ''}
              </Text>
            </View>
          </View>
        )}

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.timestampLabel, { color: colors.textTertiary }]}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            <View style={styles.actionRow}>
              {!item.read && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.primaryVeryLight }]}
                  onPress={() => handleMarkRead(item.id)}
                  activeOpacity={0.7}
                >
                  <Icon name="email-open-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                    Mark as Read
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.redLight }]}
                onPress={() => handleClear(item.id)}
                activeOpacity={0.7}
              >
                <Icon name="delete-outline" size={16} color={Colors.red} />
                <Text style={[styles.actionButtonText, { color: Colors.red }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? colors.surface : Colors.primaryVeryLight }]}>
        <Icon name="bell-off-outline" size={48} color={Colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No {activeFilter !== 'all' ? activeFilter : ''} alerts
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
        {activeFilter === 'all'
          ? 'You\'re all caught up! Alerts will appear here when detected.'
          : `No ${activeFilter} alerts to display.`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <BackgroundDecor isDark={isDark} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Alerts</Text>
          {alerts.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
              <Text style={[styles.clearAllText, { color: Colors.primary }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_TABS.map(renderFilterTab)}
        </ScrollView>

        <View style={[styles.summaryBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Icon name="alert-circle" size={14} color={Colors.red} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{counts.critical}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Critical</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Icon name="alert" size={14} color={Colors.orange} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{counts.warning}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Warning</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Icon name="information" size={14} color={Colors.infoBlue} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{counts.info}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>Info</Text>
          </View>
        </View>

        <View style={styles.alertList}>
          {filteredAlerts.length === 0 ? (
            renderEmpty()
          ) : (
            filteredAlerts.map((alert) => (
              <View key={alert.id}>{renderAlertItem({ item: alert })}</View>
            ))
          )}
        </View>
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
    bottom: 100,
    left: -120,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.pageHorizontalPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...textStyles.h2,
  },
  clearAllText: {
    ...textStyles.label,
  },
  filterContainer: {
    paddingHorizontal: layout.pageHorizontalPadding,
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterPillText: {
    ...textStyles.label,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: layout.pageHorizontalPadding,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryCount: {
    ...textStyles.h4,
  },
  summaryLabel: {
    ...textStyles.caption,
  },
  summaryDivider: {
    width: 1,
    height: 24,
  },
  alertList: {
    paddingHorizontal: layout.pageHorizontalPadding,
  },
  alertCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
  },
  alertCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCardContent: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertTitle: {
    ...textStyles.label,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTime: {
    ...textStyles.caption,
    marginTop: 2,
  },
  alertPreview: {
    ...textStyles.bodySmall,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  valueRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  valueChip: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  valueChipLabel: {
    ...textStyles.caption,
  },
  valueChipValue: {
    ...textStyles.label,
    marginTop: 2,
  },
  expandedSection: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  timestampLabel: {
    ...textStyles.caption,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  actionButtonText: {
    ...textStyles.label,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    ...textStyles.h4,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...textStyles.bodySmall,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
});
