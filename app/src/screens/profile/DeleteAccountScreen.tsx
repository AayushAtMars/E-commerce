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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Delete Account</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>⚠️ Delete Account</Text>
          <Text style={styles.dangerDesc}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry={!showDeletePwd}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowDeletePwd((v) => !v)}>
                <Feather name={showDeletePwd ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
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
              : <Text style={styles.btnText}>Delete My Account</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    zIndex: 10,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: { padding: spacing.screenHorizontal, paddingTop: 20 },
  section: {
    backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl,
    padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  dangerSection: { borderWidth: 1.5, borderColor: colors.danger },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 4 },
  dangerDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  fieldGroup: { gap: 4, marginTop: 10 },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary },
  pwRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderLight, borderRadius: spacing.borderRadius.lg, backgroundColor: colors.background, overflow: 'hidden' },
  input: { height: 48, paddingHorizontal: spacing.md, fontSize: typography.sizes.md, color: colors.textPrimary },
  eyeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: spacing.borderRadius.pill, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  dangerBtn: { backgroundColor: colors.danger },
});
