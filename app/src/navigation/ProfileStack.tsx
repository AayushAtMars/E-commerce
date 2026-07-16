import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';

import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { YourProfileScreen } from '../screens/profile/YourProfileScreen';
import { ManageAddressScreen } from '../screens/profile/ManageAddressScreen';
import { AddAddressScreen } from '../screens/profile/AddAddressScreen';
import { MyCouponsScreen } from '../screens/profile/MyCouponsScreen';
import { MyWalletScreen } from '../screens/profile/MyWalletScreen';
import { TopUpSuccessScreen } from '../screens/profile/TopUpSuccessScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { PasswordManagerScreen } from '../screens/profile/PasswordManagerScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { PrivacyPolicyScreen } from '../screens/profile/PrivacyPolicyScreen';

import { MyOrdersScreen } from '../screens/orders/MyOrdersScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { TrackOrderScreen } from '../screens/orders/TrackOrderScreen';
import { LiveLocationScreen } from '../screens/orders/LiveLocationScreen';
import { EReceiptScreen } from '../screens/cart/EReceiptScreen';
import { ProfilePlaceholder } from '../screens/placeholders/ProfilePlaceholder';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Profile home */}
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />

      {/* Phase 5 — real screens */}
      <Stack.Screen name="YourProfile" component={YourProfileScreen} />
      <Stack.Screen name="ManageAddress" component={ManageAddressScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="MyCoupons" component={MyCouponsScreen} />
      <Stack.Screen name="MyWallet" component={MyWalletScreen} />
      <Stack.Screen name="TopUpSuccess" component={TopUpSuccessScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PasswordManager" component={PasswordManagerScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />

      {/* Order flow */}
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      <Stack.Screen name="TrackLiveLocation" component={LiveLocationScreen} />
      <Stack.Screen name="EReceipt" component={EReceiptScreen} />

      {/* Stubs — Phase 6+ */}
      <Stack.Screen name="PaymentMethods" component={ProfilePlaceholder} />
      <Stack.Screen name="AddCard" component={ProfilePlaceholder} />
      <Stack.Screen name="LeaveReview" component={ProfilePlaceholder} />
    </Stack.Navigator>
  );
}
