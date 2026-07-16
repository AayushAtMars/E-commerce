import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { useQuery } from '@tanstack/react-query';
import { chatApiModule } from '../../api/chat.api';

export function ChatScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');

  const { data: chats, isLoading } = useQuery({
    queryKey: ['activeChats'],
    queryFn: async () => {
      const res = await chatApiModule.getActiveChats();
      return res.data.data.chats;
    },
    refetchInterval: 5000, // Poll every 5s for new messages (demo purposes)
  });

  const displayChats = activeTab === 'Unread'
    ? (chats || []).filter((c: any) => c.unread > 0)
    : (chats || []);

  const unreadCount = (chats || []).filter((c: any) => c.unread > 0).length;

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, contact: item.partner })}
    >
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: item.partner.avatar }} style={styles.avatar} />
        {item.partner.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.contactName}>{item.partner.name}</Text>
        <Text style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]} numberOfLines={1}>
          {item.lastMessage || 'Start a conversation'}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.timeText}>
          {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {item.unread > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        ) : (
          <Feather name="check-circle" size={16} color="#3E1F0F" style={{ marginTop: 4 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.tabActive]}
          onPress={() => setActiveTab('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.tabTextActive]}>
            All {unreadCount > 0 && activeTab === 'All' ? `  ${unreadCount}` : ''}
          </Text>
          {unreadCount > 0 && activeTab === 'All' && (
            <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{unreadCount}</Text></View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Unread' && styles.tabActive]}
          onPress={() => setActiveTab('Unread')}
        >
          <Text style={[styles.tabText, activeTab === 'Unread' && styles.tabTextActive]}>Unread</Text>
        </TouchableOpacity>
      </View>

      {/* Conversations */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3E1F0F" />
        </View>
      ) : chats?.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Feather name="message-circle" size={48} color="#CCC" />
          <Text style={{ marginTop: 16, color: '#999' }}>No conversations yet.</Text>
        </View>
      ) : (
        <FlatList
          data={displayChats}
          keyExtractor={i => i.id}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAFAFA' },

  header: {
    backgroundColor: '#3E1F0F',
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: { flexDirection: 'row', alignItems: 'center', marginRight: 24, paddingBottom: 8 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#3E1F0F' },
  tabText: { fontSize: 15, color: '#999', fontWeight: '500' },
  tabTextActive: { color: '#3E1F0F', fontWeight: '700' },
  tabBadge: {
    marginLeft: 6, width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#F5A623', justifyContent: 'center', alignItems: 'center',
  },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  avatarWrapper: { position: 'relative', marginRight: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#fff',
  },
  conversationInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  lastMessage: { fontSize: 13, color: '#999' },
  lastMessageUnread: { color: '#4CAF50', fontWeight: '500' },
  conversationMeta: { alignItems: 'flex-end', gap: 4 },
  timeText: { fontSize: 12, color: '#999' },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#F5A623', justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});
