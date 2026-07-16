import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import * as ImagePicker from 'expo-image-picker';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { catalogApiModule } from '../../api/catalog.api';
import { useAuthStore } from '../../store/authStore';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;
type LeaveReviewRoute = RouteProp<HomeStackParamList, 'LeaveReview'>;

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

const STAR_COLOR = '#C8892A';

function StarPicker({ rating, onChange }: { rating: number; onChange: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather
            name={i <= rating ? 'star' : 'star'}
            size={40}
            color={i <= rating ? STAR_COLOR : '#E0E0E0'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function LeaveReviewScreen() {
  const navigation = useNavigation<HomeNav>();
  const route = useRoute<LeaveReviewRoute>();
  const { productId } = route.params;

  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'uploading' | 'submitting'>('idle');

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos and videos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      videoMaxDuration: 120,
    });
    if (!result.canceled) {
      const items: MediaItem[] = result.assets.map((a) => ({
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
      }));
      setMedia((prev) => [...prev, ...items].slice(0, 6)); // max 6 items
    }
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Rating required', 'Please select a star rating.'); return; }
    if (!text.trim()) { Alert.alert('Review required', 'Please write your review.'); return; }

    try {
      // Step 1 — Upload media to Cloudinary via backend
      let photoUrls: string[] = [];
      let videoUrls: string[] = [];

      if (media.length > 0) {
        setSubmitStatus('uploading');

        const toUpload = media.map((m, i) => ({
          uri: m.uri,
          name: `review_${Date.now()}_${i}.${m.type === 'video' ? 'mp4' : 'jpg'}`,
          type: m.type === 'video' ? 'video/mp4' : 'image/jpeg',
        }));

        const res = await catalogApiModule.uploadMedia(toUpload);
        const uploadedUrls: string[] = res.data.urls;

        // Split returned URLs back into photos / videos based on original order
        media.forEach((m, i) => {
          if (m.type === 'image') photoUrls.push(uploadedUrls[i]);
          else videoUrls.push(uploadedUrls[i]);
        });
      }

      // Step 2 — Save review with Cloudinary URLs
      setSubmitStatus('submitting');
      await catalogApiModule.createReview(productId, {
        userName: user?.name ?? 'Anonymous',
        rating,
        text: text.trim(),
        photos: photoUrls,
      });

      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Failed', err?.message ?? 'Could not submit review. Try again.');
    } finally {
      setSubmitStatus('idle');
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* How Was Your Experience */}
        <Text style={styles.question}>How Was Your Shopping Experience?</Text>

        {/* Star Rating Box */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Your overall rating</Text>
          <StarPicker rating={rating} onChange={setRating} />
        </View>

        {/* Review Text */}
        <Text style={styles.sectionLabel}>Add detailed review</Text>
        <TextInput
          placeholder="Enter here"
          placeholderTextColor={colors.textSecondary}
          style={styles.textArea}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
        />

        {/* Media Previews */}
        {media.length > 0 && (
          <View style={styles.mediaGrid}>
            {media.map((item, i) => (
              <View key={i} style={styles.mediaItem}>
                {item.type === 'image' ? (
                  <Image source={{ uri: item.uri }} style={styles.mediaThumb} resizeMode="cover" />
                ) : (
                  // Video thumbnail — show a dark box with play icon (no playback on picker preview)
                  <View style={[styles.mediaThumb, styles.videoThumb]}>
                    <Feather name="film" size={24} color="rgba(255,255,255,0.8)" />
                    <View style={styles.playOverlay}>
                      <Feather name="play" size={20} color="#fff" />
                    </View>
                  </View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeMedia(i)}>
                  <Feather name="x" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add Photo/Video Button */}
        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickMedia}>
          <Feather name="camera" size={18} color={colors.textPrimary} style={{ marginRight: 8 }} />
          <Text style={styles.addPhotoText}>add photo / video</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.submitBtn, submitStatus !== 'idle' && { opacity: 0.8 }]}
          onPress={handleSubmit}
          disabled={submitStatus !== 'idle'}
        >
          {submitStatus === 'uploading' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitText}>Uploading media…</Text>
            </View>
          )}
          {submitStatus === 'submitting' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitText}>Submitting…</Text>
            </View>
          )}
          {submitStatus === 'idle' && <Text style={styles.submitText}>Submit</Text>}
        </TouchableOpacity>
      </View>
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
  content: { paddingHorizontal: spacing.screenHorizontal, paddingBottom: 120, paddingTop: spacing.lg },

  question: {
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 16,
    marginBottom: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  ratingLabel: { fontSize: typography.sizes.md, color: colors.textSecondary },

  sectionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    minHeight: 120,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    marginBottom: spacing.md,
  },

  // Media
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  mediaItem: { position: 'relative' },
  mediaThumb: { width: 90, height: 90, borderRadius: 12 },
  videoThumb: { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  removeBtn: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#4A2511',
    justifyContent: 'center', alignItems: 'center',
  },

  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addPhotoText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },

  // CTA
  ctaContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: 36, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  submitBtn: {
    backgroundColor: '#4A2511',
    borderRadius: 30, height: 56,
    justifyContent: 'center', alignItems: 'center',
  },
  submitText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
