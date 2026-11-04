import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { NavigationParamList } from '../../types';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';

type SettingsNav = NativeStackNavigationProp<NavigationParamList>;

interface SettingItem {
  icon: string;
  label: string;
  description: string;
  screen: keyof NavigationParamList;
}

const SETTINGS_ITEMS: SettingItem[] = [
  {
    icon: 'account-circle-outline',
    label: 'Profile',
    description: 'Manage your account details',
    screen: 'Profile',
  },
  {
    icon: 'tune-vertical',
    label: 'Monitoring Thresholds',
    description: 'Set sensor alert thresholds',
    screen: 'MonitoringThresholds',
  },
  {
    icon: 'tune',
    label: 'Chamber Settings',
    description: 'Target temperature, humidity and gas thresholds',
    screen: 'ChamberSettings',
  },
  {
    icon: 'bell-outline',
    label: 'Notifications',
    description: 'Configure push notification preferences',
    screen: 'Notifications',
  },
  {
    icon: 'calendar-clock-outline',
    label: 'Report Schedule',
    description: 'Set up automated report delivery',
    screen: 'ReportSchedule',
  },
  {
    icon: 'ruler',
    label: 'Units',
    description: 'Change measurement units',
    screen: 'Units',
  },
  {
    icon: 'information-outline',
    label: 'About TropicStore',
    description: 'App version and information',
    screen: 'AboutTropicStore',
  },
];

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNav>();
  const user = useStore((s) => s.user);
  const { logout, loading: loggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Error', 'Unable to sign out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={32} color={Colors.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName ?? 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? 'user@email.com'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              activeOpacity={0.6}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View style={styles.menuIconContainer}>
                <MaterialCommunityIcons name={item.icon} size={22} color={Colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <MaterialCommunityIcons name="logout" size={20} color={Colors.red} />
          <Text style={styles.logoutText}>
            {loggingOut ? 'Signing Out…' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { ...textStyles.h1, color: Colors.textPrimary },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  userInfo: { flex: 1 },
  userName: { ...textStyles.h3, color: Colors.textPrimary },
  userEmail: { ...textStyles.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: { flex: 1 },
  menuLabel: { ...textStyles.label, color: Colors.textPrimary },
  menuDescription: { ...textStyles.caption, color: Colors.textTertiary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: { ...textStyles.label, color: Colors.red },
});
