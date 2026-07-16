import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { HomeStack } from './HomeStack';
import { CartStack } from './CartStack';
import { ProfileStack } from './ProfileStack';
import { ChatStack } from './ChatStack';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';
import { useCartStore } from '../store/cartStore';

import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder for tabs not yet in phase 2
const PlaceholderScreen = ({ route }: { route: { name: string } }) => (
  <View style={styles.center}>
    <Text style={styles.placeholderText}>{route.name}</Text>
    <Text style={styles.placeholderSub}>Coming in a future phase</Text>
  </View>
);

const getIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case 'Home': return focused ? 'home' : 'home-outline';
    case 'Cart': return focused ? 'bag' : 'bag-outline';
    case 'Wishlist': return focused ? 'heart' : 'heart-outline';
    case 'Chat': return focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
    case 'Profile': return focused ? 'person' : 'person-outline';
    default: return 'help';
  }
};

const renderIcon = (routeName: string, focused: boolean) => {
  const iconName = getIconName(routeName, focused);
  const color = focused ? colors.primary : colors.white;
  // Use Feather for Wishlist if preferred, but Ionicons has a good matching set
  return <Ionicons name={iconName as any} size={26} color={color} />;
};

function CartTabIcon({ focused }: { focused: boolean }) {
  const itemCount = useCartStore((s) => s.itemCount());
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      {renderIcon('Cart', focused)}
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
}

const TabIcon = ({ focused, label }: { focused: boolean; label: string }) => (
  <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
    {renderIcon(label, focused)}
  </View>
);

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} label={route.name} />,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';
          const isHidden = ['ProductDetail', 'Reviews', 'LeaveReview', 'Search', 'Filter'].includes(routeName);
          return {
            tabBarStyle: isHidden ? { display: 'none' } : styles.tabBar,
          };
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{ 
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} /> 
        }}
      />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen 
        name="Chat" 
        component={ChatStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ChatHome';
          const isHidden = ['ChatDetail'].includes(routeName);
          return {
            tabBarStyle: isHidden ? { display: 'none' } : styles.tabBar,
          };
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack} 
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ProfileHome';
          const isHidden = ['MyOrders', 'OrderDetail', 'TrackOrder', 'TrackLiveLocation', 'TopUpSuccess', 'MyWallet', 'Settings', 'NotificationSettings', 'PasswordManager', 'DeleteAccount'].includes(routeName);
          return {
            tabBarStyle: isHidden ? { display: 'none' } : styles.tabBar,
          };
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: { fontSize: 18, color: colors.textPrimary, fontWeight: '700', marginBottom: 8 },
  placeholderSub: { fontSize: 14, color: colors.textSecondary },
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
    backgroundColor: '#1E2029', // Dark background as per screenshot
    borderRadius: 22,
    height: 76,
    borderTopWidth: 0,
    marginHorizontal:10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    paddingHorizontal: 8,
    paddingBottom: 0, // override default padding on iOS
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginTop:38,
    width: 68,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: { 
    backgroundColor: colors.white,
    paddingHorizontal:10
   },
  badge: {
    position: 'absolute',
    top: 5,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, color: colors.white, fontWeight: '700' },
});
