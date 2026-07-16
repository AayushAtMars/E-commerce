import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


type CartNav = NativeStackNavigationProp<CartStackParamList>;
type SuccessRoute = RouteProp<CartStackParamList, 'PaymentSuccess'>;

export function PaymentSuccessScreen() {
  const navigation = useNavigation<CartNav>();
  const route = useRoute<SuccessRoute>();
  const { orderId } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  const goHome = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'CartScreen' }] })
    );
    navigation.getParent()?.navigate('Home');
  };

  const viewOrder = () => {
    // Navigate to the Order Detail screen in the Profile stack
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'CartScreen' }] })
    );
    navigation.getParent()?.navigate('Profile', { 
      screen: 'OrderDetail', 
      params: { orderId } 
    });
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goHome}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.badgeContainer, { transform: [{ scale: scaleAnim }] }]}>
          <MaterialCommunityIcons name="check-decagram" size={140} color={colors.primary} />
        </Animated.View>

        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSub}>Thank you for your purchase.</Text>
      </View>

      <View style={styles.bottomSheet}>
        <TouchableOpacity style={styles.viewOrderBtn} onPress={viewOrder}>
          <Text style={styles.viewOrderBtnText}>View Order</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.eReceiptBtn} 
          onPress={() => navigation.navigate('EReceipt', { orderId })}
        >
          <Text style={styles.eReceiptBtnText}>View E-Receipt</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 60, // offset for bottom buttons
  },
  badgeContainer: {
    marginBottom: 32,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  successTitle: { fontSize: 24, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 12, textAlign: 'center' },
  successSub: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  bottomSheet: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xxl,
  },
  viewOrderBtn: {
    width: '100%', height: 56, borderRadius: spacing.borderRadius.pill, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  viewOrderBtnText: { color: colors.white, fontSize: 16, fontWeight: typography.weights.bold },
  eReceiptBtn: {
    width: '100%', height: 56,
    justifyContent: 'center', alignItems: 'center',
  },
  eReceiptBtnText: { color: '#F8A44C', fontSize: 16, fontWeight: typography.weights.bold },
});
