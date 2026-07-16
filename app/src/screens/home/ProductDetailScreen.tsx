import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { useProduct } from '../../hooks/useProducts';
import { useWishlist, useToggleWishlist } from '../../hooks/useWishlist';
import { useCartStore } from '../../store/cartStore';
import { useQuery } from '@tanstack/react-query';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';
import { useRecentStore } from '../../store/recentStore';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;
type ProductDetailRoute = RouteProp<HomeStackParamList, 'ProductDetail'>;

const { width: SCREEN_W } = Dimensions.get('window');

export function ProductDetailScreen() {
  const navigation = useNavigation<HomeNav>();
  const route = useRoute<ProductDetailRoute>();
  const { productId } = route.params;

  const { data: product, isLoading } = useProduct(productId);
  const { data: wishlist } = useWishlist();
  const { toggle: toggleWishlist } = useToggleWishlist();
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const isWishlisted = wishlist?.some((p) => p._id === productId) ?? false;
  const displayPrice = product ? (product.discountPrice ?? product.price) : 0;

  // Fetch 2 preview reviews for the summary section
  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', productId, 'preview'],
    queryFn: async () => {
      const res = await catalogApiModule.getReviews(productId);
      return res.data as { data: any[]; total: number };
    },
    enabled: !!product,
  });
  const previewReviews = reviewsData?.data?.slice(0, 2) ?? [];

  // Build rating breakdown from product rating (approximated)
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    // Approximate: seeded data is mostly 4-5 stars
    const weights: Record<number, number> = { 5: 0.55, 4: 0.30, 3: 0.08, 2: 0.04, 1: 0.03 };
    return { star, pct: weights[star] ?? 0 };
  });

  const { addRecentlyViewed } = useRecentStore();

  React.useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
    }
  }, [product, addRecentlyViewed]);

  if (isLoading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color="#4A2511" size="large" />
      </View>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      title: product.title,
      price: displayPrice,
      image: product.images[0],
      size: selectedSize ?? (product.sizes[0] || ''),
      color: selectedColor ?? (product.colors[0] || ''),
      quantity: 1, // Defaulting to 1 as quantity selector is removed in design
    });
    if (Platform.OS === 'android') {
      ToastAndroid.show('Added to Cart! 🛍️', ToastAndroid.SHORT);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        {/* Top Header Floating over Image */}
        <View style={styles.floatingHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { marginRight: 12 }]}
              onPress={() => toggleWishlist(product._id, isWishlisted)}
            >
              <Feather name="heart" size={20} color={isWishlisted ? colors.danger : "#000"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="share-2" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image gallery */}
        <View style={styles.gallery}>
          <Image
            source={{ uri: product.images[selectedImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {/* Thumbnail strip overlapping the image bottom */}
          {product.images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <FlatList
                data={product.images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={styles.thumbnailList}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.thumbnail, index === selectedImage && styles.thumbnailActive]}
                    onPress={() => setSelectedImage(index)}
                  >
                    <Image source={{ uri: item }} style={styles.thumbnailImg} resizeMode="cover" />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* Detail sheet */}
        <View style={styles.detailSheet}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryText}>{product.category || 'Clothing'}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>{product.rating.toFixed(1)} <Text style={styles.reviewsText}>({product.reviewCount} reviews)</Text></Text>
            </View>
          </View>

          <Text style={styles.title}>{product.title}</Text>

          {/* Seller Section */}
          <Text style={styles.sectionLabel}>Seller</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              {product.sellerAvatar ? (
                <Image source={{ uri: product.sellerAvatar }} style={styles.sellerAvatarImg} />
              ) : (
                <Feather name="user" size={24} color={colors.textSecondary} />
              )}
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.sellerName || 'Leslie Alexander'}</Text>
              <Text style={styles.sellerRole}>{product.sellerRole || 'Manager'}</Text>
            </View>
            <View style={styles.sellerActions}>
              <TouchableOpacity style={styles.sellerIconBtn}>
                <Feather name="message-square" size={18} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sellerIconBtn}>
                <Feather name="phone" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Size picker */}
          {product.sizes.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Size : <Text style={styles.selectedLabel}>{selectedSize}</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Color picker */}
          {product.colors.length > 0 && (
            <View style={{marginTop:-15}}>
              <Text style={styles.sectionLabel}>Color : <Text style={styles.selectedLabel}>{selectedColor}</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorRing,
                      selectedColor === color && styles.colorRingActive,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Ratings & Reviews Section ── */}
          <View style={styles.ratingsSection}>
            <View style={styles.ratingsSectionHeader}>
              <Text style={styles.ratingsSectionTitle}>Ratings & Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reviews', { productId: product._id })}>
                <Text style={styles.seeAllLink}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Big rating + breakdown bars */}
            <View style={styles.ratingSummaryRow}>
              <View style={styles.bigRatingBox}>
                <Text style={styles.bigRatingNum}>{product.rating.toFixed(1)}</Text>
                <View style={{ flexDirection: 'row', gap: 3, marginVertical: 4 }}>
                  {[1,2,3,4,5].map((i) => (
                    <Feather key={i} name="star" size={13}
                      color={i <= Math.round(product.rating) ? '#C8892A' : '#E0E0E0'} />
                  ))}
                </View>
                <Text style={styles.bigRatingCount}>{product.reviewCount} reviews</Text>
              </View>
              <View style={styles.barsColumn}>
                {ratingBreakdown.map(({ star, pct }) => (
                  <View key={star} style={styles.barRow}>
                    <Text style={styles.barLabel}>{star}</Text>
                    <Feather name="star" size={9} color="#C8892A" style={{ marginRight: 4 }} />
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct * 100}%` as any }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* 2 preview review cards */}
            {previewReviews.map((r: any) => (
              <View key={r._id} style={styles.previewCard}>
                <View style={styles.previewCardHeader}>
                  <View style={styles.previewAvatar}>
                    {r.userAvatar
                      ? <Image source={{ uri: r.userAvatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
                      : <Feather name="user" size={16} color={colors.textSecondary} />
                    }
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewName}>{r.userName}</Text>
                    <View style={{ flexDirection: 'row', gap: 2 }}>
                      {[1,2,3,4,5].map((i) => (
                        <Feather key={i} name="star" size={11}
                          color={i <= r.rating ? '#C8892A' : '#E0E0E0'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.previewDate}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <Text style={styles.previewText} numberOfLines={2}>{r.text}</Text>
                {r.photos?.length > 0 && (
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                    {r.photos.slice(0, 3).map((uri: string, i: number) => (
                      <Image key={i} source={{ uri }} style={styles.previewPhoto} />
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* See all button */}
            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => navigation.navigate('Reviews', { productId: product._id })}
            >
              <Text style={styles.seeAllBtnText}>View All {product.reviewCount} Reviews</Text>
              <Feather name="chevron-right" size={16} color="#4A2511" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Add to Cart CTA */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaRow}>
          <View style={styles.totalArea}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalPrice}>₹{displayPrice.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Feather name="shopping-bag" size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loadingRoot: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  floatingHeader: {
    position: 'absolute',
    top: 52,
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gallery: {
    position: 'relative',
  },
  mainImage: {
    width: SCREEN_W,
    height: SCREEN_W * 1.2,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailList: { gap: 8 },
  thumbnail: {
    width: 50, height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: colors.textPrimary },
  thumbnailImg: { width: '100%', height: '100%' },
  detailSheet: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    minHeight: 500,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: '#FF9F00',
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  reviewsText: {
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  title: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  selectedLabel: {
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sellerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    marginRight: 12,
  },
  sellerAvatarImg: { width: '100%', height: '100%' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 2 },
  sellerRole: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  sellerActions: { flexDirection: 'row', gap: 12 },
  sellerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  scrollRow: { flexGrow: 0, marginBottom: spacing.md },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    minWidth: 44,
  },
  sizeChipActive: { backgroundColor: '#4A2511' },
  sizeText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary },
  sizeTextActive: { color: colors.white },
  colorRing: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 1, borderColor: 'transparent',
  },
  colorRingActive: { borderColor: '#D0D0D0' },
  colorSwatch: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)'
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalArea: {},
  totalLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: 4 },
  totalPrice: { fontSize: 24, fontWeight: typography.weights.bold, color: colors.textPrimary },
  addToCartBtn: {
    backgroundColor: '#4A2511',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: '55%',
  },
  addToCartText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  // ── Ratings & Reviews section ──
  ratingsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
  },
  ratingsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingsSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAllLink: {
    fontSize: typography.sizes.sm,
    color: '#4A2511',
    fontWeight: typography.weights.semibold,
  },
  ratingSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: spacing.md,
  },
  bigRatingBox: {
    alignItems: 'center',
    minWidth: 72,
  },
  bigRatingNum: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: 42,
  },
  bigRatingCount: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barsColumn: { flex: 1, gap: 5 },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: { width: 12, fontSize: 11, color: colors.textSecondary, marginRight: 4, textAlign: 'right' },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F0EDE8', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: '#4A2511' },

  // preview cards
  previewCard: {
    backgroundColor: '#F8F5F1',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  previewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  previewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E8E4DE',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  previewName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary },
  previewDate: { fontSize: 11, color: colors.textSecondary },
  previewText: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 18 },
  previewPhoto: { width: 56, height: 56, borderRadius: 8 },

  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A2511',
  },
  seeAllBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#4A2511',
  },
});
