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
import { useAuthStore } from '../../store/authStore';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export function SignInScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { accessToken, refreshToken, user } = res.data.data;
      await setTokens(accessToken, refreshToken);
      setUser(user);
      // RootNavigator automatically switches to Main tab when isAuthenticated=true
    } catch (err: any) {
      if (err?.message === 'Please verify your email before logging in.') {
        try {
          await authApi.resendOtp({ email: data.email, purpose: 'signup' });
          navigation.navigate('VerifyOtp', { email: data.email, mode: 'signup' });
        } catch (resendErr: any) {
          Alert.alert('Error', resendErr?.message ?? 'Could not send verification email.');
        }
      } else {
        Alert.alert('Sign In Failed', err?.message ?? 'Invalid credentials. Please try again.');
      }
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
        source={require('../../../assets/images/auth/signup_bg.jpg')}
        style={styles.bgImage}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.overlay} />
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Let's get you Login!</Text>
          <Text style={styles.sub}>Hi! Welcome back, you've been missed</Text>
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
          <Text style={styles.orText}>Or sign in with</Text>
          <View style={styles.dividerLine} />
        </View>

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

        <TouchableOpacity
          style={styles.forgotRow}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <Button 
          title="Sign In" 
          onPress={handleSubmit(onSubmit)} 
          loading={loading} 
        />

        <TouchableOpacity
          style={styles.signupRow}
          onPress={() => navigation.replace('SignUp')}
        >
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotRow: { alignSelf: 'flex-end', marginBottom: spacing.lg, minHeight: 44, justifyContent: 'center' },
  forgotText: { color: '#FFB873', fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  signupRow: { marginTop: spacing.xl, alignItems: 'center' },
  signupText: { fontSize: typography.sizes.sm, color: colors.textPrimary },
  signupLink: { color: '#FFB873', textDecorationLine: 'underline' },
});
