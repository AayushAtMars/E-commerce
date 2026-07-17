import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AuthNavigationProp, AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import Feather from '@expo/vector-icons/Feather';

type NewPasswordRoute = RouteProp<AuthStackParamList, 'NewPassword'>;

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(8, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

export function NewPasswordScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<NewPasswordRoute>();
  const { email, otp } = route.params;
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.resetPassword({ email, code: otp, newPassword: data.password });
      const { accessToken, refreshToken, user } = res.data.data;
      await setTokens(accessToken, refreshToken);
      setUser(user);
      // isAuthenticated becomes true → RootNavigator shows MainTabs
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.title}>New Password</Text>
        <Text style={styles.sub}>
          Your new password must be different from previously used passwords.
        </Text>

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              placeholder="••••••••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.password?.message}
              secureTextEntry
            />
          )}
        />

        <Controller
          control={control}
          name="confirm"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="••••••••••••••"
              value={value}
              onChangeText={onChange}
              error={errors.confirm?.message}
              secureTextEntry
            />
          )}
        />

        <View style={styles.buttonContainer}>
          <Button title="Create New Password" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.submitBtn} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingBottom: 40 },
  back: {
    marginTop: 60,
    marginBottom: spacing.xl,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  title: { fontSize: 28, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 22, marginBottom: 40 },
  buttonContainer: { marginTop: spacing.xl, width: '100%' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: '100%',
  },
});
