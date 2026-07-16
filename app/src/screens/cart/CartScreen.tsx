import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CartStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useCartStore } from '../../store/cartStore';

type CartNav = NativeStackNavigationProp<CartStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SwipeableCartItem = ({ item, onRemove, onIncrease, onDecrease }: any) => {
  const DELETE_BTN_WIDTH = 70;

  return (
    <View style={styles.swipeContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={DELETE_BTN_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ width: SCREEN_WIDTH - 48 + DELETE_BTN_WIDTH }} // 48 is horizontal padding (24 * 2)
      >
        <View style={styles.cardContent}>
          {/* Image */}
          <View style={styles.imageBox}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 24 }}>👕</Text>
            )}
          </View>

          {/* Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemCategory}>{item.category || 'Apparel'}</Text>
            
            <View style={styles.priceRow}>
              <View style={styles.priceTextRow}>
                <Text style={styles.currentPrice}>₹{item.price.toFixed(2)}</Text>
                {/* Fake original price for design matching */}
                <Text style={styles.originalPrice}>₹{(item.price * 1.25).toFixed(2)}</Text>
              </View>

              {/* Stepper */}
              <View style={styles.stepper}>
                <TouchableOpacity onPress={onDecrease} style={styles.stepBtn}>
                  <Feather name="minus" size={14} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.stepQty}>{item.quantity}</Text>
                <TouchableOpacity onPress={onIncrease} style={styles.stepAddBtn}>
                  <Feather name="plus" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Delete Button (inline with scroll content so it receives touches) */}
        <TouchableOpacity 
          style={{ width: DELETE_BTN_WIDTH, justifyContent: 'center', alignItems: 'center' }} 
          onPress={onRemove}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export function CartScreen() {
  const navigation = useNavigation<CartNav>();
  const { items, updateQuantity, removeItem, total, itemCount } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [itemToRemove, setItemToRemove] = useState<any>(null);

  const DELIVERY_FEE = 20;
  const TAX = 0;
  const DISCOUNT = promoCode.toUpperCase() === 'SAVE20' ? 20 : 0;
  
  const subTotal = total();
  const grandTotal = subTotal + DELIVERY_FEE + TAX - DISCOUNT;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SAVE20') {
      Alert.alert('Success', 'Promo applied successfully!');
    } else {
      Alert.alert('Invalid', 'Enter SAVE20 for a discount.');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.getParent()?.navigate('Home')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={{ paddingVertical: 16 }}>
          {items.map((item) => (
            <SwipeableCartItem
              key={`${item.productId}-${item.size}-${item.color}`}
              item={item}
              onRemove={() => setItemToRemove(item)}
              onIncrease={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
              onDecrease={() => {
                if (item.quantity > 1) {
                  updateQuantity(item.productId, item.size, item.color, item.quantity - 1);
                } else {
                  setItemToRemove(item);
                }
              }}
            />
          ))}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Summary Sheet */}
      <View style={styles.summarySheet}>
        {/* Promo Code */}
        <View style={styles.promoBox}>
          <TextInput
            style={styles.promoInput}
            placeholder="Promo Code"
            placeholderTextColor="#999"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo}>
            <Text style={styles.promoApplyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Sub-Total</Text>
            <Text style={styles.rowValue}>₹{subTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Delivery Charge</Text>
            <Text style={styles.rowValue}>₹{DELIVERY_FEE.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tax</Text>
            <Text style={styles.rowValue}>₹{TAX.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Discount</Text>
            <Text style={styles.rowValue}>-₹{DISCOUNT.toFixed(2)}</Text>
          </View>
        </View>

        {/* Dashed Line */}
        <View style={styles.dashedLine} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>₹{Math.max(0, grandTotal).toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('SelectAddress')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!itemToRemove}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove from Cart?</Text>
            
            {/* Mini Item Card */}
            {itemToRemove && (
              <View style={styles.miniCard}>
                <View style={styles.miniImageBox}>
                  {itemToRemove.image ? (
                    <Image source={{ uri: itemToRemove.image }} style={styles.miniImage} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 20 }}>👕</Text>
                  )}
                </View>
                <View style={styles.miniItemInfo}>
                  <Text style={styles.miniItemTitle} numberOfLines={1}>{itemToRemove.title}</Text>
                  <Text style={styles.miniItemCategory}>{itemToRemove.category || 'Apparel'}</Text>
                  <View style={styles.miniPriceRow}>
                    <Text style={styles.miniCurrentPrice}>${itemToRemove.price.toFixed(2)}</Text>
                    <Text style={styles.miniOriginalPrice}>${(itemToRemove.price * 1.25).toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setItemToRemove(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn}
                onPress={() => {
                  if (itemToRemove) {
                    removeItem(itemToRemove.productId, itemToRemove.size, itemToRemove.color);
                    setItemToRemove(null);
                  }
                }}
              >
                <Text style={styles.modalConfirmText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  emptyRoot: { flex: 1, backgroundColor: '#F8F8F8' },
  emptyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 32 },
  shopBtn: { backgroundColor: '#3E1F0F', borderRadius: 30, paddingHorizontal: 32, height: 56, justifyContent: 'center' },
  shopBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  scroll: { flex: 1 },
  
  // Swipeable Cart Item Styles
  swipeContainer: {
    marginBottom: 16,
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#ED5E5E', // Red color matching the design
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardContent: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  originalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    padding: 4,
  },
  stepQty: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  stepAddBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 6,
    padding: 4,
  },

  // Bottom Summary Sheet
  summarySheet: {
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
  promoBox: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 24,
  },
  promoInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  promoApplyBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  promoApplyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  dashedLine: {
    borderTopWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    marginVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  checkoutBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  miniCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 24,
  },
  miniImageBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F4F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  miniItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  miniItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  miniItemCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  miniPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  miniCurrentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  miniOriginalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F4F4F4',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: '#3E1F0F',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

