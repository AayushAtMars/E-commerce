import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export function AddCardScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Format card number for display: XXXX XXXX XXXX XXXX
  const displayCardNumber = cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() || 'XXXX XXXX XXXX XXXX';
  const displayName = name || 'Aayush Singh';
  const displayExpiry = expiry || 'MM/YY';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Card</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Card Preview */}
          <View style={styles.cardPreview}>
            {/* Background Decor */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />

            <View style={styles.cardTopRow}>
              <View />
              <Text style={styles.visaText}>VISA</Text>
            </View>

            <Text style={styles.previewNumber}>{displayCardNumber}</Text>

            <View style={styles.cardBottomRow}>
              <View style={styles.previewInfo}>
                <Text style={styles.previewLabel}>Card holder name</Text>
                <Text style={styles.previewValue} numberOfLines={1}>{displayName}</Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewLabel}>Expiry date</Text>
                <Text style={styles.previewValue}>{displayExpiry}</Text>
              </View>
              <View style={styles.chipIcon}>
                {/* Mock chip */}
                <View style={styles.chipInnerLine} />
                <View style={styles.chipInnerLine} />
                <View style={styles.chipInnerLine} />
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Aayush Singh"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="4716 9627 1635 8047"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={19}
              value={cardNumber}
              onChangeText={(text) => {
                // Auto-format with spaces
                const cleaned = text.replace(/\s/g, '');
                const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim();
                setCardNumber(formatted);
              }}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 16 }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="02/30"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={5}
                value={expiry}
                onChangeText={(text) => {
                  let cleaned = text.replace(/[^0-9]/g, '');
                  if (cleaned.length > 2) {
                    cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                  }
                  setExpiry(cleaned);
                }}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="000"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            activeOpacity={0.7} 
            onPress={() => setSaveCard(!saveCard)}
          >
            <View style={[styles.checkbox, saveCard && styles.checkboxActive]}>
              {saveCard && <Feather name="check" size={14} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Save Card</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA Sheet */}
      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.addBtnText}>Add Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 52, paddingBottom: 16, backgroundColor: '#fff',
    position: 'relative',
  },
  backBtn: { 
    position: 'absolute', left: 24, top: 52,
    width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#E8E8E8', 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },

  content: { padding: 24, paddingBottom: 120 },

  // Card Preview
  cardPreview: {
    backgroundColor: '#4A2A18', // dark brown base
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    marginBottom: 32,
    overflow: 'hidden', // if you want to add absolute circles for design later
  },
  circle1: { position: 'absolute', top: -30, right: -10, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  circle2: { position: 'absolute', top: 10, right: -40, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.08)' },
  circle3: { position: 'absolute', bottom: -50, left: -20, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.03)' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 },
  visaText: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontStyle: 'italic', zIndex: 1 },
  
  previewNumber: { color: '#fff', fontSize: 24, fontWeight: '600', letterSpacing: 2, zIndex: 1 },
  
  cardBottomRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1 },
  previewInfo: { flex: 1, marginRight: 16 },
  previewLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 },
  previewValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  chipIcon: {
    width: 36, height: 26, borderRadius: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingHorizontal: 2
  },
  chipInnerLine: {
    width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.2)'
  },

  // Form Inputs
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
  },
  row: { flexDirection: 'row' },

  // Checkbox
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, borderColor: '#4A2A18',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: { backgroundColor: '#4A2A18' },
  checkboxLabel: { fontSize: 15, color: '#1A1A1A', fontWeight: '500' },

  // Bottom CTA
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
  addBtn: {
    backgroundColor: '#3E1F0F',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
