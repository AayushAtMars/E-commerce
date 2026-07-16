import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ProductCard } from '../../components/ui/ProductCard';
import { useProductSearch, Product } from '../../hooks/useProducts';
import { useWishlist, useToggleWishlist } from '../../hooks/useWishlist';
import { useRecentStore } from '../../store/recentStore';
import Feather from '@expo/vector-icons/Feather';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<HomeNav>();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data: results, isLoading } = useProductSearch(submitted);
  const { data: wishlist } = useWishlist();
  const { toggle } = useToggleWishlist();
  const wishlistIds = new Set(wishlist?.map((p) => p._id) ?? []);

  const {
    recentSearches,
    recentlyViewed,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches
  } = useRecentStore();

  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (q) {
      addRecentSearch(q);
      setSubmitted(q);
    } else {
      setSubmitted('');
    }
  }, [query, addRecentSearch]);

  const applyRecent = (term: string) => {
    setQuery(term);
    setSubmitted(term);
    addRecentSearch(term);
  };

  const renderRecentlyViewedItem = ({ item }: { item: Product }) => {
    const isWishlisted = wishlistIds.has(item._id);
    const displayPrice = item.discountPrice ?? item.price;
    const hasDiscount = !!item.discountPrice;

    return (
      <TouchableOpacity 
        style={styles.recentViewedCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      >
        <View style={styles.recentViewedImageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.recentViewedImage} resizeMode="cover" />
          <TouchableOpacity 
            style={styles.recentViewedHeart}
            onPress={() => toggle(item._id, isWishlisted)}
          >
            <Feather name="heart" size={14} color={isWishlisted ? colors.danger : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.recentViewedInfo}>
          <Text style={styles.recentViewedTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.recentViewedCategory}>{item.category || 'Category'}</Text>
          <View style={styles.recentViewedRating}>
            <Text style={styles.recentViewedStar}>★</Text>
            <Text style={styles.recentViewedRatingText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.recentViewedPriceRow}>
            <Text style={styles.recentViewedPrice}>${displayPrice.toFixed(2)}</Text>
            {hasDiscount && (
              <Text style={styles.recentViewedOldPrice}>${item.price.toFixed(2)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* Search bar row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.textPrimary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Search.."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (text === '') setSubmitted('');
            }}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
            accessibilityLabel="Search input"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setSubmitted(''); }}>
              <View style={styles.clearIconCircle}>
                <Feather name="x" size={14} color={colors.white} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Empty / initial state */}
      {!submitted && (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Search</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipsContainer}>
                {recentSearches.map((term) => (
                  <TouchableOpacity 
                    key={term} 
                    style={styles.chip}
                    onPress={() => applyRecent(term)}
                  >
                    <Text style={styles.chipText}>{term}</Text>
                    <TouchableOpacity 
                      style={styles.chipCloseBtn}
                      onPress={(e) => { e.stopPropagation(); removeRecentSearch(term); }}
                    >
                      <Feather name="x" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {recentlyViewed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
                <TouchableOpacity>
                  <Text style={styles.clearAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.recentlyViewedList}>
                {recentlyViewed.map((item) => (
                  <React.Fragment key={item._id}>
                    {renderRecentlyViewedItem({ item })}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Loading */}
      {isLoading && !!submitted && (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      )}

      {/* Results */}
      {!!submitted && !isLoading && (
        <FlatList
          data={results?.data ?? []}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {results?.total ?? 0} results for "{submitted}"
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found. Try a different search.</Text>
          }
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
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    backgroundColor: '#FAFAFA',
    gap: spacing.sm,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: { marginRight: 4 },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  clearIconCircle: { 
    width: 20, height: 20, 
    borderRadius: 10, 
    backgroundColor: '#E0E0E0', 
    justifyContent: 'center', alignItems: 'center' 
  },
  contentScroll: {
    flex: 1,
  },
  section: { 
    paddingHorizontal: spacing.screenHorizontal,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  clearAllText: {
    fontSize: typography.sizes.sm,
    color: '#F48243',
    fontWeight: typography.weights.medium,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: 8,
  },
  chipCloseBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentlyViewedList: {
    gap: 16,
    paddingBottom: 40,
  },
  recentViewedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  recentViewedImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    position: 'relative',
    marginRight: 16,
  },
  recentViewedImage: {
    width: '100%',
    height: '100%',
  },
  recentViewedHeart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentViewedInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  recentViewedTitle: {
    fontSize: 15,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  recentViewedCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recentViewedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentViewedStar: {
    color: '#FF9F00',
    fontSize: 12,
    marginRight: 4,
  },
  recentViewedRatingText: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  recentViewedPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentViewedPrice: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  recentViewedOldPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  resultCount: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: typography.weights.medium,
  },
  gridContent: { padding: spacing.screenHorizontal },
  columnWrapper: { justifyContent: 'space-between' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },
});
