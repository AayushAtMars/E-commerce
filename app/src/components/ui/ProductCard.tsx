import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import type { Product } from '../../hooks/useProducts';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.screenHorizontal * 2 - spacing.md) / 2;

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onPress: () => void;
  onWishlistToggle?: () => void;
}

export function ProductCard({ product, isWishlisted, onPress, onWishlistToggle }: ProductCardProps) {
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Product image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Heart icon */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={onWishlistToggle}
        >
          <Text style={[styles.heart, isWishlisted ? styles.heartActive : undefined]}>
            {isWishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
        {/* Flash sale badge */}
        {product.isFlashSale ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SALE</Text>
          </View>
        ) : null}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        {/* Stars */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>
        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{displayPrice.toLocaleString('en-IN')}</Text>
          {hasDiscount ? (
            <Text style={styles.originalPrice}>₹{product.price.toLocaleString('en-IN')}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
  },
  imageWrapper: {
    width: '100%',
    height: CARD_WIDTH * 1.15,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  heart: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  heartActive: {
    color: colors.danger,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  info: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
    color: colors.star,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  originalPrice: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});
