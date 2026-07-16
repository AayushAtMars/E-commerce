import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useCartStore } from '../../store/cartStore';
import { commerceApiModule } from '../../api/commerce.api';
import { WebView } from 'react-native-webview';
import { useQueryClient } from '@tanstack/react-query';

type CartNav = NativeStackNavigationProp<CartStackParamList>;
type PaymentRoute = RouteProp<CartStackParamList, 'SelectPayment'>;

type PaymentMethodType = 'UPI' | 'Credit/Debit Card' | 'Netbanking' | 'Cash on Delivery';

// (removed DEMO_ADDRESS)

export function SelectPaymentScreen() {
  const navigation = useNavigation<CartNav>();
  const route = useRoute<PaymentRoute>();
  const queryClient = useQueryClient();
  const { subtotal, shippingCost, shippingType, promoCode, selectedAddress } = route.params;
  const [selected, setSelected] = useState<PaymentMethodType>('UPI');
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const { clearCart, items } = useCartStore();

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const addressToUse = selectedAddress || {
        label: 'Home',
        line1: '245 Madison Ave, New York, NY 10016, USA',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        pincode: '10016',
      };

      if (selected !== 'Cash on Delivery') {
        setShowRazorpay(true);
      } else {
        await processOrder(addressToUse);
      }
    } catch (err: any) {
      Alert.alert(
        'Order Failed',
        err?.message ?? 'Something went wrong. Please try again.'
      );
      setLoading(false);
    }
  };

  const processOrder = async (addressToUse: any) => {
    try {
      const syncItems = items.map(item => ({
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity
      }));
      await commerceApiModule.syncCart(syncItems);
      const cleanAddress = {
        label: addressToUse.label,
        line1: addressToUse.line1,
        floor: addressToUse.floor,
        city: addressToUse.city,
        state: addressToUse.state,
        country: addressToUse.country,
        pincode: addressToUse.pincode,
      };

      const res = await commerceApiModule.createOrder({
        shippingAddress: cleanAddress,
        shippingType,
        paymentMethod: selected,
        promoCode,
      });

      // Clear the local cart
      clearCart();

      // Invalidate orders cache
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });

      // Navigate to success
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Home' as any },
            {
              name: 'PaymentSuccess' as any,
              params: {
                orderId: res.data.data.order._id,
                orderNumber: res.data.data.order.orderNumber,
                total: res.data.data.order.total,
              },
            },
          ],
        })
      );
    } catch (err: any) {
      Alert.alert(
        'Order Failed',
        err?.message ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRadio = (isSelected: boolean) => (
    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
      {isSelected && <View style={styles.radioDot} />}
    </View>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Digital Payments (via Razorpay)</Text>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setSelected('UPI')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="amazon-pay" size={20} color="#3395FF" style={styles.iconBorder} />
          <Text style={styles.cardLabel}>UPI (GPay, PhonePe, Paytm)</Text>
          {renderRadio(selected === 'UPI')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setSelected('Credit/Debit Card')}
          activeOpacity={0.7}
        >
          <Feather name="credit-card" size={20} color="#B58463" style={styles.iconBorder} />
          <Text style={styles.cardLabel}>Credit / Debit / ATM Card</Text>
          {renderRadio(selected === 'Credit/Debit Card')}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setSelected('Netbanking')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="university" size={20} color="#8D6E63" style={styles.iconBorder} />
          <Text style={styles.cardLabel}>Netbanking (All Banks)</Text>
          {renderRadio(selected === 'Netbanking')}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Pay on Delivery</Text>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => setSelected('Cash on Delivery')}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="money-bill-wave" size={20} color="#2E7D32" style={styles.iconBorder} />
          <Text style={styles.cardLabel}>Cash on Delivery (COD)</Text>
          {renderRadio(selected === 'Cash on Delivery')}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom CTA Sheet */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleConfirmPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueBtnText}>Confirm Payment</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Razorpay WebView Modal */}
      <Modal visible={showRazorpay} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 40 }}>
          <TouchableOpacity 
            style={{ padding: 16, alignSelf: 'flex-start' }}
            onPress={() => { setShowRazorpay(false); setLoading(false); }}
          >
            <Feather name="x" size={24} color="#000" />
          </TouchableOpacity>
          <WebView
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
                </head>
                <body style="background-color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                  <script>
                    var options = {
                      "key": "${process.env.EXPO_PUBLIC_RAZORPAY_KEY}", 
                      "amount": "${Math.max((subtotal + shippingCost) * 100, 10000)}", 
                      "currency": "INR",
                      "name": "Premium Store",
                      "description": "Test Order Payment",
                      "image": "https://i.imgur.com/3g7nmJC.png",
                      "handler": function (response){
                          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', data: response }));
                      },
                      "prefill": {
                          "name": "John Doe",
                          "email": "test@example.com",
                          "contact": "9191919191"
                      },
                      "theme": {
                          "color": "#3E1F0F"
                      },
                      "modal": {
                        "ondismiss": function() {
                           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'dismiss' }));
                        }
                      }
                    };
                    setTimeout(() => {
                      var rzp1 = new Razorpay(options);
                      rzp1.open();
                    }, 500);
                  </script>
                </body>
                </html>
              `
            }}
            onMessage={async (event) => {
              try {
                const res = JSON.parse(event.nativeEvent.data);
                if (res.type === 'success') {
                  setShowRazorpay(false);
                  await processOrder(selectedAddress || {
                    label: 'Home',
                    line1: '245 Madison Ave, New York, NY 10016, USA',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    pincode: '10016',
                  });
                } else if (res.type === 'dismiss') {
                  setShowRazorpay(false);
                  setLoading(false);
                }
              } catch (e) {
                console.log(e);
              }
            }}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
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
  
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  groupedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBorder: {
    borderWidth: 1.5,
    borderColor: '#B58463',
    borderRadius: 8,
    padding: 4,
    marginRight: 16,
    width: 32,
    height: 32,
    textAlign: 'center',
  },
  logoContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardLabel: { 
    flex: 1, 
    fontSize: 15, 
    color: '#1A1A1A',
    fontWeight: '500'
  },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#E8E8E8',
    justifyContent: 'center', alignItems: 'center'
  },
  radioCircleSelected: { borderColor: '#3E1F0F', borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3E1F0F' },
  separator: { height: 1, backgroundColor: '#F0F0F0' },

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
