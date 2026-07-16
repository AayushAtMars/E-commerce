import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.heroIcon}>💬</Text>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Browse FAQs or contact support</Text>
        </View>

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
              <Text style={styles.faqChevron}>{expanded === idx ? '▲' : '▼'}</Text>
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
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>support@fashop.in</Text>
            </View>
            <View style={styles.contactChip}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>1800-123-4567</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: spacing.screenHorizontal, paddingBottom: spacing.md, backgroundColor: colors.white,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  content: { padding: spacing.screenHorizontal },
  heroCard: {
    backgroundColor: colors.primary, borderRadius: spacing.borderRadius.xl,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg,
  },
  heroIcon: { fontSize: 40, marginBottom: spacing.sm },
  heroTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.white, marginBottom: 4 },
  heroSub: { fontSize: typography.sizes.md, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  faqCard: {
    backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl,
    padding: spacing.md, marginBottom: spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  faqQuestion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  faqQ: { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary },
  faqChevron: { fontSize: 12, color: colors.textSecondary },
  faqA: { fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },
  contactCard: {
    backgroundColor: colors.white, borderRadius: spacing.borderRadius.xl,
    padding: spacing.md, marginTop: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  contactTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: 4 },
  contactSub: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
  contactRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  contactChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.background, borderRadius: spacing.borderRadius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  contactIcon: { fontSize: 16 },
  contactText: { fontSize: typography.sizes.sm, color: colors.textPrimary, fontWeight: typography.weights.medium },
});
