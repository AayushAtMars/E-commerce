import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
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

export function PasswordManagerScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { logout } = useAuthStore();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const changeMutation = useMutation({
    mutationFn: () =>
      catalogApiModule.changePassword({ currentPassword: currentPwd, newPassword: newPwd }),
    onSuccess: () => {
      Alert.alert('Password Changed', 'Your password has been updated. Please log in again.', [
        { text: 'OK', onPress: () => logout() },
      ]);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not change password.');
    },
  });


  const handleChange = () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      Alert.alert('Required', 'Please fill all fields.');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }
    if (newPwd.length < 8) {
      Alert.alert('Too Short', 'Password must be at least 8 characters.');
      return;
    }
    changeMutation.mutate();
  };


  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Password Manager</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Change password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <PWField label="Current Password" value={currentPwd} onChangeText={setCurrentPwd} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
          <PWField label="New Password" value={newPwd} onChangeText={setNewPwd} show={showNew} onToggle={() => setShowNew((v) => !v)} />
          <PWField label="Confirm New Password" value={confirmPwd} onChangeText={setConfirmPwd} show={showNew} onToggle={() => {}} />
          <TouchableOpacity
            style={[styles.btn, changeMutation.isPending && styles.btnDisabled]}
            onPress={handleChange}
            disabled={changeMutation.isPending}
          >
            {changeMutation.isPending
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.btnText}>Update Password</Text>}
          </TouchableOpacity>
        </View>


        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function PWField({
  label, value, onChangeText, show, onToggle,
}: { label: string; value: string; onChangeText: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.pwRow}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0 }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={styles.eyeBtn} onPress={onToggle}>
          <Feather name={show ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFF',
    paddingBottom: 20, gap: 16,
  },
  dangerSection: { borderWidth: 1.5, borderColor: colors.danger },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 4 },
  dangerDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary },
  pwRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.borderLight, borderRadius: spacing.borderRadius.lg, backgroundColor: colors.background, overflow: 'hidden' },
  input: { height: 48, paddingHorizontal: spacing.md, fontSize: typography.sizes.md, color: colors.textPrimary },
  eyeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  btn: { backgroundColor: '#3E1F0F', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  dangerBtn: { backgroundColor: colors.danger },
});
