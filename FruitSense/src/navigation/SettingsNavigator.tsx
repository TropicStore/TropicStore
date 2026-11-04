import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationParamList } from '../types';
import { Colors } from '../constants/colors';
import { fontSize, fontWeight } from '../constants/typography';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import MonitoringThresholdsScreen from '../screens/settings/MonitoringThresholdsScreen';
import ChamberSettingsScreen from '../screens/settings/ChamberSettingsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import ReportScheduleScreen from '../screens/settings/ReportScheduleScreen';
import UnitsScreen from '../screens/settings/UnitsScreen';
import AboutTropicStoreScreen from '../screens/settings/AboutTropicStoreScreen';

type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
  MonitoringThresholds: undefined;
  ChamberSettings: undefined;
  Notifications: undefined;
  ReportSchedule: undefined;
  Units: undefined;
  AboutTropicStore: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const BackButton: React.FC = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
    </TouchableOpacity>
  );
};

const SettingsStackContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const route = useRoute<RouteProp<SettingsStackParamList>>();

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    const isRoot = route.name === 'Settings';
    parent.setOptions({
      tabBarStyle: isRoot
        ? {
            backgroundColor: Colors.white,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 85,
            paddingTop: 8,
            paddingBottom: 24,
          }
        : { display: 'none' },
    });

    return () => {
      parent.setOptions({
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 24,
        },
      });
    };
  }, [navigation, route.name]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MonitoringThresholds" component={MonitoringThresholdsScreen} />
      <Stack.Screen name="ChamberSettings" component={ChamberSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ReportSchedule" component={ReportScheduleScreen} />
      <Stack.Screen name="Units" component={UnitsScreen} />
      <Stack.Screen name="AboutTropicStore" component={AboutTropicStoreScreen} />
    </Stack.Navigator>
  );
};

export const SettingsNavigator: React.FC = () => {
  return <SettingsStackContent />;
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: Colors.background,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: Colors.textPrimary,
  },
});

export default SettingsNavigator;
