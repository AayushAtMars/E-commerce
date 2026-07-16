import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { AuthNavigationProp, AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import Feather from '@expo/vector-icons/Feather';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';

type VerifyOtpRoute = RouteProp<AuthStackParamList, 'VerifyOtp'>;

export function VerifyOtpScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<VerifyOtpRoute>();
  const { email, mode } = route.params;
  const { setTokens, setUser } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleDigitChange = (text: string, idx: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter all 4 digits.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await authApi.verifyOtp({ email, code, purpose: 'signup' });
        const { accessToken, refreshToken, user } = res.data.data;
        await setTokens(accessToken, refreshToken);
        setUser(user);
        navigation.replace('LocationPermission');
      } else {
        // forgotPassword — just verify then go to NewPassword
        await authApi.verifyOtp({ email, code, purpose: 'forgotPassword' });
        navigation.replace('NewPassword', { email, otp: code });
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err?.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendOtp({ email, purpose: mode === 'signup' ? 'signup' : 'forgotPassword' });
      setResendCooldown(60);
      Alert.alert('OTP Sent', 'A new code has been sent. Check your console (dev mode).');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Could not resend OTP.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.sub}>
          Enter the verification code we sent to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* 4-digit OTP inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { if (ref) inputRefs.current[i] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleDigitChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              accessibilityLabel={`OTP digit ${i + 1}`}
              placeholder="-"
              placeholderTextColor="#B0B0B0"
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive OTP?</Text>
          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[styles.resendBtn, resendCooldown > 0 && styles.resendDisabled]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 40, width: '100%' }}>
          <Button title="Verify" onPress={handleVerify} loading={loading} style={styles.verifyBtn} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  back: {
    marginTop: 60,
    marginLeft: spacing.screenHorizontal,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 40,
    textAlign: 'center',
  },
  email: {
    fontWeight: typography.weights.semibold,
    color: colors.primary, // Dark brown email text
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 40,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 0,
    fontSize: 22,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    backgroundColor: '#F5F5F5',
  },
  otpInputFilled: {
    backgroundColor: '#F5F5F5',
  },
  resendContainer: {
    alignItems: 'center',
    gap: 4,
  },
  resendLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resendBtn: {
    fontSize: typography.sizes.sm,
    color: '#FFB873', // Orange highlight
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: colors.textSecondary,
    textDecorationLine: 'none',
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    width: '100%',
  }
});
