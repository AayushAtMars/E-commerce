import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../navigation/types';
import Feather from '@expo/vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { logout } = useAuthStore();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Notification Settings */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('NotificationSettings')}>
          <View style={styles.iconContainer}>
            <Feather name="bell" size={20} color="#1A1A1A" />
          </View>
          <Text style={styles.menuText}>Notification Settings</Text>
          <Feather name="chevron-right" size={20} color="#F5A623" />
        </TouchableOpacity>
        <View style={styles.divider} />

        {/* Password Manager */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PasswordManager')}>
          <View style={styles.iconContainer}>
            <Feather name="key" size={20} color="#1A1A1A" />
          </View>
          <Text style={styles.menuText}>Password Manager</Text>
          <Feather name="chevron-right" size={20} color="#F5A623" />
        </TouchableOpacity>
        <View style={styles.divider} />

        {/* Delete Account */}
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('DeleteAccount')}>
          <View style={styles.iconContainer}>
            <Feather name="trash-2" size={20} color="#1A1A1A" />
          </View>
          <Text style={styles.menuText}>Delete Account</Text>
          <Feather name="chevron-right" size={20} color="#F5A623" />
        </TouchableOpacity>
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.menuItem} onPress={() => setShowLogout(true)}>
          <View style={styles.iconContainer}>
            <Feather name="log-out" size={20} color="#E74C3C" />
          </View>
          <Text style={[styles.menuText, { color: '#E74C3C' }]}>Logout</Text>
          <Feather name="chevron-right" size={20} color="#F5A623" />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Logout</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalSubtitle}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogout(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={() => logout()}>
                <Text style={styles.confirmBtnText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F2',
    marginLeft: 64, // Aligned with the text
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F2F2F2',
    marginBottom: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#3E1F0F',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
