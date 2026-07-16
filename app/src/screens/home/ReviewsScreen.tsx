import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { useQuery } from '@tanstack/react-query';
import { catalogApiModule } from '../../api/catalog.api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Feather from '@expo/vector-icons/Feather';
import { VideoView, useVideoPlayer } from 'expo-video';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;
type ReviewsRoute = RouteProp<HomeStackParamList, 'Reviews'>;

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  text: string;
  photos: string[];
  videos?: string[];
  createdAt: string;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STAR_COLOR = '#C8892A';

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather
          key={i}
          name="star"
          size={size}
          color={i <= rating ? STAR_COLOR : '#E0E0E0'}
          style={i <= rating ? { color: STAR_COLOR } : {}}
        />
      ))}
    </View>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={bar.row}>
      <Text style={bar.label}>{star}</Text>
      <View style={bar.track}>
        <View style={[bar.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const bar = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  label: { width: 12, fontSize: 11, color: colors.textSecondary, marginRight: 6, textAlign: 'right' },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#F0EDE8', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3, backgroundColor: '#4A2511' },
});

function VideoPlayerModal({ uri, onClose }: { uri: string; onClose: () => void }) {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
  });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      try { player.play(); } catch (_) {}
    }, 200);
    return () => {
      clearTimeout(timeout);
      try { player.pause(); } catch (_) {}
    };
  }, [player]);

  return (
    // Do NOT use transparent — it breaks Android VideoView surface rendering
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={vModal.root}>
        <TouchableOpacity style={vModal.closeBtn} onPress={onClose}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <VideoView
          player={player}
          style={vModal.video}
          contentFit="contain"
          nativeControls
          allowsPictureInPicture={false}
        />
      </View>
    </Modal>
  );
}

const vModal = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeBtn: {
    position: 'absolute', top: 52, right: 20, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  video: { width: SCREEN_W, height: SCREEN_H },
});

