import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { commerceApiModule } from '../../api/commerce.api';
import Feather from '@expo/vector-icons/Feather';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList>;

const TOP_UP_OPTIONS = [100, 200, 500, 1000, 2000, 5000];

const SOURCE_ICONS: Record<string, string> = {
  top_up: 'credit-card', order_payment: 'shopping-bag', refund: 'rotate-ccw', cashback: 'gift', admin: 'settings',
};

interface Transaction {
  _id: string; type: 'credit' | 'debit'; amount: number;
  source: string; description: string; createdAt: string; orderId?: string;
}

export function MyWalletScreen() {
  const navigation = useNavigation<ProfileNav>();
  const queryClient = useQueryClient();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const { data: walletData, isLoading, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await commerceApiModule.getWallet();
      return res.data.data.wallet;
    },
  });

  const { data: txData, isLoading: txLoading, refetch: refetchTx } = useQuery({
    queryKey: ['walletTxns'],
    queryFn: async () => {
      const res = await commerceApiModule.getWalletTransactions();
      return res.data.data;
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetchWallet();
      refetchTx();
    }, [refetchWallet, refetchTx])
  );

  const topUpMutation = useMutation({
    mutationFn: (amount: number) => commerceApiModule.topUpWallet(amount),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletTxns'] });
      setSelectedAmount(null);
      
      // Navigate to TopUpSuccess screen
      navigation.navigate('TopUpSuccess', { amount: selectedAmount! });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } };
      Alert.alert('Error', e?.response?.data?.message ?? 'Top-up failed.');
    },
  });

  const handleTopUp = () => {
    if (!selectedAmount) {
      Alert.alert('Select Amount', 'Please choose a top-up amount.');
      return;
    }
    Alert.alert(
      'Confirm Top Up',
      `Add ₹${selectedAmount.toLocaleString('en-IN')} to your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Money', onPress: () => topUpMutation.mutate(selectedAmount) },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>My Wallet</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.white} style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.balanceValue}>
              ₹{(walletData?.balance ?? 0).toLocaleString('en-IN')}
            </Text>
          )}
          <Text style={styles.balanceSub}>Fashop Wallet</Text>
        </View>

        {/* Top up section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Money</Text>
          <View style={styles.amountGrid}>
            {TOP_UP_OPTIONS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[styles.amountBtn, selectedAmount === amt && styles.amountBtnActive]}
                onPress={() => setSelectedAmount(amt)}
              >
                <Text style={[styles.amountBtnText, selectedAmount === amt && styles.amountBtnTextActive]}>
                  ₹{amt.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.topUpBtn, (!selectedAmount || topUpMutation.isPending) && styles.topUpBtnDisabled]}
            onPress={handleTopUp}
            disabled={!selectedAmount || topUpMutation.isPending}
          >
            {topUpMutation.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.topUpBtnText}>
                {selectedAmount ? `Add ₹${selectedAmount.toLocaleString('en-IN')}` : 'Select an Amount'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Transaction history */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {txLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : !txData?.transactions?.length ? (
            <Text style={styles.emptyTxn}>No transactions yet.</Text>
          ) : (
            txData.transactions.map((txn: Transaction) => (
              <View key={txn._id} style={styles.txnRow}>
                <View style={[styles.txnIcon, txn.type === 'credit' ? styles.txnCredit : styles.txnDebit]}>
                  <Feather name={(SOURCE_ICONS[txn.source] ?? 'dollar-sign') as any} size={18} color={txn.type === 'credit' ? '#2ECC71' : '#E74C3C'} />
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
                  <Text style={styles.txnDate}>
                    {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={[styles.txnAmount, txn.type === 'credit' ? styles.txnAmtCredit : styles.txnAmtDebit]}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
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
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#EAEAEA',
    zIndex: 10,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  balanceCard: {
    backgroundColor: colors.primary, margin: spacing.screenHorizontal,
    borderRadius: spacing.borderRadius.xl, padding: spacing.xl, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  balanceLabel: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  balanceValue: { fontSize: 44, fontWeight: typography.weights.bold, color: colors.white, marginBottom: 6 },
  balanceSub: { fontSize: typography.sizes.sm, color: 'rgba(255,255,255,0.6)' },
  section: {
    backgroundColor: colors.white, marginHorizontal: spacing.screenHorizontal,
    borderRadius: spacing.borderRadius.xl, padding: spacing.md, marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  amountBtn: {
    width: '30%', paddingVertical: 12, borderRadius: spacing.borderRadius.lg,
    borderWidth: 1.5, borderColor: colors.borderLight, alignItems: 'center',
  },
  amountBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amountBtnText: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.textSecondary },
  amountBtnTextActive: { color: colors.white },
  topUpBtn: { backgroundColor: colors.primary, borderRadius: spacing.borderRadius.pill, height: 56, justifyContent: 'center', alignItems: 'center' },
  topUpBtnDisabled: { opacity: 0.4 },
  topUpBtnText: { color: colors.white, fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  txnIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txnCredit: { backgroundColor: '#E5FAF0' },
  txnDebit: { backgroundColor: '#FFE5E5' },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: typography.sizes.md, color: colors.textPrimary, fontWeight: typography.weights.medium },
  txnDate: { fontSize: typography.sizes.xs, color: colors.textSecondary, marginTop: 2 },
  txnAmount: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  txnAmtCredit: { color: colors.success },
  txnAmtDebit: { color: colors.danger },
  emptyTxn: { fontSize: typography.sizes.md, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.md },
});
