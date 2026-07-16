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
import * as Notifications from 'expo-notifications';
import Feather from '@expo/vector-icons/Feather';

type NavigationProp = NativeStackNavigationProp<RootParamList, 'NotificationPermission'>;

export function NotificationPermissionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setNeedsNotification } = usePermissionStore();
  const [loading, setLoading] = useState(false);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNeedsNotification(status !== 'granted');
    } catch (e: any) {
      console.log('Error', e);
      setNeedsNotification(false); // Unblock user if it fails
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    // If they choose maybe later, skip prompt
    setNeedsNotification(false);
  };

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Feather name="bell" size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>Enable Notification Access</Text>
        <Text style={styles.sub}>
          Enable notifications to receive real-time{'\n'}updates .
        </Text>

        <View style={styles.btnArea}>
          <Button 
            title="Allow Notification" 
            onPress={handleAllow} 
            loading={loading}
            style={styles.allowBtn}
          />
          <TouchableOpacity
            style={styles.manualBtn}
            onPress={handleLater}
            disabled={loading}
          >
            <Text style={styles.manualText}>Maybe Later</Text>
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
