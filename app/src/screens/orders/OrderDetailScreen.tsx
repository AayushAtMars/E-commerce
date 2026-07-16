import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { commerceApiModule } from '../../api/commerce.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;
type DetailRoute = RouteProp<ProfileStackParamList, 'OrderDetail'>;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'Placed': { bg: '#EEF0FF', text: '#5C5EDB' },
  'In Progress': { bg: '#FFF4E5', text: '#E0820B' },
  'On the Way': { bg: '#E5F6FF', text: '#0B9ED9' },
  'Delivered': { bg: '#E5FAF0', text: '#0B9E52' },
  'Cancelled': { bg: '#FFE5E5', text: '#D93636' },
};

interface OrderItem { title: string; price: number; quantity: number; image: string; size: string; color: string; productId: string; }

export function OrderDetailScreen() {
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<DetailRoute>();
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await commerceApiModule.getOrder(orderId);
      return res.data.data.order;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => commerceApiModule.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      Alert.alert('Cancelled', 'Your order has been cancelled.');
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', axiosErr?.response?.data?.message ?? 'Could not cancel order.');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: () => commerceApiModule.reorder(orderId),
    onSuccess: (res) => {
      const { itemCount } = res.data.data;
      Alert.alert(
        'Added to Cart! 🛍️',
        `${itemCount} item${itemCount > 1 ? 's' : ''} added to your cart.`,
        [
          { text: 'Go to Cart', onPress: () => navigation.getParent()?.navigate('Cart') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', axiosErr?.response?.data?.message ?? 'Could not reorder.');
    },
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  const handleBack = () => {
    // Fix navigation state to ensure we always go to MyOrders
    // instead of popping out to the Home tab and keeping OrderDetail active.
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'ProfileHome' },
          { name: 'MyOrders' },
        ],
      })
    );
  };

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }
  if (!order) return null;

  const sc = STATUS_COLORS[order.status] ?? { bg: colors.background, text: colors.textSecondary };
  const canCancel = ['Placed', 'In Progress'].includes(order.status);
  const isDelivered = order.status === 'Delivered';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusBannerText, { color: sc.text }]}>{order.status}</Text>
          <Text style={styles.orderNumberText}>ORD-{order.orderNumber}</Text>
          <Text style={styles.orderDateText}>
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>

        {/* Items list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item: OrderItem, idx: number) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.itemRow}
              onPress={() => {
                if (item.productId) {
                  (navigation as any).navigate('Home', {
                    screen: 'ProductDetail',
                    params: { productId: item.productId }
                  });
                }
              }}
            >
              <View style={styles.itemImageBox}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <Text style={{ fontSize: 24 }}>👕</Text>
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                {item.size ? <Text style={styles.itemVariant}>Size: {item.size}</Text> : null}
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValNormal}>₹{order.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping ({order.shippingType})</Text>
            <Text style={styles.priceValNormal}>₹{order.shippingCost}</Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={styles.priceValNormal}>-₹{order.discount}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{order.total.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Shipping & Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping & Payment</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping type</Text>
            <Text style={styles.infoValDark}>{order.shippingType}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Payment method</Text>
            <Text style={styles.infoValDark}>{order.paymentMethod}</Text>
          </View>
          {order.promoCode && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Promo code</Text>
              <Text style={styles.infoValDark}>{order.promoCode}</Text>
            </View>
          )}
        </View>

        {/* Delivery address */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>📍</Text>
            <Text style={styles.sectionTitleNoMargin}>Delivery Address</Text>
          </View>
          <Text style={styles.addrText}>{order.shippingAddress.line1}</Text>
          {order.shippingAddress.floor && <Text style={styles.addrText}>{order.shippingAddress.floor}</Text>}
          <Text style={styles.addrSub}>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</Text>
        </View>
        
        {/* Padding for bottom buttons if any */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action buttons pinned to bottom if needed */}
      <View style={styles.bottomSheet}>
        {/* Track (Active orders) */}
        {['Placed', 'In Progress', 'On the Way'].includes(order.status) && (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('TrackOrder', { orderId: order._id })}
          >
            <Text style={styles.primaryActionText}>Track Order</Text>
          </TouchableOpacity>
        )}

        {/* E-Receipt (Delivered) */}
        {isDelivered && (
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => navigation.navigate('EReceipt', { orderId: order._id })}
          >
            <Text style={styles.primaryActionText}>View E-Receipt</Text>
          </TouchableOpacity>
        )}

        {/* Cancel (only if still cancellable) */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelAction}
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <ActivityIndicator color={colors.danger} />
            ) : (
              <Text style={styles.cancelActionText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#FAFAFA',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  content: { paddingBottom: 100 },
  
  statusBanner: { 
    marginHorizontal: 24, 
    marginBottom: 20,
    borderRadius: 20, 
    padding: 24, 
    backgroundColor: '#EEF0FF' 
  },
  statusBannerText: { fontSize: 24, fontWeight: '700', color: '#5C5EDB', marginBottom: 8 },
  orderNumberText: { fontSize: 13, color: '#999', marginBottom: 4 },
  orderDateText: { fontSize: 13, color: '#999' },
  
  section: {
    backgroundColor: '#fff', 
    marginHorizontal: 24,
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },
  sectionTitleNoMargin: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  itemImageBox: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, paddingLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  itemVariant: { fontSize: 12, color: '#999', marginBottom: 2 },
  itemQty: { fontSize: 12, color: '#999' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  priceLabel: { fontSize: 14, color: '#666' },
  priceValNormal: { fontSize: 14, color: '#1A1A1A', fontWeight: '500' },
  infoValDark: { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },
  
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalVal: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  
  addrText: { fontSize: 14, color: '#1A1A1A', marginTop: 4 },
  addrSub: { fontSize: 13, color: '#999', marginTop: 4 },
  
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  primaryAction: { backgroundColor: '#3E1F0F', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  primaryActionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelAction: { height: 44, justifyContent: 'center', alignItems: 'center' },
  cancelActionText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
