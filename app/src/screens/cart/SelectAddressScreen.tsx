import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useCartStore } from '../../store/cartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApiModule, Address } from '../../api/address.api';

type CartNav = NativeStackNavigationProp<CartStackParamList>;

export function SelectAddressScreen() {
  const navigation = useNavigation<CartNav>();
  const { total } = useCartStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressApiModule.getAddresses();
      return res.data.data.addresses as Address[];
    },
  });

  useEffect(() => {
    if (!selectedId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedId(defaultAddr._id);
    }
  }, [addresses, selectedId]);

  // Note: We use useQueryClient to invalidate on returning to this screen
  // if an address was added, but react-query does this on mount usually.

  const handleContinue = () => {
    if (!selectedId) {
      Alert.alert('Select Address', 'Please select a delivery address.');
      return;
    }
    const addr = addresses.find((a) => a._id === selectedId);
    navigation.navigate('SelectShipping', { subtotal: total(), selectedAddress: addr });
  };



  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Address</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Addresses Container */}
        <View style={styles.addressesContainer}>
          {isLoading ? (
            <ActivityIndicator color="#3E1F0F" style={{ padding: 20 }} />
          ) : addresses.length === 0 ? (
            <Text style={{ textAlign: 'center', padding: 20, color: '#999' }}>No addresses found. Please add one.</Text>
          ) : (
            addresses.map((item, index) => {
              const isSelected = selectedId === item._id;
              return (
                <View key={item._id}>
                  <TouchableOpacity 
                    style={styles.addressRow}
                    onPress={() => setSelectedId(item._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconCircle}>
                      <Feather name="map-pin" size={16} color="#3E1F0F" />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{item.label}</Text>
                      <Text style={styles.addressText}>{item.line1}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                  {index < addresses.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })
          )}
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity 
          style={styles.addBtnContainer}
          onPress={() => navigation.navigate('AddAddress', {})}
        >
          <Text style={styles.addBtnText}>+ Add New Shipping Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button Area */}
      <View style={styles.bottomCta}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 52, paddingBottom: 16, backgroundColor: '#F8F8F8',
    position: 'relative',
  },
  backBtn: { 
    position: 'absolute', left: 24, top: 52,
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  addressesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  addressRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4EFEB',
    justifyContent: 'center', alignItems: 'center'
  },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  addressText: { fontSize: 13, color: '#999', lineHeight: 18 },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#3E1F0F',
    justifyContent: 'center', alignItems: 'center'
  },
  radioCircleSelected: { borderColor: '#3E1F0F', borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3E1F0F' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 76, marginRight: 16 },

  addBtnContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3E1F0F',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  addBtnText: { color: '#3E1F0F', fontSize: 15, fontWeight: '600' },

  bottomCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16,
    backgroundColor: '#F8F8F8' // Or transparent if you prefer
  },
  continueBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center'
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },


});
