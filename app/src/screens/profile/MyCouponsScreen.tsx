import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

interface Coupon {
  _id: string; code: string; title: string; description: string;
  discountType: 'percent' | 'flat'; discountValue: number;
  minOrderValue: number; maxDiscount?: number; expiresAt: string;
  usageLimit: number; usedCount: number;
}

export function MyCouponsScreen() {
  const navigation = useNavigation<ProfileNav>();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      await catalogApiModule.seedCoupons().catch(() => {});
      const res = await catalogApiModule.listCoupons();
      return res.data.data.coupons as Coupon[];
    },
    staleTime: 60_000,
  });

  const handleCopy = (code: string) => {
    Clipboard.setString(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Coupons</Text>
        </View>
      </View>

      <View style={styles.container}>
        <Text style={styles.subHeader}>Coupons for you</Text>
        
        {isLoading ? (
          <ActivityIndicator color="#4A2A1A" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={coupons ?? []}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🎟</Text>
                <Text style={styles.emptyTitle}>No Coupons Available</Text>
                <Text style={styles.emptySub}>Check back later for exciting offers!</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isCopied = copied === item.code;
              return (
                <View style={styles.couponCard}>
                  {/* Top White Section */}
                  <View style={styles.cardTop}>
                    {/* The cutout on the left */}
                    <View style={styles.leftCutout} />
                    
                    <View style={styles.cardContent}>
                      <Text style={styles.codeText}>{item.code}</Text>
                      <Text style={styles.minOrderText}>
                        {item.minOrderValue > 0 
                          ? `Add items worth ₹${item.minOrderValue} more to unlock` 
                          : 'Valid on all items'}
                      </Text>
                      <View style={styles.badgeRow}>
                        <Feather name="award" size={16} color="#F5A623" />
                        <Text style={styles.descText}>{item.title}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Bottom Dark Section */}
                  <TouchableOpacity 
                    style={styles.cardBottom} 
                    onPress={() => handleCopy(item.code)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.copyText}>
                      {isCopied ? 'COPIED!' : 'COPY CODE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F8F9FB',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EAEAEA',
    zIndex: 10,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  list: { paddingBottom: 40, gap: 16 },
  
  couponCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    overflow: 'hidden', // to round the corners of the dark bottom button
  },
  cardTop: {
    padding: 16,
    paddingLeft: 24, // extra space for the cutout
    position: 'relative',
    backgroundColor: '#FFF',
  },
  leftCutout: {
    position: 'absolute',
    left: -12,
    top: '50%',
    marginTop: -12, // half height
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8F9FB', // match background color
    borderRightWidth: 1,
    borderColor: '#EFEFEF',
    zIndex: 2,
  },
  cardContent: {
    zIndex: 1,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  minOrderText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  descText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#444',
  },

  cardBottom: {
    backgroundColor: '#3E1F0F',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#777', textAlign: 'center' },
});
