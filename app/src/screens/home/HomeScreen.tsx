import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { ProductCard } from '../../components/ui/ProductCard';
import { useFeaturedProducts, useCategories } from '../../hooks/useProducts';
import { useWishlist, useToggleWishlist } from '../../hooks/useWishlist';

import { useLocationStore } from '../../store/locationStore';
import { LocationSelectorModal } from '../../components/ui/LocationSelectorModal';

import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BANNERS = [
  {
    id: '1',
    badge: "Today's Exclusive Deals",
    titleMain: "Enjoy ",
    titleItalic: "Extra Off",
    upTo: "Up to",
    percentage: "30",
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '2',
    badge: "Summer Collection",
    titleMain: "Fresh ",
    titleItalic: "Styles",
    upTo: "Flat",
    percentage: "50",
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: '3',
    badge: "Weekend Sale",
    titleMain: "Super ",
    titleItalic: "Savings",
    upTo: "Extra",
    percentage: "20",
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80'
  }
];

const renderCategoryIcon = (category: string, isActive: boolean) => {
  const color = isActive ? colors.white : colors.textPrimary;
  switch (category) {
    case 'T-Shirt':
    case 'Shirt':
      return <FontAwesome5 name="tshirt" size={18} color={color} />;
    case 'Jacket':
    case 'Coat':
    case 'Sweater':
      return <Ionicons name="shirt" size={18} color={color} />;
    case 'Dress':
      return <MaterialCommunityIcons name="hanger" size={20} color={color} />;
    case 'Handbag':
      return <MaterialCommunityIcons name="bag-personal" size={20} color={color} />;
    case 'Pant':
      return <MaterialCommunityIcons name="shoe-sneaker" size={30} color={color} />;
    default:
      return <FontAwesome5 name="tag" size={14} color={color} />;
  }
};

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const { currentLocation } = useLocationStore();

  const flatListRef = React.useRef<FlatList>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const bannerWidth = SCREEN_WIDTH - (spacing.screenHorizontal * 2);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BANNERS.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        }
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const { data: featured, isLoading: loadingFeatured, refetch: refetchFeatured } = useFeaturedProducts();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: wishlist } = useWishlist();
  const { toggle: toggleWishlist } = useToggleWishlist();

  const wishlistIds = new Set(wishlist?.map((p) => p?._id).filter(Boolean) ?? []);

  const flashSale = selectedCategory
    ? (featured?.flashSale ?? []).filter((p) => p.category === selectedCategory)
    : (featured?.flashSale ?? []);
  const bestSellers = selectedCategory
    ? (featured?.bestSellers ?? []).filter((p) => p.category === selectedCategory)
    : (featured?.bestSellers ?? []);

  const isFocused = useIsFocused();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchFeatured();
    setRefreshing(false);
  };

  return (
    <View style={styles.root}>
      {isFocused && <StatusBar style="light" />}
      
      {/* Location Modal */}
      <LocationSelectorModal 
        visible={locationModalVisible} 
        onClose={() => setLocationModalVisible(false)} 
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.locationRow} 
            accessibilityLabel="Change location"
            onPress={() => setLocationModalVisible(true)}
          >
            <Entypo name="location-pin" size={24} color="#FFCC00" />
            <Text style={styles.locationCity}>{currentLocation}</Text>
            <AntDesign name="down" size={12} color="#FFCC00" style={{ marginTop: 4 }}/>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <Feather name="bell" size={24} color="white" style={{backgroundColor:"rgba(255, 255, 255, 0.2)",borderRadius:12,padding:8}} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          accessibilityLabel="Search products"
        >
          <Feather name="search" size={24} color={colors.primary} />
          <Text style={styles.searchPlaceholder}>Search</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Filter')}
            accessibilityLabel="Filter products"
          >
            <MaterialCommunityIcons name="table-filter" size={28} color="black" style={{marginRight:15}} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Special Offers ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View>
            <FlatList
              ref={flatListRef}
              data={BANNERS}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              getItemLayout={(data, index) => ({
                length: bannerWidth,
                offset: bannerWidth * index,
                index,
              })}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
                setCurrentBannerIndex(index);
              }}
              renderItem={({ item }) => (
                <View style={[styles.offerBanner, { width: bannerWidth }]}>
                  <View style={styles.offerContent}>
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>{item.badge}</Text>
                    </View>
                    <Text style={styles.offerTitle}>{item.titleMain}<Text style={{fontStyle: 'italic'}}>{item.titleItalic}</Text></Text>
                    <View style={styles.offerDiscountRow}>
                      <Text style={styles.offerUpTo}>{item.upTo}</Text>
                      <Text style={styles.offerPercentage}>{item.percentage}</Text>
                      <Text style={styles.offerPercentSign}>%</Text>
                    </View>
                    <TouchableOpacity style={styles.claimButton}>
                      <Text style={styles.claimButtonText}>Claim</Text>
                    </TouchableOpacity>
                  </View>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.offerImage}
                    resizeMode="cover"
                  />
                </View>
              )}
            />
          </View>

          <View style={styles.pagination}>
            {BANNERS.map((_, idx) => (
              <View key={idx} style={[styles.dot, currentBannerIndex === idx && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── Category chips ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory ? styles.categoryChipActive : undefined]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryChipText, !selectedCategory ? styles.categoryChipTextActive : undefined]}>
              All
            </Text>
          </TouchableOpacity>
          {(categories ?? []).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat ? styles.categoryChipActive : undefined]}
              onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              <View style={styles.categoryEmojiWrapper}>
                {renderCategoryIcon(cat, selectedCategory === cat)}
              </View>
              <Text style={[styles.categoryChipText, selectedCategory === cat ? styles.categoryChipTextActive : undefined]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Flash Sale Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Flash Sale</Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>⚡ Limited Time</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('FlashSale')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingFeatured ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : flashSale.length === 0 ? (
            <Text style={styles.emptyText}>No flash sale items{selectedCategory ? ` in ${selectedCategory}` : ''}.</Text>
          ) : (
            <FlatList
              data={flashSale}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingRight: spacing.screenHorizontal }}
              renderItem={({ item }) => (
                <View style={styles.horizontalCardWrapper}>
                  <ProductCard
                    product={item}
                    isWishlisted={wishlistIds.has(item._id)}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
                    onWishlistToggle={() => toggleWishlist(item._id, wishlistIds.has(item._id))}
                  />
                </View>
              )}
            />
          )}
        </View>

        {/* ── Best Sellers Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Sellers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BestSellers')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingFeatured ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : bestSellers.length === 0 ? (
            <Text style={styles.emptyText}>No best sellers{selectedCategory ? ` in ${selectedCategory}` : ''}.</Text>
          ) : (
            <View style={styles.grid}>
              {bestSellers.slice(0, 6).map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                  isWishlisted={wishlistIds.has(item._id)}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
                  onWishlistToggle={() => toggleWishlist(item._id, wishlistIds.has(item._id))}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationPin: { fontSize: 16, color: colors.accent },
  locationCity: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  locationChevron: { fontSize: 12, color: colors.white },
  bellIcon: { fontSize: 22 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingLeft: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  scrollView: { flex: 1 },

  // Categories
  categoryScroll: { paddingTop: spacing.md },
  categoryContent: { paddingHorizontal: spacing.screenHorizontal, gap: spacing.sm, paddingBottom: spacing.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: spacing.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmojiWrapper: {
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  categoryChipTextActive: { color: colors.white },

  // Sections
  section: { marginTop: spacing.lg, paddingHorizontal: spacing.screenHorizontal },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  timerBadge: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  timerText: { fontSize: 10, fontWeight: typography.weights.bold, color: colors.white },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Offer Banner
  offerBanner: {
    backgroundColor: '#F9F5F0',
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    height: 160,
  },
  offerContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    zIndex: 1,
  },
  offerBadge: {
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  offerTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  offerDiscountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  offerUpTo: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginTop:5,
    marginRight: 4,
  },
  offerPercentage: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  offerPercentSign: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  claimButton: {
    backgroundColor: '#3b2210',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  claimButtonText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  offerImage: {
    width: '45%',
    height: '100%',
    position: 'absolute',
    right: -20,
    bottom: 0,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Horizontal scroll
  horizontalCardWrapper: { marginRight: spacing.md },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
