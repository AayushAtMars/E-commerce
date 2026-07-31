import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useCartStore } from '../../store/cartStore';

type CartNav = NativeStackNavigationProp<CartStackParamList>;
type SummaryRoute = RouteProp<CartStackParamList, 'OrderSummary'>;

export function OrderSummaryScreen() {
  const navigation = useNavigation<CartNav>();
  const route = useRoute<SummaryRoute>();
  const { subtotal, shippingCost, shippingType, selectedAddress, shippingDate } = route.params;
  const { items, appliedPromo } = useCartStore();
  const promoCode = appliedPromo?.code;

  const handleProceedToPayment = () => {
    navigation.navigate('SelectPayment', {
      subtotal,
      shippingCost,
      shippingType,
      promoCode,
      selectedAddress,
    });
  };

  const address = selectedAddress || {
    label: 'Home',
    line1: '245 Madison Ave, New York',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    pincode: '10016',
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.cardRow}>
          <View style={styles.iconCircle}>
            <Feather name="map-pin" size={20} color="#D4A373" />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoTitle}>{address.label}</Text>
            <Text style={styles.infoDesc}>{address.line1}, {address.city}, {address.state} {address.pincode}, {address.country || 'USA'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeBtn}
            onPress={() => navigation.navigate('SelectAddress')}
          >
            <Text style={styles.changeBtnText}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* Choose Shipping Type Section */}
        <Text style={styles.sectionTitle}>Choose Shipping Type</Text>
        <View style={styles.cardRow}>
          <View style={styles.iconCircle}>
            <Feather name="box" size={20} color="#D4A373" />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoTitle}>{shippingType || 'Economy'}</Text>
            <Text style={styles.infoDesc}>{shippingDate || 'Estimated Arrival 11 March 2026'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.changeBtn}
            onPress={() => navigation.navigate('SelectShipping', { subtotal, selectedAddress })}
          >
            <Text style={styles.changeBtnText}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* Order List Section */}
        <Text style={styles.sectionTitle}>Order List</Text>
        <View style={styles.card}>
          {items.map((item, index) => {
            const originalPrice = item.price * 1.25;
            return (
              <View key={index}>
                <View style={styles.productRow}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image }} style={styles.productImage} />
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.productType}>Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                      <Text style={styles.originalPrice}>₹{originalPrice.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
                {index < items.length - 1 && <View style={styles.separator} />}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom CTA Sheet */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 52, paddingBottom: 16, backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  backBtn: { 
    position: 'absolute', left: 24, top: 52,
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  content: { padding: 24, paddingBottom: 120 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  productType: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#fff',
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C3317',
    letterSpacing: 0.5,
  },

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
