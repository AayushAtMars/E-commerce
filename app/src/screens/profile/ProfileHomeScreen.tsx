import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

const MENU_ITEMS = [
  { icon: 'user', label: 'Your profile', screen: 'YourProfile' },
  { icon: 'map-pin', label: 'Manage Address', screen: 'ManageAddress' },
  { icon: 'credit-card', label: 'Payment Methods', screen: 'PaymentMethods' },
  { icon: 'clipboard', label: 'My Orders', screen: 'MyOrders' },
  { icon: 'tag', label: 'My Coupons', screen: 'MyCoupons' },
  { icon: 'briefcase', label: 'My Wallet', screen: 'MyWallet' },
  { icon: 'settings', label: 'Settings', screen: 'Settings' },
];

export function ProfileHomeScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { user } = useAuthStore();

  const primaryColor = '#9E5B35'; // The brownish-orange from the design

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                <Feather name="user" size={48} color="#999" />
              </View>
            )}
            <TouchableOpacity style={styles.editBadge} onPress={() => navigation.navigate('YourProfile')}>
              <Feather name="edit-2" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Jennifer Aaker'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, idx) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => navigation.navigate(item.screen as never)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Feather name={item.icon as any} size={20} color={primaryColor} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={22} color={primaryColor} />
              </TouchableOpacity>
              {idx < MENU_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  scroll: {
    paddingHorizontal: 24,
  },

  avatarSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A2A1A', // Dark brown from the design
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F8F9FB',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  menuContainer: {
    marginTop: 10,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginLeft: 60,
  },
});
