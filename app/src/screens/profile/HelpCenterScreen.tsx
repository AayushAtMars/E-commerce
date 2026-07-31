import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApiModule } from '../../api/catalog.api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Feather from '@expo/vector-icons/Feather';

const FAQ_ITEMS = [
  {
    q: 'How do I track my order?',
    a: 'Go to Profile → My Orders → find your order and tap "Track". You will see a real-time status timeline and delivery agent details once your order is out for delivery.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'Yes! Orders in "Placed" or "In Progress" status can be cancelled. Go to Profile → My Orders → Order Detail → Cancel Order. Once the order is "On the Way" it cannot be cancelled.',
  },
  {
    q: 'How do I apply a coupon code?',
    a: 'Add items to your cart, tap "Proceed to Checkout", and enter your coupon code on the Cart screen before proceeding. Alternatively, browse available coupons in Profile → My Coupons.',
  },
  {
    q: 'How does the Fashop Wallet work?',
    a: 'You can add money to your Fashop Wallet in preset amounts (₹100 to ₹5000). During checkout, select "Wallet" as your payment method to pay from your balance.',
  },
  {
    q: 'How do I return or exchange an item?',
    a: 'Returns and exchanges are currently being implemented (Phase 6). Once available, you\'ll be able to initiate a return from Profile → My Orders → Order Detail.',
  },
  {
    q: 'How do I leave a review?',
    a: 'After your order is delivered, go to Profile → My Orders → Order Detail and tap "Leave a Review". You can rate and review each product from that order.',
  },
  {
    q: 'My payment failed but money was deducted. What do I do?',
    a: 'Wallet deductions that do not result in an order are automatically refunded within 5–7 business days. For card payments, please contact your bank.',
  },
  {
    q: 'How do I change my delivery address?',
    a: 'Go to Profile → Manage Addresses. You can add new addresses, set a default, or delete old ones.',
  },
];

export function HelpCenterScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Order Issue', text: '' });

  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['myTickets'],
    queryFn: async () => {
      const res = await catalogApiModule.getTickets();
      return res.data.data;
    }
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const createMutation = useMutation({
    mutationFn: () => catalogApiModule.createTicket({ ...ticketForm, priority: 'Medium' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
      setModalVisible(false);
      setTicketForm({ subject: '', category: 'Order Issue', text: '' });
      Alert.alert('Success', 'Your support ticket has been created.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not create ticket.');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed': return colors.textSecondary;
      case 'Resolved': return colors.success;
      case 'Escalated': return colors.danger;
      case 'In Progress': return '#F39C12';
      default: return colors.primary;
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Feather name="message-circle" size={32} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Browse FAQs or create a support ticket</Text>
          <TouchableOpacity 
            style={styles.heroBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.heroBtnText}>Submit a Ticket</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : tickets?.length > 0 ? (
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>My Support Tickets</Text>
            {tickets.map((ticket: any) => (
              <TouchableOpacity
                key={ticket._id}
                style={styles.ticketCard}
                onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket._id })}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                  <View style={[styles.ticketBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.ticketBadgeText}>{ticket.status}</Text>
                  </View>
                </View>
                <Text style={styles.ticketIdText}>ID: {ticket._id.substring(0, 8).toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.faqCard}
            onPress={() => setExpanded(expanded === idx ? null : idx)}
            activeOpacity={0.85}
          >
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQ}>{item.q}</Text>
              <Feather name={expanded === idx ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </View>
            {expanded === idx && (
              <Text style={styles.faqA}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Our support team is available Mon–Sat, 9 AM–6 PM</Text>
          <View style={styles.contactRow}>
            <View style={styles.contactChip}>
              <Feather name="mail" size={16} color={colors.primary} />
              <Text style={styles.contactText}>support@fashop.in</Text>
            </View>
            <View style={styles.contactChip}>
              <Feather name="phone" size={16} color={colors.primary} />
              <Text style={styles.contactText}>1800-123-4567</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Ticket Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit a Ticket</Text>

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {['Order Issue', 'Product Issue', 'Payment', 'Other'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, ticketForm.category === cat && styles.catChipActive]}
                  onPress={() => setTicketForm(prev => ({ ...prev, category: cat }))}
                >
                  <Text style={[styles.catChipText, ticketForm.category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description"
              value={ticketForm.subject}
              onChangeText={t => setTicketForm(prev => ({ ...prev, subject: t }))}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Provide details about your issue..."
              multiline
              value={ticketForm.text}
              onChangeText={t => setTicketForm(prev => ({ ...prev, text: t }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnOutlined}
                onPress={() => setModalVisible(false)}
                disabled={createMutation.isPending}
              >
                <Text style={styles.modalBtnOutlinedText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnFilled, (!ticketForm.subject || !ticketForm.text || createMutation.isPending) && { opacity: 0.5 }]}
                disabled={!ticketForm.subject || !ticketForm.text || createMutation.isPending}
                onPress={() => createMutation.mutate()}
              >
                {createMutation.isPending ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBtnFilledText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8F9FB',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  content: { padding: spacing.screenHorizontal },
  heroCard: {
    backgroundColor: '#9E5B35', borderRadius: 24,
    padding: 32, alignItems: 'center', marginBottom: spacing.lg,
    shadowColor: '#9E5B35', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  heroIconWrapper: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: spacing.md, marginTop: spacing.md },
  faqCard: {
    backgroundColor: '#FFF', borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  faqQ: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  faqA: { fontSize: 14, color: '#666', marginTop: 12, lineHeight: 22 },
  contactCard: {
    backgroundColor: '#FFF', borderRadius: 20,
    padding: 24, marginTop: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  contactTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  contactSub: { fontSize: 14, color: '#666', marginBottom: 20 },
  contactRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  contactChip: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: '#F8F9FB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#F0F0F0'
  },
  contactText: { fontSize: 14, color: '#333', fontWeight: '600' },
  heroBtn: { backgroundColor: '#FFF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24 },
  heroBtnText: { color: '#9E5B35', fontWeight: '800', fontSize: 15 },
  ticketCard: { 
    backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, 
    borderWidth: 1, borderColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' 
  },
  ticketHeader: { flex: 1, marginRight: 16 },
  ticketSubject: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  ticketBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ticketBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  ticketIdText: { fontSize: 12, color: '#888', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.md },
  modalContent: { backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl, padding: spacing.lg },
  modalTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.lg, textAlign: 'center' },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight, borderRadius: spacing.borderRadius.lg, padding: spacing.md, fontSize: typography.sizes.md, color: colors.textPrimary },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: spacing.borderRadius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: typography.weights.medium },
  catChipTextActive: { color: colors.white },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  modalBtnOutlined: { flex: 1, paddingVertical: 14, borderRadius: spacing.borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center' },
  modalBtnOutlinedText: { color: colors.textPrimary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md },
  modalBtnFilled: { flex: 1, paddingVertical: 14, borderRadius: spacing.borderRadius.lg, backgroundColor: colors.primary, alignItems: 'center' },
  modalBtnFilledText: { color: colors.white, fontWeight: typography.weights.semibold, fontSize: typography.sizes.md },
});
