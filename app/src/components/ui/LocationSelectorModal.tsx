import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Input } from './Input';
import { Button } from './Button';
import { useLocationStore } from '../../store/locationStore';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LocationSelectorModal({ visible, onClose }: LocationSelectorModalProps) {
  const { currentLocation, setLocation } = useLocationStore();
  const [manualLocation, setManualLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant location permissions to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const city = place.city || place.subregion || place.region || 'Unknown City';
        const country = place.country || place.isoCountryCode || '';
        
        const formattedLocation = country ? `${city}, ${country}` : city;
        setLocation(formattedLocation);
        onClose();
      } else {
        Alert.alert('Error', 'Could not determine your location.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get location. Please try again or enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveManualLocation = () => {
    if (manualLocation.trim()) {
      setLocation(manualLocation.trim());
      setManualLocation('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Select Location</Text>
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.currentLocationRow}>
              <Text style={styles.label}>Current Location:</Text>
              <Text style={styles.currentValue}>{currentLocation}</Text>
            </View>

            <Button
              title="📍 Use Current Location"
              variant="outline"
              onPress={handleUseCurrentLocation}
              disabled={loading}
              style={styles.autoLocationBtn}
            />
            {loading && <ActivityIndicator color={colors.primary} style={styles.loader} />}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Text style={styles.label}>Enter manually:</Text>
            <Input
              placeholder="e.g. London, UK"
              value={manualLocation}
              onChangeText={setManualLocation}
              returnKeyType="done"
              onSubmitEditing={handleSaveManualLocation}
            />

            <Button
              title="Save Location"
              onPress={handleSaveManualLocation}
              disabled={!manualLocation.trim()}
              style={styles.saveBtn}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: spacing.screenHorizontal,
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  currentValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  autoLocationBtn: {
    marginBottom: spacing.sm,
  },
  loader: {
    marginTop: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  saveBtn: {
    marginTop: spacing.lg,
  },
});
