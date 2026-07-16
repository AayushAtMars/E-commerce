import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

export function NotificationSettingsScreen() {
  const navigation = useNavigation<ProfileNav>();

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newArrivals, setNewArrivals] = useState(false);

  const prefsMutation = useMutation({
    mutationFn: () =>
      catalogApiModule.updateNotificationPrefs({ orderUpdates, promotions, newArrivals }),
    onSuccess: () => Alert.alert('Saved', 'Notification preferences updated.'),
  });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <SwitchRow label="Order Updates" desc="Track your order status in real-time" value={orderUpdates} onValueChange={setOrderUpdates} />
          <View style={styles.divider} />
          <SwitchRow label="Promotions" desc="Get alerts on sales and promo codes" value={promotions} onValueChange={setPromotions} />
          <View style={styles.divider} />
          <SwitchRow label="New Arrivals" desc="Be the first to know about new products" value={newArrivals} onValueChange={setNewArrivals} />
        </View>
        
        <TouchableOpacity style={styles.savePrefsBtn} onPress={() => prefsMutation.mutate()}>
          <Text style={styles.savePrefsText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SwitchRow({
  label, desc, value, onValueChange, disabled = false,
}: { label: string; desc: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchInfo}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    zIndex: 10,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: { padding: spacing.screenHorizontal },
  card: { backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginTop: 20 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 56 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  switchInfo: { flex: 1, marginRight: spacing.md },
  switchLabel: { fontSize: typography.sizes.md, fontWeight: typography.weights.medium, color: colors.textPrimary },
  switchDesc: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  savePrefsBtn: { marginTop: 40, marginBottom: spacing.md, backgroundColor: colors.primary, borderRadius: spacing.borderRadius.pill, height: 48, justifyContent: 'center', alignItems: 'center' },
  savePrefsText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.md },
});
