import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';

type CartNav = NativeStackNavigationProp<CartStackParamList>;
type ShippingRoute = RouteProp<CartStackParamList, 'SelectShipping'>;

const SHIPPING_OPTIONS = [
  {
    type: 'Economy' as const,
    label: 'Economy',
    desc: 'Estimated Arrival  11 March 2026',
    iconName: 'box',
    cost: 49,
  },
  {
    type: 'Cargo' as const,
    label: 'Cargo',
    desc: 'Estimated Arrival  09 March 2026',
    iconName: 'truck',
    cost: 99,
  },
  {
    type: 'Express' as const,
    label: 'Express',
    desc: 'Estimated Arrival  08 March 2026',
    iconName: 'zap',
    cost: 149,
  }
];

export function SelectShippingScreen() {
  const navigation = useNavigation<CartNav>();
  const route = useRoute<ShippingRoute>();
  const { subtotal, selectedAddress } = route.params;
  const [selected, setSelected] = useState<'Economy' | 'Cargo' | 'Express'>('Economy');

  const selectedOpt = SHIPPING_OPTIONS.find((o) => o.type === selected)!;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Shipping</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Options Container */}
        <View style={styles.optionsContainer}>
          {SHIPPING_OPTIONS.map((opt, index) => {
            const isSelected = selected === opt.type;
            return (
              <View key={opt.type}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setSelected(opt.type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Feather name={opt.iconName as any} size={20} color="#3E1F0F" />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionLabel}>{opt.label}</Text>
                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                  </View>
                  <Text style={styles.optionCost}>₹{opt.cost < 10 ? `0${opt.cost}` : opt.cost}</Text>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
                {index < SHIPPING_OPTIONS.length - 1 && <View style={styles.separator} />}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA Sheet */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => {
            const shippingDateMatch = selectedOpt.desc.match(/Estimated Arrival\s*(.*)/);
            const shippingDate = shippingDateMatch ? shippingDateMatch[1] : selectedOpt.desc;

            navigation.navigate('OrderSummary', {
              subtotal,
              shippingCost: selectedOpt.cost,
              shippingType: selectedOpt.type,
              selectedAddress,
              shippingDate,
            });
          }}
        >
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
  
  content: { padding: 24, paddingBottom: 120 },
  
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#F4EFEB',
    justifyContent: 'center', alignItems: 'center'
  },
  optionInfo: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  optionDesc: { fontSize: 13, color: '#999', lineHeight: 18 },
  optionCost: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#3E1F0F',
    justifyContent: 'center', alignItems: 'center', marginLeft: 8
  },
  radioCircleSelected: { borderColor: '#3E1F0F', borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3E1F0F' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 80, marginRight: 16 },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
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
