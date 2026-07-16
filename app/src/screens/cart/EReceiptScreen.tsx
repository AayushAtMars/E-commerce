import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { CartStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { commerceApiModule } from '../../api/commerce.api';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type CartNav = NativeStackNavigationProp<CartStackParamList>;
type EReceiptRoute = RouteProp<CartStackParamList, 'EReceipt'>;

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: boolean; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && { fontWeight: typography.weights.bold, color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.rowValue, accent && styles.accentValue, bold && { fontWeight: typography.weights.bold, color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export function EReceiptScreen() {
  const navigation = useNavigation<CartNav>();
  const route = useRoute<EReceiptRoute>();
  const { orderId } = route.params;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await commerceApiModule.getOrder(orderId);
      return res.data.data.order;
    },
  });

  const goHome = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'CartScreen' }] }));
    navigation.getParent()?.navigate('Home');
  };

  if (isLoading) {
    return (
      <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>
    );
  }

  if (!order) return null;

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleDownloadPDF = async () => {
    if (!order) return;
    try {
      const itemsHtml = order.items.map((item: any) => 
        '<div class="item-row">' +
          '<div>' +
            '<div class="item-title">' + item.title + '</div>' +
            '<div class="item-meta">&times;' + item.quantity + '</div>' +
          '</div>' +
          '<div class="value">&#8377;' + (item.price * item.quantity).toLocaleString('en-IN') + '</div>' +
        '</div>'
      ).join('');

      const discountHtml = order.discount > 0 
        ? '<div class="row">' +
            '<span class="label">Discount</span>' +
            '<span class="value" style="color: red;">-&#8377;' + order.discount + '</span>' +
          '</div>'
        : '';

      const floorHtml = order.shippingAddress.floor 
        ? '<p style="margin: 5px 0 0; color: #666; font-size: 12px;">' + order.shippingAddress.floor + '</p>'
        : '';

      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1A1A1A; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #3E1F0F; margin-bottom: 5px; }
              .header p { color: #666; margin: 0; }
              .divider { border-top: 1px dashed #E8E8E8; margin: 20px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
              .row .label { color: #666; }
              .row .value { font-weight: bold; }
              .item-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
              .item-title { font-weight: bold; font-size: 14px; }
              .item-meta { color: #666; font-size: 12px; }
              .total-row { display: flex; justify-content: space-between; margin-top: 20px; font-size: 18px; font-weight: bold; color: #3E1F0F; border-top: 2px solid #E8E8E8; padding-top: 15px; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Order Confirmed</h1>
              <p>${dateStr} &middot; ${timeStr}</p>
            </div>
            
            <div class="row">
              <span class="label">Order #</span>
              <span class="value">${order.orderNumber}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="value" style="color: #4CAF50;">${order.status}</span>
            </div>
            <div class="row">
              <span class="label">Payment</span>
              <span class="value">${order.paymentMethod}</span>
            </div>
            
            <div class="divider"></div>
            
            <h3 style="color: #999; font-size: 12px; text-transform: uppercase;">Items</h3>
            ${itemsHtml}
            
            <div class="divider"></div>
            
            <div class="row">
              <span class="label">Subtotal</span>
              <span class="value">&#8377;${order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="row">
              <span class="label">Shipping (${order.shippingType})</span>
              <span class="value">&#8377;${order.shippingCost}</span>
            </div>
            ${discountHtml}
            
            <div class="total-row">
              <span>Total Paid</span>
              <span>&#8377;${order.total.toLocaleString('en-IN')}</span>
            </div>
            
            <div class="divider"></div>
            
            <h3 style="color: #999; font-size: 12px; text-transform: uppercase;">Delivery To</h3>
            <p style="margin: 0; font-weight: bold; font-size: 14px;">${order.shippingAddress.line1}</p>
            ${floorHtml}
            <p style="margin: 5px 0 0; color: #666; font-size: 12px;">${order.shippingAddress.city}, ${order.shippingAddress.state} &mdash; ${order.shippingAddress.pincode}</p>
            
            <div class="footer">
              <p>Thank you for your purchase.</p>
              <p>Order ID: ${order._id}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Download E-Receipt' });
      }
    } catch (err) {
      console.log('Error printing PDF:', err);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
           <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E-Receipt</Text>
        <TouchableOpacity style={styles.backBtn} onPress={handleDownloadPDF}>
           <Feather name="download" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Receipt card */}
        <View style={styles.receiptCard}>
          {/* Top stamp */}
          <View style={styles.stamp}>
            <MaterialCommunityIcons name="check-circle" size={48} color={colors.white} style={styles.stampIcon} />
            <Text style={styles.stampTitle}>Order Confirmed</Text>
            <Text style={styles.stampDate}>{dateStr} · {timeStr}</Text>
          </View>

          {/* Tear line */}
          <View style={styles.tearLineContainer}>
            <View style={styles.circleLeft} />
            <View style={styles.tearLine} />
            <View style={styles.circleRight} />
          </View>

          {/* Order info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <Row label="Order #" value={order.orderNumber} />
            <Row label="Status" value={order.status} accent />
            <Row label="Payment" value={order.paymentMethod} />
          </View>

          <View style={styles.divider} />

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            {order.items.map((item: { title: string; quantity: number; price: number }, i: number) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemMeta}>×{item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Price breakdown */}
          <View style={styles.section}>
            <Row label="Subtotal" value={`₹${order.subtotal.toLocaleString('en-IN')}`} />
            <Row label={`Shipping (${order.shippingType})`} value={`₹${order.shippingCost}`} />
            {order.discount > 0 && <Row label="Discount" value={`-₹${order.discount}`} />}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{order.total.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Delivery address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery To</Text>
            <Text style={styles.addrText}>{order.shippingAddress.line1}</Text>
            {order.shippingAddress.floor && <Text style={styles.addrSub}>{order.shippingAddress.floor}</Text>}
            <Text style={styles.addrSub}>
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </Text>
          </View>

          <View style={styles.tearLineContainer}>
             <View style={styles.tearLine} />
          </View>

          <View style={styles.barcodeSection}>
            <MaterialCommunityIcons name="barcode" size={64} color={colors.textPrimary} />
            <Text style={styles.barcodeText}>{order.orderNumber}</Text>
            <Text style={styles.thankYou}>Thank you for your purchase.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingTop: 60, paddingBottom: spacing.md, paddingHorizontal: spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.background 
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { padding: spacing.screenHorizontal },
  receiptCard: {
    backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 6,
    marginBottom: spacing.xl,
  },
  stamp: { alignItems: 'center', padding: spacing.xl, paddingTop: 32, backgroundColor: colors.primary },
  stampIcon: { marginBottom: 12 },
  stampTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.white },
  stampDate: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 6, fontWeight: typography.weights.medium },
  tearLineContainer: {
    flexDirection: 'row', alignItems: 'center',
    position: 'relative', height: 1, backgroundColor: colors.white,
  },
  circleLeft: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.background,
    position: 'absolute', left: -10, top: -10, zIndex: 1,
  },
  circleRight: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: colors.background,
    position: 'absolute', right: -10, top: -10, zIndex: 1,
  },
  tearLine: {
    flex: 1, height: 1,
    borderTopWidth: 1.5,
    borderTopColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  section: { padding: spacing.lg, paddingVertical: spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: typography.weights.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: typography.sizes.md, color: colors.textSecondary },
  rowValue: { fontSize: typography.sizes.md, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  accentValue: { color: colors.success, fontWeight: typography.weights.bold },
  divider: { height: 1, backgroundColor: colors.borderLight, marginHorizontal: spacing.lg },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  itemName: { flex: 1, fontSize: typography.sizes.sm, color: colors.textPrimary, fontWeight: typography.weights.medium },
  itemMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, width: 30, textAlign: 'right' },
  itemPrice: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary, width: 70, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight },
  totalLabel: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  totalValue: { fontSize: 24, fontWeight: typography.weights.bold, color: colors.primary },
  addrText: { fontSize: typography.sizes.md, color: colors.textPrimary, fontWeight: typography.weights.medium },
  addrSub: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  barcodeSection: { alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  barcodeText: { fontSize: 12, color: colors.textSecondary, letterSpacing: 2, marginTop: 1, marginBottom: 16 },
  thankYou: { textAlign: 'center', fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: typography.weights.medium },
  homeBtn: { backgroundColor: colors.primary, borderRadius: spacing.borderRadius.pill, height: 56, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { color: colors.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
});
