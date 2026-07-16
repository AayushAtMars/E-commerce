import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { catalogApiModule } from '../../api/catalog.api';
import { useAuthStore } from '../../store/authStore';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

export function DeleteAccountScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { logout } = useAuthStore();

  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePwd, setShowDeletePwd] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => catalogApiModule.deleteAccount({ password: deletePassword }),
    onSuccess: () => {
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
      logout();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete account.');
    },
  });

  const handleDelete = () => {
    if (!deletePassword) {
      Alert.alert('Required', 'Enter your password to confirm deletion.');
      return;
    }
    Alert.alert(
      '⚠️ Delete Account',
      'This is permanent and cannot be undone. All your data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.iconCircle}>
            <Feather name="alert-triangle" size={28} color={colors.danger} />
          </View>
          
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <Text style={styles.dangerDesc}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={styles.input}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry={!showDeletePwd}
                placeholder="••••••••"
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowDeletePwd((v) => !v)}>
                <Feather name={showDeletePwd ? 'eye-off' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, styles.dangerBtn, deleteMutation.isPending && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Delete Forever</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: '#FAFAFA',
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  
  content: { paddingBottom: 40 },
  section: {
    backgroundColor: '#fff', 
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFE5E5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.danger, marginBottom: 8, textAlign: 'center' },
  dangerDesc: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  
  fieldGroup: { width: '100%', marginBottom: 24 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  pwRow: { 
    flexDirection: 'row', alignItems: 'center', 
    borderWidth: 1, borderColor: '#EAEAEA', 
    borderRadius: 12, backgroundColor: '#FAFAFA', 
    overflow: 'hidden' 
  },
  input: { flex: 1, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#1A1A1A' },
  eyeBtn: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  
  btn: { width: '100%', backgroundColor: colors.danger, borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  dangerBtn: { backgroundColor: colors.danger },
});
