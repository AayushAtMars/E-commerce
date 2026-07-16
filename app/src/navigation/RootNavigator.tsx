import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { LocationPermissionScreen } from '../screens/permissions/LocationPermissionScreen';
import { NotificationPermissionScreen } from '../screens/permissions/NotificationPermissionScreen';
import { useAuthStore } from '../store/authStore';
import { usePermissionStore } from '../store/permissionStore';
import type { RootParamList } from './types';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import * as Location from 'expo-location';
// Notifications removed temporarily to prevent Expo Go error

const Root = createNativeStackNavigator<RootParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading: isAuthLoading, hydrate } = useAuthStore();
  const { needsLocation, needsNotification, setNeedsLocation, setNeedsNotification } = usePermissionStore();
  const [checkingPerms, setCheckingPerms] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function checkPerms() {
      if (isAuthenticated) {
        try {
          const locStatus = await Location.getForegroundPermissionsAsync();
          setNeedsLocation(locStatus.status !== 'granted');
        } catch (e) {
          console.warn('Location permission check failed:', e);
        }

        try {
          // Expo Go SDK 53+ throws big errors even in try/catch if we call Notifications in Expo Go.
          // We bypass it for now.
          setNeedsNotification(true); // Still prompt in UI, but don't call native API
        } catch (e) {
          console.log('Skipping real notification check in Expo Go');
          setNeedsNotification(true); 
        }
      }
      setCheckingPerms(false);
    }
    
    // Check permissions immediately if already authenticated, or when it changes to authenticated
    if (isAuthenticated) {
      setCheckingPerms(true);
      checkPerms();
    } else {
      // If not authenticated, we don't care about blocking the app load for permissions yet.
      // We will just let them go to AuthStack.
      setCheckingPerms(false);
    }
  }, [isAuthenticated, setNeedsLocation, setNeedsNotification]);

  if (isAuthLoading || checkingPerms) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          needsLocation ? (
            <Root.Screen name="LocationPermission" component={LocationPermissionScreen} />
          ) : needsNotification ? (
            <Root.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
          ) : (
            <Root.Screen name="Main" component={MainTabs} />
          )
        ) : (
          <Root.Screen name="Auth" component={AuthStack} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white, // Changed to white for better UX
  },
});
