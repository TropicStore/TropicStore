import React from 'react';
import {
  View,
  Text,
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
import { ToggleRow } from '../../components/ToggleRow';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const notificationSettings = useStore((s) => s.notificationSettings);
  const updateNotifications = useStore((s) => s.updateNotifications);

  const pushAlertsOn = notificationSettings.pushAlerts;

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrap}>
            <Icon name="bell-ring-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Stay Alerted</Text>
            <Text style={styles.infoSubtitle}>
              Receive push notifications when sensor readings go outside safe
              thresholds.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.toggleItem, !pushAlertsOn && styles.disabledItem]}>
            <ToggleRow
              icon="bell-check"
              title="Push Alerts"
              subtitle={pushAlertsOn ? 'Master toggle enabled' : 'All alerts paused'}
              value={notificationSettings.pushAlerts}
              onValueChange={(v) => updateNotifications({ pushAlerts: v })}
            />
          </View>

          <View style={styles.separator} />

          <View style={[styles.toggleItem, !pushAlertsOn && styles.disabledItem]}>
            <ToggleRow
              icon="flask-alert"
              title="High Ethylene"
              subtitle="Alert when ethylene exceeds threshold"
              value={notificationSettings.highEthylene && pushAlertsOn}
              onValueChange={(v) => updateNotifications({ highEthylene: v })}
            />
          </View>

          <View style={styles.separator} />

          <View style={[styles.toggleItem, !pushAlertsOn && styles.disabledItem]}>
            <ToggleRow
              icon="thermometer-alert"
              title="Temperature Alerts"
              subtitle="Alert when temperature is out of range"
              value={notificationSettings.temperature && pushAlertsOn}
              onValueChange={(v) => updateNotifications({ temperature: v })}
            />
          </View>

          <View style={styles.separator} />

          <View style={[styles.toggleItem, !pushAlertsOn && styles.disabledItem]}>
            <ToggleRow
              icon="file-document-outline"
              title="Daily Report"
              subtitle="Receive daily summary notifications"
              value={notificationSettings.dailyReport && pushAlertsOn}
              onValueChange={(v) => updateNotifications({ dailyReport: v })}
            />
          </View>
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryVeryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.h4,
    color: Colors.primary,
    marginBottom: 2,
  },
  infoSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
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
  toggleItem: {
    opacity: 1,
  },
  disabledItem: {
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 60,
    marginVertical: spacing.xs,
  },
});
