import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function SplashScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const logoScale = new Animated.Value(0.8);
  const logoOpacity = new Animated.Value(0);
  const wordmarkOpacity = new Animated.Value(0);

  useEffect(() => {
    // Logo entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(wordmarkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Navigate after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Svg width="160" height="100" viewBox="0 0 120 80" fill="none">
          <Path 
            d="M60 40 V30 C60 22, 65 17, 70 17 C75 17, 78 20, 78 24 C78 28, 75 31, 72 33 C69 35, 66 37, 66 40" 
            stroke="#FFF" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M60 40 C 40 42, 20 48, 10 55" 
            stroke="#FFF" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          <Path 
            d="M60 40 C 80 42, 100 48, 110 55" 
            stroke="#FFF" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
        </Svg>
        <Animated.View style={{ opacity: wordmarkOpacity }}>
          <Text style={styles.brandName}>Fashion</Text>
          <Text style={styles.brandSub}>STORE</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
  },
  hangerIcon: {
    fontSize: 72,
    marginBottom: 8,
    tintColor: colors.white,
  },
  brandName: {
    fontSize: 48,
    color: colors.accent,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Snell Roundhand', android: 'cursive' }),
    fontWeight: '600',
    marginTop: -10,
  },
  brandSub: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
    letterSpacing: 6,
    marginTop: -4,
    marginBottom: 20,
  },
});
