import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

interface Address {
  _id: string; label: string; line1: string; floor?: string;
  city: string; state: string; pincode: string; isDefault: boolean;
}

export function ManageAddressScreen() {
  const navigation = useNavigation<ProfileNav>();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await catalogApiModule.getAddresses();
      return res.data.data.addresses as Address[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApiModule.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete address.');
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => catalogApiModule.setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Addresses</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Addresses Container */}
        <View style={styles.addressesContainer}>
          {isLoading ? (
            <ActivityIndicator color="#3E1F0F" style={{ padding: 20 }} />
          ) : addresses.length === 0 ? (
            <Text style={{ textAlign: 'center', padding: 20, color: '#999' }}>No addresses found. Please add one.</Text>
          ) : (
            addresses.map((item, index) => {
              return (
                <View key={item._id}>
                  <View style={styles.addressRow}>
                    <View style={styles.iconCircle}>
                      <Feather name="map-pin" size={16} color="#3E1F0F" />
                    </View>
                    <View style={styles.addressInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Text style={styles.addressLabel}>{item.label}</Text>
                        {item.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.addressText}>{item.line1}</Text>
                      <Text style={styles.addressText}>{item.city}, {item.state} — {item.pincode}</Text>
                      
                      <View style={styles.actionsRow}>
                        {!item.isDefault && (
                          <TouchableOpacity style={styles.actionBtn} onPress={() => defaultMutation.mutate(item._id)}>
                            <Text style={styles.actionBtnText}>Set Default</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.actionBtn, styles.deleteActionBtn]} onPress={() => handleDelete(item._id)}>
                          <Feather name="trash-2" size={12} color="#E53935" style={{ marginRight: 4 }} />
                          <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  {index < addresses.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })
          )}
        </View>

        {/* Add New Address Button */}
        <TouchableOpacity 
          style={styles.addBtnContainer}
          onPress={() => navigation.navigate('AddAddress', {})}
        >
          <Text style={styles.addBtnText}>+ Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F8F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 52, paddingBottom: 16, backgroundColor: '#F8F8F8',
    position: 'relative',
  },
  backBtn: { 
    position: 'absolute', left: 24, top: 52,
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  addressesContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  addressRow: {
    flexDirection: 'row', padding: 16, gap: 16
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4EFEB',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  defaultBadge: { backgroundColor: '#3E1F0F', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  defaultBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  addressText: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 2 },
  
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#EAEAEA' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#1A1A1A' },
  deleteActionBtn: { flexDirection: 'row', alignItems: 'center', borderColor: '#FFEBEE', backgroundColor: '#FFEBEE' },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: '#E53935' },
  
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 76, marginRight: 16 },

  addBtnContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3E1F0F',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  addBtnText: { color: '#3E1F0F', fontSize: 15, fontWeight: '600' },
});
