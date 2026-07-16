import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import WebView from 'react-native-webview';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;
type AddRoute = RouteProp<ProfileStackParamList, 'AddAddress'>;

const LABELS = ['Home', 'Office', "Parent's House", "Friend's House"] as const;

export function AddAddressScreen() {
  const navigation = useNavigation<ProfileNav>();
  const route = useRoute<AddRoute>();
  const { user } = useAuthStore();
  const isEdit = Boolean(route.params?.addressId);
  const queryClient = useQueryClient();

  const [label, setLabel] = useState<string>('Home');
  const [line1, setLine1] = useState('');
  const [floor, setFloor] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      catalogApiModule.createAddress({
        label, line1: line1.trim(), floor: floor.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(), state: state.trim(), pincode: pincode.trim(), isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      Alert.alert('Saved!', 'Address added successfully.');
      navigation.goBack();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not save address.');
    },
  });

  const handleSave = () => {
    if (!line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      Alert.alert('Required', 'Please fill address, city, state and pincode.');
      return;
    }
    mutation.mutate();
  };

  const getLabelIcon = (l: string, isActive: boolean) => {
    const color = isActive ? '#4A2A1A' : '#777';
    switch (l) {
      case 'Home': return <Feather name="home" size={14} color={color} />;
      case 'Office': return <Feather name="briefcase" size={14} color={color} />;
      case "Parent's House": return <Feather name="users" size={14} color={color} />;
      case "Friend's House": return <Feather name="user" size={14} color={color} />;
      default: return null;
    }
  };

  const avatarUrl = user?.avatarUrl || 'https://i.pravatar.cc/150?img=47';
  
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; background: #F8F9FB; }
        .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }
        .pin-user {
          width: 44px; height: 44px; border-radius: 50% 50% 50% 0;
          background: #4A2A1A;
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
          border: 3px solid #4A2A1A;
          box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        .pin-user img {
          width: 38px; height: 38px; border-radius: 50%;
          transform: rotate(45deg);
          object-fit: cover;
          background: #FFF;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var lat = 40.714;
        var lng = -74.005;
        
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          touchZoom: false
        }).setView([lat, lng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }).addTo(map);

        L.marker([lat, lng], {
          icon: L.divIcon({
            html: '<div class="pin-user"><img src="${avatarUrl}" /></div>',
            className: '',
            iconSize: [44, 44],
            iconAnchor: [22, 44]
          })
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.root}>
      {/* Background Map */}
      <View style={StyleSheet.absoluteFill}>
        <WebView 
          source={{ html: mapHtml }}
          scrollEnabled={false}
          style={{ flex: 1, backgroundColor: '#F8F9FB' }}
        />
      </View>

      {/* Header overlaid on map */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Address' : 'Add Address'}</Text>
        </View>
      </View>

      {/* Scrollable Form Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Spacer to show map */}
          <View style={{ height: SCREEN_HEIGHT * 0.35 }} />
          
          {/* White Bottom Sheet */}
          <View style={styles.sheetContainer}>
            <Text style={styles.sectionTitle}>ADDRESS LABEL</Text>
            
            <View style={styles.labelRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 10, paddingVertical: 4 }}>
                {LABELS.map((l) => {
                  const isActive = label === l;
                  return (
                    <TouchableOpacity
                      key={l}
                      style={[styles.labelBtn, isActive && styles.labelBtnActive]}
                      onPress={() => setLabel(l)}
                    >
                      {getLabelIcon(l, isActive)}
                      <Text style={[styles.labelText, isActive && styles.labelTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.form}>
              <Field label="Street Address *" value={line1} onChangeText={setLine1} placeholder="Flat/Block, Street, Area" multiline />
              <Field label="Floor / Apartment" value={floor} onChangeText={setFloor} placeholder="Floor 2, Apt 301" />
              <Field label="Landmark" value={landmark} onChangeText={setLandmark} placeholder="Near Metro Station" />
              
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label="City *" value={city} onChangeText={setCity} placeholder="City" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="State *" value={state} onChangeText={setState} placeholder="State" />
                </View>
              </View>
              <Field label="Pincode *" value={pincode} onChangeText={setPincode} placeholder="400001" keyboardType="number-pad" />
            </View>

            <TouchableOpacity style={styles.defaultRow} onPress={() => setIsDefault((v) => !v)} activeOpacity={0.7}>
              <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                {isDefault && <Feather name="check" size={14} color="#FFF" />}
              </View>
              <Text style={styles.defaultLabel}>Set as default address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.saveBtnText}>Save Address</Text>}
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder,
  keyboardType = 'default',
  multiline = false
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -44, // offset the back button width to truly center
    zIndex: -1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

  sheetContainer: {
    backgroundColor: '#F8F9FB', // Matches target background
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
    flex: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#777', marginBottom: 12 },
  
  labelRow: { marginBottom: 20, marginHorizontal: -4 },
  labelBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: '#EFEFEF', backgroundColor: '#FFF',
  },
  labelBtnActive: { borderColor: '#4A2A1A', backgroundColor: '#FFF', borderWidth: 1.5 },
  labelText: { fontSize: 14, color: '#555', fontWeight: '500' },
  labelTextActive: { color: '#4A2A1A', fontWeight: '700' },
  
  form: { gap: 16, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 16 },
  fieldGroup: { flex: 1 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1, borderColor: '#EAEAEA',
    borderRadius: 12, paddingHorizontal: 16,
    fontSize: 15, color: '#1A1A1A', backgroundColor: '#FFF',
  },
  inputMultiline: {
    paddingTop: 14, paddingBottom: 14, minHeight: 60, textAlignVertical: 'top'
  },
  
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24, alignSelf: 'flex-start' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#CCC',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF'
  },
  checkboxChecked: { backgroundColor: '#4A2A1A', borderColor: '#4A2A1A' },
  defaultLabel: { fontSize: 15, color: '#444' },
  
  saveBtn: {
    backgroundColor: '#4A2A1A', borderRadius: 28, height: 56,
    justifyContent: 'center', alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
