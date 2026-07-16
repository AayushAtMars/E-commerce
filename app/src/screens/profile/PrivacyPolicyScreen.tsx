import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, phone number, and delivery address when you create an account or place an order. We also collect usage data and device information to improve your experience.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use your information to process orders and payments, provide customer support, send order updates and promotional communications (if opted in), improve our services, and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell your personal information. We share data only with delivery partners to fulfil your orders, payment processors to handle transactions, and analytics providers under strict confidentiality agreements.',
  },
  {
    title: '4. Data Security',
    body: 'We implement industry-standard security measures including HTTPS encryption, hashed passwords, and access controls. Your payment information is never stored on our servers.',
  },
  {
    title: '5. Cookies & Tracking',
    body: 'Our app uses minimal session tokens for authentication purposes. We do not use third-party advertising trackers or sell your browsing data.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. You can update your profile information, manage notification preferences, or delete your account from the Settings screen.',
  },
  {
    title: '7. Data Retention',
    body: 'We retain your data for as long as your account is active or as needed to provide services. Order records are retained for accounting and legal compliance purposes for up to 7 years.',
  },
  {
    title: '8. Contact Us',
    body: 'For privacy-related queries, reach us at privacy@fashop.in or call 1800-123-4567 (Mon–Sat, 9 AM – 6 PM).',
  },
];

export function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: July 2026</Text>
        <Text style={styles.intro}>
          At Fashop, your privacy is our priority. This policy explains how we collect, use, and protect your personal information.
        </Text>

        {SECTIONS.map((s, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

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
  lastUpdated: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  intro: { fontSize: typography.sizes.md, color: colors.textPrimary, lineHeight: 24, marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionBody: { fontSize: typography.sizes.md, color: colors.textSecondary, lineHeight: 24 },
});
