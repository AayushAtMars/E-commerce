import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApiModule } from '../../api/catalog.api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import Feather from '@expo/vector-icons/Feather';

type ParamList = { Detail: { ticketId: string } };

export function TicketDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'Detail'>>();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', route.params.ticketId],
    queryFn: async () => {
      const res = await catalogApiModule.getTicket(route.params.ticketId);
      return res.data.data;
    },
    refetchInterval: 3000, // Poll every 3 seconds for live chat feel
  });

  const replyMutation = useMutation({
    mutationFn: (text: string) => catalogApiModule.addTicketMessage(route.params.ticketId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', route.params.ticketId] });
      setReplyText('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message || 'Could not send message.');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Closed': return colors.textSecondary;
      case 'Resolved': return colors.success;
      case 'Escalated': return colors.danger;
      case 'In Progress': return '#F39C12'; // amber
      default: return colors.primary;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>Ticket not found.</Text>
      </View>
    );
  }

  const isClosed = ticket.status === 'Closed';

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Ticket #{ticket._id.substring(0, 8).toUpperCase()}</Text>
        </View>
      </View>

      {/* Ticket Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.subjectText} numberOfLines={1}>{ticket.subject}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
          <Text style={styles.statusText}>{ticket.status}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {ticket.messages?.map((msg: any, idx: number) => {
            const isUser = !msg.isAdmin;
            return (
              <View key={idx} style={[styles.messageWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
                <View style={[styles.messageBubble, isUser ? styles.bubbleRight : styles.bubbleLeft]}>
                  <Text style={[styles.msgSender, isUser ? styles.msgSenderRight : styles.msgSenderLeft]}>
                    {msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={[styles.msgText, isUser ? styles.msgTextRight : styles.msgTextLeft]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          {isClosed ? (
            <Text style={styles.closedText}>This ticket is closed and cannot be replied to.</Text>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor={colors.textSecondary}
                value={replyText}
                onChangeText={setReplyText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!replyText.trim() || replyMutation.isPending) && styles.sendBtnDisabled]}
                disabled={!replyText.trim() || replyMutation.isPending}
                onPress={() => replyMutation.mutate(replyText.trim())}
              >
                {replyMutation.isPending ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Feather name="send" size={20} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EFEFEF',
  },
  backBtn: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF',
    zIndex: 10 
  },
  headerTitleContainer: { ...StyleSheet.absoluteFillObject, paddingTop: 60, paddingBottom: 16, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.textPrimary },
  infoBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal, paddingVertical: spacing.md,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  subjectText: { flex: 1, fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.textPrimary, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: spacing.borderRadius.pill },
  statusText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  content: { padding: spacing.screenHorizontal, paddingVertical: spacing.md },
  messageWrapper: { marginBottom: spacing.md, flexDirection: 'row' },
  msgRight: { justifyContent: 'flex-end' },
  msgLeft: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleRight: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleLeft: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.borderLight },
  msgSender: { fontSize: 10, fontWeight: typography.weights.medium, marginBottom: 4 },
  msgSenderRight: { color: 'rgba(255,255,255,0.7)' },
  msgSenderLeft: { color: colors.textSecondary },
  msgText: { fontSize: typography.sizes.sm, lineHeight: 20 },
  msgTextRight: { color: colors.white },
  msgTextLeft: { color: colors.textPrimary },
  inputArea: { padding: spacing.sm, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borderLight },
  closedText: { textAlign: 'center', color: colors.danger, fontSize: typography.sizes.sm, paddingVertical: spacing.md },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end' },
  input: {
    flex: 1, backgroundColor: colors.background, borderRadius: 20,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    minHeight: 44, maxHeight: 100, fontSize: typography.sizes.md, color: colors.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm,
  },
  sendBtnDisabled: { opacity: 0.5 },
});
