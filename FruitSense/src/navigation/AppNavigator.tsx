import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';
import { useStore } from '../store';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator<NavigationParamList>();

const MIN_SPLASH_MS = 2000;

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const isLoading = useStore((s) => s.isLoading);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const restore = useStore.getState().restoreSession();
    const minimum = new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS));
    Promise.all([restore, minimum]).finally(() => setShowSplash(false));
  }, []);

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
