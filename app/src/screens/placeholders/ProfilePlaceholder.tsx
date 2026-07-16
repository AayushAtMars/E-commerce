import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// Generic placeholder used for Phase 5+ screens
export function ProfilePlaceholder({ route }: { route?: { name?: string } }) {
  const navigation = useNavigation();
  const screenName = route?.name ?? 'Screen';

  return (
    <View style={styles.root}>
      {screenName !== 'ProfileHome' && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{screenName.replace(/([A-Z])/g, ' $1').trim()}</Text>
          <View style={{ width: 44 }} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.icon}>🔨</Text>
        <Text style={styles.title}>Coming in Phase 5</Text>
        <Text style={styles.sub}>This feature is planned for an upcoming phase.</Text>
      </View>
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
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.screenHorizontal },
  icon: { fontSize: 56, marginBottom: spacing.md },
  title: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sub: { fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center' },
});
