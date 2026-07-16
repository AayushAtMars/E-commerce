import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

export function PaymentMethodsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Active Payment Gateway Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Payment Gateway</Text>
          <Text style={styles.sectionDesc}>
            All transactions and saved cards are securely processed through Razorpay.
          </Text>

          <View style={styles.gatewayCard}>
            <View style={styles.gatewayIconContainer}>
              <Feather name="shield" size={24} color="#3395FF" />
            </View>
            <View style={styles.gatewayInfo}>
              <Text style={styles.gatewayName}>Razorpay Secure</Text>
              <Text style={styles.gatewayStatus}>Active for all orders</Text>
            </View>
            <Feather name="check-circle" size={20} color="#0B9E52" />
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Feather name="info" size={20} color="#666" style={{ marginTop: 2 }} />
          <Text style={styles.infoText}>
            You will be redirected to the secure Razorpay checkout page when placing an order to complete your payment using UPI, Cards, or Netbanking.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#FAFAFA',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  content: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  
  section: {
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20 },
  
  gatewayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  gatewayIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gatewayInfo: { flex: 1 },
  gatewayName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  gatewayStatus: { fontSize: 13, color: '#0B9E52', fontWeight: '500' },
  
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: 14, color: '#666', lineHeight: 22, marginLeft: 12 },
});
