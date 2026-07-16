import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApiModule } from '../../api/chat.api';
import { useAuthStore } from '../../store/authStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SUGGESTIONS = [
  "Where are you?",
  "How much time?",
  "Call me when you reach",
  "Leave it at the door",
];

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (val: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -5, duration: 250, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(400),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={[styles.bubble, styles.bubbleOther, { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }]}>
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.typingDot, { transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

export function ChatDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const { chatId, contact } = route.params || {};

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const res = await chatApiModule.getChatMessages(chatId);
      return res.data.data.messages;
    },
    enabled: !!chatId,
    refetchInterval: 3000, 
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await chatApiModule.sendMessage(chatId, text);
      return res.data.data.message;
    },
    onMutate: async (newText) => {
      await queryClient.cancelQueries({ queryKey: ['chatMessages', chatId] });
      const previousMessages = queryClient.getQueryData(['chatMessages', chatId]);
      
      const optimisticMessage = {
        id: Date.now().toString(),
        senderId: 'me',
        type: 'text',
        text: newText,
        time: new Date().toISOString(),
      };

      queryClient.setQueryData(['chatMessages', chatId], (old: any) => [...(old || []), optimisticMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
      return { previousMessages };
    },
    onError: (err, newText, context: any) => {
      queryClient.setQueryData(['chatMessages', chatId], context.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['activeChats'] });
    },
  });

  const sendMessage = (text: string = inputText) => {
    if (!text.trim() || !chatId) return;
    sendMessageMutation.mutate(text.trim());
    setInputText('');
    
    // Simulate contact typing immediately after we send
    setIsTyping(true);
  };

  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      
      // If the last message is from the contact, stop typing indicator
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== 'me') {
        setIsTyping(false);
      }
    }
  }, [messages?.length]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.senderId === 'me';
    
    // Grouping by date
    const showDateSeparator = index === 0; 
    const messageTime = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>TODAY</Text>
            <View style={styles.dateLine} />
          </View>
        )}

        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          {!isMe && (
            <Image source={{ uri: contact?.avatar }} style={styles.msgAvatar} />
          )}

          <View style={[styles.messageGroup, isMe && styles.messageGroupMe]}>
            {item.type === 'text' && (
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                  {item.text}
                </Text>
              </View>
            )}

            <View style={[styles.msgMeta, isMe && styles.msgMetaMe]}>
              <Text style={styles.msgName}>{isMe ? 'You' : contact?.name}</Text>
              <Text style={styles.msgTime}>{messageTime}</Text>
            </View>
          </View>

          {isMe && (
            <Image source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150?img=1' }} style={styles.msgAvatar} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerCenter}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: contact?.avatar }} style={styles.headerAvatar} />
            {contact?.online && <View style={styles.onlineBadge} />}
          </View>
          <View>
            <Text style={styles.headerName}>{contact?.name}</Text>
            <Text style={styles.headerStatus}>{contact?.online ? 'Online' : 'Offline'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="phone" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#3E1F0F" /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={i => i.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              isTyping ? (
                <View style={[styles.messageRow, { marginTop: 10, marginBottom: 20 }]}>
                  <Image source={{ uri: contact?.avatar }} style={styles.msgAvatar} />
                  <TypingIndicator />
                </View>
              ) : null
            }
          />
        )}

        {/* Suggestions Row */}
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((sug, i) => (
              <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => sendMessage(sug)}>
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Premium Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.actionBtn}>
            <Feather name="plus" size={24} color="#888" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity style={styles.emojiBtn}>
              <Feather name="smile" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : {}]}
            onPress={inputText.trim() ? () => sendMessage() : undefined}
          >
            {inputText.trim() ? (
              <Feather name="send" size={18} color="#fff" style={{ marginLeft: -2, marginTop: 2 }} />
            ) : (
              <Feather name="mic" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F5F7' },

  header: {
    backgroundColor: '#3E1F0F',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { position: 'relative' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#3E1F0F',
  },
  headerName: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  headerStatus: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  messagesList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },

  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dateText: { fontSize: 12, color: '#A0AAB2', marginHorizontal: 12, fontWeight: '700', letterSpacing: 1.2 },

  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24, gap: 10 },
  messageRowMe: { justifyContent: 'flex-end' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  messageGroup: { maxWidth: SCREEN_WIDTH * 0.7 },
  messageGroupMe: { alignItems: 'flex-end' },

  bubble: { 
    borderRadius: 20, 
    paddingVertical: 14, 
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleOther: { 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 4,
  },
  bubbleMe: { 
    backgroundColor: '#4A2A1A', 
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, color: '#333', lineHeight: 22 },
  bubbleTextMe: { color: '#FFFFFF' },

  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  msgMetaMe: { justifyContent: 'flex-end' },
  msgName: { fontSize: 12, color: '#888', fontWeight: '500' },
  msgTime: { fontSize: 11, color: '#AAA' },

  typingContainer: { alignItems: 'flex-start' },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#999' },

  suggestionsContainer: { backgroundColor: '#F4F5F7', paddingVertical: 10, paddingBottom: 14 },
  suggestionsScroll: { paddingHorizontal: 20, gap: 10 },
  suggestionPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: { color: '#4A2A1A', fontSize: 14, fontWeight: '600' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 14,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    gap: 12,
  },
  actionBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  input: {
    flex: 1, fontSize: 15, color: '#1A1A1A',
    maxHeight: 100, paddingVertical: 0,
  },
  emojiBtn: { marginLeft: 10 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#A0A0A0', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnActive: { backgroundColor: '#3E1F0F' },
});
