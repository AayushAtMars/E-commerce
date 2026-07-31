import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { LocationPermissionScreen } from '../screens/permissions/LocationPermissionScreen';
import { NotificationPermissionScreen } from '../screens/permissions/NotificationPermissionScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { TicketDetailScreen } from '../screens/profile/TicketDetailScreen';
import { AddAddressScreen } from '../screens/profile/AddAddressScreen';
import { useAuthStore } from '../store/authStore';
import { usePermissionStore } from '../store/permissionStore';
import type { RootParamList } from './types';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { colors } from '../theme/colors';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const Root = createNativeStackNavigator<RootParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading: isAuthLoading, hydrate } = useAuthStore();
  const { needsLocation, needsNotification, setNeedsLocation, setNeedsNotification } = usePermissionStore();
  const [checkingPerms, setCheckingPerms] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);

  useEffect(() => {
    async function checkSettings() {
      try {
        const isAndroidEmulator = Platform.OS === 'android' && __DEV__;
        const DEV_HOST = isAndroidEmulator ? '10.0.2.2' : 'localhost';
        const CATALOG_BASE_URL = process.env.EXPO_PUBLIC_CATALOG_URL ?? `http://${DEV_HOST}:4001`;

        const res = await fetch(`${CATALOG_BASE_URL}/api/settings`);
        const json = await res.json();
        
        if (json.data?.settings?.maintenanceMode) {
          setIsMaintenance(true);
        }
      } catch (e) {
        console.warn('Failed to fetch settings:', e);
      } finally {
        setFetchingSettings(false);
      }
    }
    checkSettings();
  }, []);

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

        // Skip actual notification check in Expo Go since the package crashes in SDK 53
        setNeedsNotification(false);
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

  if (isAuthLoading || checkingPerms || fetchingSettings) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isMaintenance) {
    return (
      <View style={styles.maintenanceContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.primary} />
        <Text style={styles.maintenanceTitle}>We'll be right back!</Text>
        <Text style={styles.maintenanceText}>
          The app is currently undergoing scheduled maintenance. Please check back later.
        </Text>
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
            <>
              <Root.Screen name="Main" component={MainTabs} />
              <Root.Screen name="Settings" component={SettingsScreen} />
              <Root.Screen name="HelpCenter" component={HelpCenterScreen} />
              <Root.Screen name="TicketDetail" component={TicketDetailScreen as any} />
              <Root.Screen name="AddAddress" component={AddAddressScreen} />
            </>
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
    backgroundColor: colors.white, 
  },
  maintenanceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 32,
  },
  maintenanceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  maintenanceText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
