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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { commerceApiModule } from '../../api/commerce.api';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

function ProductCardItem({ item }: { item: any }) {
  const [image, setImage] = React.useState(item.image);
  const [rating, setRating] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (item.productId) {
      catalogApiModule.getProduct(item.productId).then(res => {
        const prodData = res.data?.data?.product;
        if (prodData) {
          if ((!image || image.trim() === '') && prodData.images?.[0]) {
            setImage(prodData.images[0]);
          }
          if (prodData.rating !== undefined) {
            setRating(prodData.rating);
          }
        }
      }).catch(() => {});
    }
  }, [item.productId, image]);

  const finalUri = (image && image.trim() !== '') ? image : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150&h=150';

  return (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: finalUri }} style={styles.productImage} />
      </View>
      <View style={styles.productInfo}>
        <View style={styles.productTitleRow}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.ratingBox}>
            <Feather name="star" size={12} color="#F5A623" />
            <Text style={styles.ratingText}>{rating != null ? rating.toFixed(1) : '5.0'}</Text>
          </View>
        </View>
        <Text style={styles.productMeta}>
          {item.category || 'Dress'} | Size : {item.size || 'M'} | Qty : {item.quantity}
        </Text>
        <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
    </View>
  );
}

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;
type TrackRoute = RouteProp<ProfileStackParamList, 'TrackOrder'>;

const ALL_STATUSES = ['Placed', 'In Progress', 'On the Way', 'Delivered'];

const STATUS_ICONS: Record<string, any> = {
  'Placed': { title: 'Order Placed', rightIcon: 'clipboard' },
  'In Progress': { title: 'In Progress', rightIcon: 'package' },
  'On the Way': { title: 'On the Way', rightIcon: 'truck' },
  'Delivered': { title: 'Delivered', rightIcon: 'home' },
};

export function TrackOrderScreen() {
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<TrackRoute>();
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  // Fetch full order to get items, status, delivery date, etc.
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await commerceApiModule.getOrder(orderId);
      return res.data.data.order;
    },
    refetchInterval: 30_000,
  });

  const advanceMutation = useMutation({
    mutationFn: () => commerceApiModule.advanceOrderStatus(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking', orderId] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', axiosErr?.response?.data?.message ?? 'Cannot advance status.');
    },
  });

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator color="#3E1F0F" size="large" /></View>;
  }

  if (!order) return null;

  const currentIdx = ALL_STATUSES.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  const timelineStatuses = isCancelled
    ? [...order.statusHistory.map((h: { status: string }) => h.status)]
    : ALL_STATUSES;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* Product Cards */}
        {order.items.map((item: any, idx: number) => (
          <ProductCardItem key={idx} item={item} />
        ))}

        {/* Order Details */}
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconCircle}>
              <Feather name="truck" size={20} color="#3E1F0F" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Expected Delivery Date</Text>
              <Text style={styles.detailValue}>
                {order.estimatedDelivery 
                  ? new Date(order.estimatedDelivery).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) 
                  : 'Pending'} 
                {order.estimatedDelivery && ` | ${new Date(order.estimatedDelivery).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconCircle}>
              <Feather name="clipboard" size={20} color="#3E1F0F" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>#{order.orderNumber}</Text>
            </View>
          </View>
        </View>

        {/* Order Status */}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusCard}>
          {timelineStatuses.map((status, idx) => {
            const historyEntry = order.statusHistory.find((h: { status: string }) => h.status === status);
            const isDone = isCancelled ? historyEntry != null : ALL_STATUSES.indexOf(status) <= currentIdx;
            const isLast = idx === timelineStatuses.length - 1;
            const data = STATUS_ICONS[status] || STATUS_ICONS['Placed'];

            return (
              <View key={status} style={styles.timelineStep}>
                {!isLast && (
                  <View style={[styles.connector, isDone && styles.connectorDone]} />
                )}
                
                <View style={[styles.stepCircle, isDone && styles.stepCircleDone]}>
                  {isDone && <Feather name="check" size={14} color="#fff" />}
                </View>

                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                    {isCancelled && status === 'Cancelled' ? 'Order Cancelled' : data.title}
                  </Text>
                  <Text style={styles.stepDate}>
                    {historyEntry ? new Date(historyEntry.timestamp).toLocaleString('en-US', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : ''}
                  </Text>
                </View>
                
                <View style={styles.rightIconCircle}>
                  <Feather name={data.rightIcon} size={20} color={isDone ? "#3E1F0F" : "#CCC"} />
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Bottom CTA Sheet */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.trackLiveBtn}
          onPress={() => navigation.navigate('TrackLiveLocation', { orderId })}
        >
          <Text style={styles.trackLiveBtnText}>Track Live Location</Text>
        </TouchableOpacity>

        {/* Keep advance button for demo purposes */}
        {/* {!isCancelled && order.status !== 'Delivered' && (
          <TouchableOpacity
            style={styles.advanceTextBtn}
            onPress={() => advanceMutation.mutate()}
            disabled={advanceMutation.isPending}
          >
            {advanceMutation.isPending ? (
              <ActivityIndicator color="#3E1F0F" />
            ) : (
              <Text style={styles.advanceText}>Advance to Next Status →</Text>
            )}
          </TouchableOpacity>
        )} */}
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
  backBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F9F9F9', marginRight: 16,
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
  productMeta: { fontSize: 13, color: '#999', marginBottom: 8 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 16 },
  
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF8F4', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  detailValue: { fontSize: 13, color: '#999' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 16 },
  
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 24,
  },
  timelineStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, position: 'relative' },
  connector: {
    position: 'absolute', left: 11, top: 24, width: 2, height: 44,
    backgroundColor: '#F0F0F0', zIndex: 0,
  },
  connectorDone: { backgroundColor: '#3E1F0F' },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
    marginRight: 16,
  },
  stepCircleDone: { backgroundColor: '#3E1F0F' },
  stepContent: { flex: 1 },
  stepLabel: { fontSize: 15, color: '#999', fontWeight: '500', marginBottom: 4 },
  stepLabelDone: { color: '#1A1A1A', fontWeight: '600' },
  stepDate: { fontSize: 12, color: '#999' },
  rightIconCircle: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center'
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
  trackLiveBtn: { backgroundColor: '#3E1F0F', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  trackLiveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  advanceTextBtn: { alignItems: 'center', paddingVertical: 8 },
  advanceText: { color: '#999', fontSize: 13, fontWeight: '600' },
});
