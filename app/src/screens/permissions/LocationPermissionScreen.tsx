import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { usePermissionStore } from '../../store/permissionStore';
import { useLocationStore } from '../../store/locationStore';
import * as Location from 'expo-location';
import Feather from '@expo/vector-icons/Feather';

type NavigationProp = NativeStackNavigationProp<RootParamList, 'LocationPermission'>;

export function LocationPermissionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setNeedsLocation } = usePermissionStore();
  const { setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in your settings to use this feature.');
        return;
      }

      // Fetch location before moving on so dummy location isn't shown
      try {
        const location = await Location.getCurrentPositionAsync({});
        const geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
        
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          const locationString = [place.city || place.subregion, place.country].filter(Boolean).join(', ');
          setLocation(locationString || 'Unknown Location');
        }
      } catch (e) {
        console.warn('Location fetch failed:', e);
      }

      // Now let the user move on to the main app
      setNeedsLocation(false);
      
    } catch (e: any) {
      console.warn('Permission request error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    // If they choose manual, they skip the permission prompt and go to app
    // In a real app, you might route them to a "Search City" screen.
    setNeedsLocation(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Feather name="map-pin" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>What is Your Location?</Text>
        <Text style={styles.sub}>
          Turn on location services to get better delivery estimates.
        </Text>

        <View style={styles.btnArea}>
          <Button 
            title="Allow Location Access" 
            onPress={handleAllow} 
            loading={loading}
            style={styles.allowBtn}
          />
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={handleManual}
            disabled={loading}
          >
            <Text style={styles.manualText}>Enter Location Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.screenHorizontal,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: spacing.lg,
  },
  btnArea: { width: '100%', gap: spacing.md },
  allowBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
  },
  manualBtn: { 
    alignItems: 'center', 
    minHeight: 44, 
    justifyContent: 'center',
    marginTop: 10,
  },
  manualText: {
    color: '#FFB873',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