// ── Full-screen image viewer modal ───────────────────────────────────────────
function ImageViewerModal({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const scrollRef = useRef<ScrollView>(null);

  // Scroll to initial image after mount
  const onLayout = () => {
    scrollRef.current?.scrollTo({ x: startIndex * SCREEN_W, animated: false });
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setCurrent(idx);
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent transparent>
      <View style={imgModal.root}>
        {/* Close */}
        <TouchableOpacity style={imgModal.closeBtn} onPress={onClose}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Counter */}
        <View style={imgModal.counter}>
          <Text style={imgModal.counterText}>{current + 1} / {images.length}</Text>
        </View>

        {/* Swipeable images */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          onLayout={onLayout}
          scrollEventThrottle={16}
        >
          {images.map((uri, i) => (
            <View key={i} style={{ width: SCREEN_W, height: SCREEN_H, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri }}
                style={{ width: SCREEN_W, height: SCREEN_H * 0.75 }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={imgModal.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[imgModal.dot, i === current && imgModal.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const imgModal = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute', top: 52, right: 20, zIndex: 20,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  counter: {
    position: 'absolute', top: 56, left: 0, right: 0, zIndex: 10,
    alignItems: 'center',
  },
  counterText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  dots: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
});

export function ReviewsScreen() {
  const navigation = useNavigation<HomeNav>();
  const route = useRoute<ReviewsRoute>();
  const { productId } = route.params;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Verified' | 'Latest' | 'Detailed'>('Latest');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [imageViewer, setImageViewer] = useState<{ images: string[]; index: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await catalogApiModule.getReviews(productId);
      return res.data as { data: Review[]; total: number };
    },
  });

  const reviews = data?.data ?? [];
  const total = data?.total ?? 0;

  // Build rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Filter & search
  const filtered = reviews
    .filter((r) => !search || r.text.toLowerCase().includes(search.toLowerCase()) || r.userName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (activeFilter === 'Latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (activeFilter === 'Detailed') return b.text.length - a.text.length;
      return 0; // Verified – no change for demo
    });

  const filters: Array<'Verified' | 'Latest' | 'Detailed'> = ['Verified', 'Latest', 'Detailed'];

  function timeAgo(dateStr: string) {
    const months = Math.floor((Date.now() - new Date(dateStr).getTime()) / (30 * 24 * 60 * 60 * 1000));
    if (months < 1) return 'This month';
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Rating Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.avgNumber}>{avgRating.toFixed(1)}</Text>
                <Stars rating={Math.round(avgRating)} size={20} />
                <Text style={styles.totalReviews}>({total} Reviews)</Text>
              </View>
              <View style={styles.summaryRight}>
                {breakdown.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} />
                ))}
              </View>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Feather name="search" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Search in reviews"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8 }}>
              <TouchableOpacity style={styles.filterIconBtn}>
                <Feather name="sliders" size={14} color={colors.textPrimary} />
                <Text style={styles.filterIconText}>Filter</Text>
                <Feather name="chevron-down" size={12} color={colors.textPrimary} />
              </TouchableOpacity>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={[styles.filterChip]}>
                <Text style={styles.filterChipText}>Detailed Reviews</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color="#4A2511" style={{ marginTop: 40 }} />
            : <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                {item.userAvatar
                  ? <Image source={{ uri: item.userAvatar }} style={styles.avatarImg} />
                  : <Feather name="user" size={20} color={colors.textSecondary} />
                }
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={8} color="#fff" />
                </View>
              </View>
              <View style={styles.cardMeta}>
                <Text style={styles.reviewerName}>{item.userName}</Text>
                <Text style={styles.reviewDate}>{timeAgo(item.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>{item.text}</Text>
            <View style={styles.starsRow}>
              <Stars rating={item.rating} size={14} />
              <Text style={styles.ratingNum}>{item.rating.toFixed(1)}</Text>
            </View>

            {/* Photos */}
            {item.photos && item.photos.length > 0 && (
              <View style={styles.mediaRow}>
                {item.photos.map((uri, i) => (
                  <TouchableOpacity
                    key={`p-${i}`}
                    onPress={() => setImageViewer({ images: item.photos, index: i })}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri }} style={styles.mediaThumb} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
                {/* Videos */}
                {item.videos?.map((uri, i) => (
                  <TouchableOpacity key={`v-${i}`} style={styles.videoThumbWrapper} onPress={() => setVideoUri(uri)}>
                    <Image source={{ uri: item.photos[0] || 'https://via.placeholder.com/80' }} style={styles.mediaThumb} resizeMode="cover" />
                    <View style={styles.playOverlay}>
                      <Feather name="play" size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      />

      {/* Write Review CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => navigation.navigate('LeaveReview', { productId, orderId: '' })}
        >
          <Text style={styles.writeBtnText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player Modal */}
      {videoUri && <VideoPlayerModal uri={videoUri} onClose={() => setVideoUri(null)} />}

      {/* Image Viewer Modal */}
      {imageViewer && (
        <ImageViewerModal
          images={imageViewer.images}
          startIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5F2' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    borderWidth: 1, borderColor: '#E8E8E8',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: 100, gap: 12 },

  // Summary
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
    gap: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  summaryLeft: { alignItems: 'center', minWidth: 80 },
  avgNumber: { fontSize: 44, fontWeight: typography.weights.bold, color: colors.textPrimary, lineHeight: 52 },
  totalReviews: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 4 },
  summaryRight: { flex: 1 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.md, color: colors.textPrimary },

  // Filters
  filterRow: { flexGrow: 0, marginBottom: 16 },
  filterIconBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.white,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  filterIconText: { fontSize: typography.sizes.sm, color: colors.textPrimary, fontWeight: typography.weights.medium },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  filterChipActive: { backgroundColor: '#4A2511', borderColor: '#4A2511' },
  filterChipText: { fontSize: typography.sizes.sm, color: colors.textPrimary, fontWeight: typography.weights.medium },
  filterChipTextActive: { color: colors.white },

  // Review cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center',
    marginRight: 12, overflow: 'visible',
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4A2511',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.white,
  },
  cardMeta: { flex: 1 },
  reviewerName: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary },
  reviewDate: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  reviewText: { fontSize: typography.sizes.md, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingNum: { fontSize: typography.sizes.sm, fontWeight: typography.weights.bold, color: colors.textPrimary },
  mediaRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  mediaThumb: { width: 90, height: 90, borderRadius: 12 },
  videoThumbWrapper: { position: 'relative' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },

  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xl },

  // CTA
  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 36, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  writeBtn: {
    backgroundColor: '#4A2511',
    borderRadius: 30, height: 56,
    justifyContent: 'center', alignItems: 'center',
  },
  writeBtnText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
