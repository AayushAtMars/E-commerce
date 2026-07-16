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

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      Alert.alert(
        'OTP Sent',
        `If an account exists for ${data.email}, you'll receive an OTP in your console (dev mode).`,
        [{ text: 'OK', onPress: () => navigation.navigate('VerifyOtp', { email: data.email, mode: 'forgotPassword' }) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong.');
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
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.sub}>
          Enter your registered email. We'll send you a verification code.
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              placeholder="example@gmail.com"
              value={value}
              onChangeText={onChange}
              error={errors.email?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <View style={{ marginTop: spacing.lg }}>
          <Button title="Send OTP" onPress={handleSubmit(onSubmit)} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, paddingHorizontal: spacing.screenHorizontal, paddingBottom: 40 },
  back: { marginTop: 52, marginBottom: spacing.xl, width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  title: { fontSize: typography.sizes.xxxl, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
});
