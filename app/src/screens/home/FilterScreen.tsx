import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Slider from '@react-native-community/slider';
import Feather from '@expo/vector-icons/Feather';
import { useCategories } from '../../hooks/useProducts';

type HomeNav = NativeStackNavigationProp<HomeStackParamList>;

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const REVIEWS = [
  { label: '4.5 and above', value: 4.5 },
  { label: '4.0 - 4.5', value: 4.0 },
  { label: '3.5 - 4.0', value: 3.5 },
  { label: '3.0 - 3.5', value: 3.0 },
  { label: '2.5 - 3.0', value: 2.5 },
];

const COLORS = [
  '#4A2511', // Brown
  '#000000', // Black
  '#E68A00', // Orange
  '#C71520', // Red
  '#008055', // Green
  '#CCCCCC', // Gray
  '#FFFFFF', // White
];

export function FilterScreen() {
  const navigation = useNavigation<HomeNav>();
  
  const { data: categories = [] } = useCategories();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(4.5);
  const [maxPrice, setMaxPrice] = useState(40);
  const [selectedColor, setSelectedColor] = useState<string>('#4A2511');

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setMaxPrice(40);
    setMinRating(null);
    setSelectedColor('#4A2511');
  };

  const handleApply = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={{ width: 44 }} />
        {/* Spacer for centering title */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Size */}
        <Text style={styles.sectionLabel}>Size</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeChip,
                selectedSize === size && styles.sizeChipActive
              ]}
              onPress={() => setSelectedSize(size === selectedSize ? null : size)}
            >
              <Text style={[
                styles.sizeChipText,
                selectedSize === size && styles.chipTextActive
              ]}>
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reviews */}
        <Text style={styles.sectionLabel}>Reviews</Text>
        <View style={styles.reviewsContainer}>
          {REVIEWS.map((rev) => (
            <TouchableOpacity
              key={rev.label}
              style={styles.reviewRow}
              onPress={() => setMinRating(rev.value)}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={[styles.starIcon, { color: star <= rev.value ? '#FFA726' : '#FFE0B2' }]}>★</Text>
                ))}
                <Text style={styles.reviewLabel}>{rev.label}</Text>
              </View>
              <View style={[styles.radio, minRating === rev.value && styles.radioActive]}>
                {minRating === rev.value && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Range */}
        <Text style={styles.sectionLabel}>Price Range</Text>
        <View style={styles.priceContainer}>
          <Slider
            style={styles.slider}
            minimumValue={10}
            maximumValue={45}
            step={5}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor="#4A2511"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#4A2511"
          />
          <View style={styles.priceLabels}>
            {[10, 15, 20, 25, 30, 35, 40, 45].map((val) => (
              <Text key={val} style={styles.priceLabelText}>${val}</Text>
            ))}
          </View>
        </View>

        {/* Color */}
        <Text style={styles.sectionLabel}>Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorRing,
                selectedColor === c && styles.colorRingActive,
              ]}
              onPress={() => setSelectedColor(c)}
            >
              <View style={[styles.colorSwatch, { backgroundColor: c }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* CTA Bottom Bar */}
      <View style={styles.ctaArea}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>Reset Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8'
  },
  headerTitle: { fontSize: 18, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.screenHorizontal },
  sectionLabel: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  horizontalScroll: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: 18,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  chipActive: { backgroundColor: '#4A2511' },
  chipText: { fontSize: 15, color: colors.textPrimary, fontWeight: typography.weights.medium },
  chipTextActive: { color: colors.white },
  sizeChip: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  sizeChipActive: { backgroundColor: '#4A2511' },
  sizeChipText: { fontSize: 15, color: colors.textPrimary, fontWeight: typography.weights.medium },
  reviewsContainer: {
    gap: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    fontSize: 20,
  },
  reviewLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: '#4A2511' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4A2511' },
  priceContainer: {
    marginTop: spacing.sm,
  },
  slider: { 
    width: '100%', 
    height: 40,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  priceLabelText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  colorRing: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12, borderWidth: 1, borderColor: 'transparent',
  },
  colorRingActive: { borderColor: '#000000', borderWidth: 2 },
  colorSwatch: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)'
  },
  ctaArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    gap: 16,
  },
  resetBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: '#4A2511',
  },
  applyBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#4A2511',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
