import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export function NotificationPlaceholder() {
  const navigation = useNavigation();
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySub}>You'll see order updates and offers here.</Text>
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
  back: { width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 22, color: colors.textPrimary, fontWeight: typography.weights.semibold },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.screenHorizontal },
  emptyIcon: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySub: { fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center' },
});
