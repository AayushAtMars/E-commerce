import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CartStackParamList } from './types';
import { CartScreen } from '../screens/cart/CartScreen';
import { SelectAddressScreen } from '../screens/cart/SelectAddressScreen';
import { AddAddressScreen } from '../screens/profile/AddAddressScreen';
import { SelectShippingScreen } from '../screens/cart/SelectShippingScreen';
import { SelectPaymentScreen } from '../screens/cart/SelectPaymentScreen';
import { OrderSummaryScreen } from '../screens/cart/OrderSummaryScreen';
import { PaymentSuccessScreen } from '../screens/cart/PaymentSuccessScreen';
import { AddCardScreen } from '../screens/cart/AddCardScreen';
import { EReceiptScreen } from '../screens/cart/EReceiptScreen';

const Stack = createNativeStackNavigator<CartStackParamList>();

export function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="SelectAddress" component={SelectAddressScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="SelectShipping" component={SelectShippingScreen} />
      <Stack.Screen name="SelectPayment" component={SelectPaymentScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="EReceipt" component={EReceiptScreen} />
    </Stack.Navigator>
  );
}
