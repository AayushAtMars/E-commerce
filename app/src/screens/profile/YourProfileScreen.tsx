import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuthStore } from '../../store/authStore';
import { catalogApiModule } from '../../api/catalog.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

const GENDERS = ['Male', 'Female', 'Other'] as const;

export function YourProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>(
    (user?.gender as 'Male' | 'Female' | 'Other') ?? ''
  );
  
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      let profileImageUrl = user?.avatarUrl;

      // Upload image to Cloudinary via backend if a new image was picked
      if (localImageUri) {
        const formData = new FormData();
        const filename = localImageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('files', {
          uri: localImageUri,
          name: filename,
          type,
        } as any);

        const uploadRes = await catalogApiModule.uploadFiles(formData);
        if (uploadRes.data.urls && uploadRes.data.urls.length > 0) {
          profileImageUrl = uploadRes.data.urls[0];
        }
      }

      return catalogApiModule.updateProfile({
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        dob: dob.trim() || undefined,
        gender: gender || undefined,
        avatarUrl: profileImageUrl,
      });
    },
    onSuccess: (res) => {
      setUser(res.data.data.user);
      Alert.alert('Saved!', 'Your profile has been updated.');
      navigation.goBack(); // Return to the main profile screen
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Could not update profile.');
    },
  });

  const displayImage = localImageUri || user?.avatarUrl;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{name?.charAt(0)?.toUpperCase() ?? '👤'}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Feather name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.emailLabel}>{user?.email}</Text>
        </View>

        {/* Fields */}
        <View style={styles.form}>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" />
          <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+91 9876543210" keyboardType="phone-pad" />
          <Field label="Date of Birth" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" />

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, mutation.isPending && styles.saveBtnDisabled]}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType = 'default',
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'email-address';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.md, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { padding: spacing.screenHorizontal },
  
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.md },
  avatarWrapper: { position: 'relative', marginBottom: spacing.sm },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarFallback: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { fontSize: 36, color: colors.white, fontWeight: typography.weights.bold },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4A2A1A',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: colors.background,
  },
  emailLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  
  form: { backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl, padding: spacing.md, marginBottom: spacing.lg, gap: spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary, marginBottom: 4 },
  input: { height: 48, borderWidth: 1.5, borderColor: colors.borderLight, borderRadius: spacing.borderRadius.lg, paddingHorizontal: spacing.md, fontSize: typography.sizes.md, color: colors.textPrimary, backgroundColor: colors.background },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderBtn: { flex: 1, height: 44, borderRadius: spacing.borderRadius.pill, borderWidth: 1.5, borderColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  genderBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  genderText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.textSecondary },
  genderTextActive: { color: colors.white },
  saveBtn: { backgroundColor: colors.primary, borderRadius: spacing.borderRadius.pill, height: 56, justifyContent: 'center', alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: colors.white, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
});
