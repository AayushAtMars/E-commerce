import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ProductCard } from '../../components/ui/ProductCard';
import { useFeaturedProducts } from '../../hooks/useProducts';
import { useWishlist, useToggleWishlist } from '../../hooks/useWishlist';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

export function FlashSaleScreen() {
  const navigation = useNavigation<HomeNav>();
  const { data: featured, isLoading } = useFeaturedProducts();
  const { data: wishlist } = useWishlist();
  const { toggle } = useToggleWishlist();
  const wishlistIds = new Set(wishlist?.map((p) => p._id) ?? []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Flash Sale ⚡</Text>
        <View style={{ width: 44 }} />
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={featured?.flashSale ?? []}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isWishlisted={wishlistIds.has(item._id)}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              onWishlistToggle={() => toggle(item._id, wishlistIds.has(item._id))}
            />
          )}
        />
      )}
    </View>
  );
}

export function BestSellersScreen() {
  const navigation = useNavigation<HomeNav>();
  const { data: featured, isLoading } = useFeaturedProducts();
  const { data: wishlist } = useWishlist();
  const { toggle } = useToggleWishlist();
  const wishlistIds = new Set(wishlist?.map((p) => p._id) ?? []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Best Sellers 🏆</Text>
        <View style={{ width: 44 }} />
      </View>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={featured?.bestSellers ?? []}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isWishlisted={wishlistIds.has(item._id)}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              onWishlistToggle={() => toggle(item._id, wishlistIds.has(item._id))}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.md, backgroundColor: colors.white,
  },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  grid: { padding: spacing.screenHorizontal, paddingBottom: 100 },
});
