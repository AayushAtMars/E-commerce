import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/home/SearchScreen';
import { FilterScreen } from '../screens/home/FilterScreen';
import { ProductDetailScreen } from '../screens/home/ProductDetailScreen';
import { ReviewsScreen } from '../screens/home/ReviewsScreen';
import { LeaveReviewScreen } from '../screens/home/LeaveReviewScreen';
import { NotificationPlaceholder } from '../screens/placeholders/NotificationPlaceholder';
import { BestSellersScreen } from '../screens/home/BestSellersScreen';
import { FlashSaleScreen } from '../screens/home/FlashSaleScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Filter" component={FilterScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} />
      <Stack.Screen name="Notifications" component={NotificationPlaceholder} />
      <Stack.Screen name="BestSellers" component={BestSellersScreen} />
      <Stack.Screen name="FlashSale" component={FlashSaleScreen} />
    </Stack.Navigator>
  );
}
