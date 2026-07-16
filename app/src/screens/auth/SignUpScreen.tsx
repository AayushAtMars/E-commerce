import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Dimensions,
  Platform
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
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, { message: 'You must accept the Terms & Conditions' }),
});

type FormData = z.infer<typeof schema>;

export function SignUpScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', terms: undefined as unknown as true },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.signup({ name: data.name, email: data.email, password: data.password });
      navigation.navigate('VerifyOtp', { email: data.email, mode: 'signup' });
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err?.message ?? 'Something went wrong. Please try again.');
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
      bounces={false}
    >
      {/* Top background area */}
      <ImageBackground
        source={require('../../../assets/images/auth/signup_bg.png')}
        style={styles.bgImage}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.overlay} />
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Fill your information below or register{'\n'}with your social account.</Text>
        </View>
      </ImageBackground>

      {/* White form sheet */}
      <View style={styles.sheet}>
        
        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Coming soon')}
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Coming soon')}
          >
            <FontAwesome5 name="google" size={20} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => Alert.alert('Coming soon')}
          >
            <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>Or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              error={errors.name?.message}
              autoCapitalize="words"
              inputWrapperStyle={styles.customInput}
            />
          )}
        />

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
              inputWrapperStyle={styles.customInput}
            />
          )}
        />

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
              inputWrapperStyle={styles.customInput}
            />
          )}
        />

        {/* Terms checkbox */}
        <Controller
          control={control}
          name="terms"
          render={({ field: { onChange } }) => (
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => {
                const next = !termsAccepted;
                setTermsAccepted(next);
                onChange(next ? true : (undefined as unknown as true));
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
                {termsAccepted && <Feather name="check" size={14} color={colors.white} />}
              </View>
              <Text style={styles.termsText}>
                Agree with{' '}
                <Text style={styles.termsLink}>Terms &amp; Condition</Text>
              </Text>
            </TouchableOpacity>
          )}
        />
        {errors.terms && <Text style={styles.errorText}>{errors.terms.message}</Text>}

        <View style={{ height: spacing.lg }} />
        
        <Button 
          title="Sign Up" 
          onPress={handleSubmit(onSubmit)} 
          loading={loading} 
        />

        <TouchableOpacity
          style={styles.signinRow}
          onPress={() => navigation.replace('SignIn')}
        >
          <Text style={styles.signinText}>
            Already have an account?{' '}
            <Text style={styles.signinLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { flexGrow: 1, backgroundColor: colors.white },
  bgImage: {
    width: SCREEN_W,
    height: SCREEN_H * 0.42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 37, 17, 0.75)', // Dark brown with 75% opacity
  },
  headerContent: {
    paddingHorizontal: spacing.screenHorizontal,
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -40,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 32,
    paddingBottom: 40,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  customInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: { 
    fontSize: typography.sizes.sm, 
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  termsLink: { 
    color: '#FFB873', // Orange highlight
    textDecorationLine: 'underline',
  },
  errorText: { fontSize: typography.sizes.sm, color: colors.danger, marginTop: 4 },
  signinRow: { marginTop: spacing.xl, alignItems: 'center' },
  signinText: { fontSize: typography.sizes.sm, color: colors.textPrimary },
  signinLink: { color: '#FFB873', textDecorationLine: 'underline' },
});
