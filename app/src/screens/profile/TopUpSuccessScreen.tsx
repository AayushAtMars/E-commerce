import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'TopUpSuccess'>;
type RouteProps = RouteProp<ProfileStackParamList, 'TopUpSuccess'>;

export function TopUpSuccessScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const amount = route.params?.amount || 0;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.badgeContainer}>
          {/* Creating a jagged badge effect with rotated squares or just a rounded badge */}
          <View style={styles.badge}>
            <View style={{ transform: [{ rotate: '-45deg' }] }}>
              <Feather name="check" size={60} color="#FFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Top Up Successful!</Text>
        <Text style={styles.subtitle}>
          You have successfully Top-Up e-wallet for ₹{amount.toLocaleString('en-IN')}
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.okBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.okBtnText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Offset for optical centering
  },
  badgeContainer: {
    marginBottom: 30,
  },
  badge: {
    width: 120,
    height: 120,
    backgroundColor: '#3E1F0F',
    borderRadius: 30, // Using a squircle/rounded rect as a close approximation to the badge
    transform: [{ rotate: '45deg' }], // Rotate to make a diamond/star shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  okBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  okBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
