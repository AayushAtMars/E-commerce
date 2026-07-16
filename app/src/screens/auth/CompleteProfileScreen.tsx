import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AuthNavigationProp } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
});
type FormData = z.infer<typeof schema>;

const GENDERS = ['Male', 'Female', 'Other'] as const;

export function CompleteProfileScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', gender: undefined },
  });

  const selectedGender = watch('gender');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.completeProfile({
        name: data.name || undefined,
        phone: data.phone || undefined,
        gender: data.gender,
      });
      setUser(res.data.data.user);
      // isAuthenticated is already true — navigate to Main
      // RootNavigator shows MainTabs automatically; we just need to do nothing
      // or explicitly reset. Since token is already in store, state already switches.
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.sub}>
        Don't worry, only you can see your personal data. No one else will be able to see it.
      </Text>

      {/* Avatar placeholder */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>✏️</Text>
        </View>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Name"
            placeholder="Ex. John Doe"
            value={value ?? ''}
            onChangeText={onChange}
            autoCapitalize="words"
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Phone Number"
            placeholder="Enter Phone Number"
            value={value ?? ''}
            onChangeText={onChange}
            keyboardType="phone-pad"
          />
        )}
      />

      {/* Gender picker */}
      <Text style={styles.genderLabel}>Gender</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderChip, selectedGender === g && styles.genderChipActive]}
            onPress={() => setValue('gender', g)}
            accessibilityLabel={`Select gender ${g}`}
          >
            <Text style={[styles.genderChipText, selectedGender === g && styles.genderChipTextActive]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Button title="Complete Profile" onPress={handleSubmit(onSubmit)} loading={loading} />
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
            // Skip — user is already authenticated, RootNavigator will show Main
            setUser({ name: '', email: '', _id: '', authProvider: 'local', createdAt: '' } as any);
          }}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingBottom: 40 },
  back: { marginTop: 52, marginBottom: spacing.lg, width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  sub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  avatarText: { fontSize: 40 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  editBadgeText: { fontSize: 12 },
  genderLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  genderRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  genderChip: {
    paddingHorizontal: spacing.md,
    height: 40,
    borderRadius: spacing.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: { fontSize: typography.sizes.md, color: colors.textSecondary },
  genderChipTextActive: { color: colors.white, fontWeight: typography.weights.semibold },
  skipBtn: { alignItems: 'center', marginTop: spacing.md, minHeight: 44, justifyContent: 'center' },
  skipText: { color: colors.textSecondary, fontSize: typography.sizes.md },
});
