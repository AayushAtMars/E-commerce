import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { commerceApiModule } from '../../api/commerce.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

type OrderStatus = 'Active' | 'Completed' | 'Cancelled';

const STATUS_FILTERS: Record<OrderStatus, string[]> = {
  Active: ['Placed', 'In Progress', 'On the Way'],
  Completed: ['Delivered'],
  Cancelled: ['Cancelled'],
};

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  items: { 
    productId: string;
    title: string; 
    quantity: number; 
    price: number; 
    image?: string; 
    category?: string; 
    size?: string;
    color?: string;
    rating?: number;
  }[];
  total: number;
  createdAt: string;
}

export function MyOrdersScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<OrderStatus>('Active');
  const queryClient = useQueryClient();
  const { addItem, clearCart } = useCartStore();

  const cancelMutation = useMutation({
    mutationFn: (id: string) => commerceApiModule.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });

  const { data: orders, isLoading, refetch, isRefetching, error } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await commerceApiModule.listOrders();
      return res.data.data.orders as Order[];
    },
    staleTime: 30_000,
  });

  const filtered = (orders ?? []).filter((o) =>
    STATUS_FILTERS[activeTab].includes(o.status)
  );

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addItem({
        productId: item.productId || 'default-id',
        title: item.title,
        price: item.price,
        image: item.image || '',
        size: item.size || 'M',
        color: item.color || 'Black',
        quantity: item.quantity,
      });
    });
    
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Cart',
        params: { screen: 'SelectAddress' },
      })
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['Active', 'Completed', 'Cancelled'] as OrderStatus[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Feather 
                  name={activeTab === 'Active' ? 'package' : activeTab === 'Completed' ? 'check-circle' : 'x-circle'} 
                  size={42} 
                  color="#4A2511" 
                />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab} Orders</Text>
              <Text style={styles.emptySub}>
                {error
                  ? `Failed: ${(error as any)?.message || 'Unknown error'}`
                  : activeTab === 'Active'
                  ? 'Place an order to see it here.'
                  : `Your ${activeTab.toLowerCase()} orders will appear here.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const firstItem = item.items[0];
            if (!firstItem) return null;

            return (
              <View style={styles.orderCard}>
                {/* Top row: order number + status badge */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.orderNumber}>ID : <Text style={styles.orderNumberHash}>{item.orderNumber}</Text></Text>
                  <View style={[styles.statusBadge, activeTab === 'Cancelled' && styles.statusBadgeCancelled]}>
                    <Text style={[styles.statusText, activeTab === 'Cancelled' && styles.statusTextCancelled]}>
                      {activeTab === 'Cancelled' ? 'Cancel Order' : `${activeTab} Order`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.divider} />

                {/* Middle row: product info */}
                {item.items.map((prod, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.productRow, idx > 0 && { marginTop: 12 }]}
                    onPress={() => {
                      if (prod.productId) {
                        (navigation as any).navigate('Home', {
                          screen: 'ProductDetail',
                          params: { productId: prod.productId }
                        });
                      } else {
                        console.warn('No productId found for item', prod);
                      }
                    }}
                  >
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: prod.image }} style={styles.productImage} />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={1}>{prod.title}</Text>
                      <Text style={styles.productMeta}>
                        {prod.category || 'Category'} | Size : {prod.size || 'XS'} | Qty : {prod.quantity}
                      </Text>
                      {prod.rating != null ? (
                        <View style={styles.ratingRow}>
                          <Feather name="star" size={14} color="#FFA500" />
                          <Text style={styles.ratingText}>{prod.rating}</Text>
                        </View>
                      ) : null}
                      <Text style={styles.productPrice}>₹{prod.price.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Bottom row: action buttons */}
                <View style={styles.cardBottomRow}>
                  {activeTab === 'Active' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.cancelBtn, cancelMutation.isPending && { opacity: 0.5 }]}
                        onPress={() => cancelMutation.mutate(item._id)}
                        disabled={cancelMutation.isPending}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.trackBtn}
                        onPress={() => navigation.navigate('TrackOrder', { orderId: item._id })}
                      >
                        <Text style={styles.trackBtnText}>Track Order</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {activeTab === 'Completed' && (
                    <TouchableOpacity 
                      style={styles.trackBtn}
                      onPress={() => navigation.navigate('EReceipt', { orderId: item._id })}
                    >
                      <Text style={styles.trackBtnText}>Receipt</Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'Cancelled' && (
                    <TouchableOpacity 
                      style={styles.trackBtn}
                      onPress={() => handleReorder(item)}
                    >
                      <Text style={styles.trackBtnText}>Re - Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 52, 
    paddingHorizontal: spacing.screenHorizontal, 
    paddingBottom: spacing.md, 
    backgroundColor: '#FAFAFA',
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8'
  },
  headerTitle: { fontSize: 18, fontWeight: typography.weights.bold, color: colors.textPrimary },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingHorizontal: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: { 
    fontSize: 16, 
    fontWeight: typography.weights.medium, 
    color: colors.textSecondary 
  },
  tabTextActive: { 
    color: '#4A2511',
    fontWeight: typography.weights.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '60%',
    height: 3,
    backgroundColor: '#4A2511',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  list: { padding: spacing.screenHorizontal, gap: 16, paddingBottom: 100, paddingTop: 16 },
  orderCard: {
    backgroundColor: colors.white, 
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  orderNumber: { 
    fontSize: 14, 
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  orderNumberHash: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
  },
  statusBadge: { 
    borderRadius: 20, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F48243',
    backgroundColor: '#FFF8F4'
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: typography.weights.bold,
    color: '#F48243'
  },
  statusBadgeCancelled: {
    borderColor: colors.danger,
    backgroundColor: '#FFF0F0'
  },
  statusTextCancelled: {
    color: colors.danger
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  productRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starIcon: {
    color: '#FF9F00',
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  cardBottomRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: { 
    flex: 1,
    backgroundColor: '#F5F5F5', 
    borderRadius: 24, 
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { 
    color: '#4A2511', 
    fontWeight: typography.weights.bold, 
    fontSize: 15 
  },
  trackBtn: { 
    flex: 1,
    backgroundColor: '#4A2511', 
    borderRadius: 24, 
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackBtnText: { 
    color: colors.white, 
    fontWeight: typography.weights.bold, 
    fontSize: 15 
  },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.screenHorizontal },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center' },
});
