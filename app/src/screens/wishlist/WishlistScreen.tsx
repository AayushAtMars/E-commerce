import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useWishlist, useToggleWishlist } from '../../hooks/useWishlist';
import Feather from '@expo/vector-icons/Feather';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

export function WishlistScreen() {
  const navigation = useNavigation<HomeNav>();
  const { data: products, isLoading } = useWishlist();
  const { toggle } = useToggleWishlist();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Wishlist</Text>
        
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Search' as never)}>
          <Feather name="search" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products ?? []}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>♡</Text>
              <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
              <Text style={styles.emptySub}>Tap the heart icon on products to save them here.</Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('HomeScreen')}
              >
                <Text style={styles.shopBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              activeOpacity={0.88}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => toggle(item._id, true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.heart, styles.heartActive]}>♥</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{(item.discountPrice ?? item.price).toLocaleString('en-IN')}</Text>
                  {item.discountPrice && (
                    <Text style={styles.original}>₹{item.price.toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  headerTitle: { 
    fontSize: typography.sizes.lg, 
    fontWeight: typography.weights.bold, 
    color: colors.textPrimary 
  },
  grid: { padding: spacing.screenHorizontal, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  imageWrapper: { height: 180, position: 'relative' },
  image: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
  },
  heart: { fontSize: 16, color: colors.textSecondary },
  heartActive: { color: colors.danger },
  info: { padding: spacing.sm },
  title: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textPrimary, marginBottom: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary },
  original: { fontSize: typography.sizes.xs, color: colors.textSecondary, textDecorationLine: 'line-through' },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.screenHorizontal },
  emptyIcon: { fontSize: 64, color: colors.borderLight, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySub: { fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  shopBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.pill,
    paddingHorizontal: spacing.xl,
    height: 52,
    justifyContent: 'center',
  },
  shopBtnText: { color: colors.white, fontWeight: typography.weights.bold, fontSize: typography.sizes.md },
});
