import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, orderBy, doc, increment, updateDoc } from 'firebase/firestore';

import { COLORS } from '../constants/theme';
import { db } from '../config/firebaseConfig';
import { timeAgo } from '../utils/timeAgo';
import { getSavedAnonName } from '../components/ProfileModal';
import { useConfessions } from '../context/ConfessionsContext';
import CommentItem from '../components/CommentItem';
import TagChip from '../components/TagChip';
import ReactionBar from '../components/ReactionBar';

const CommentsScreen = ({ navigation, route }) => {
  const { confession } = route.params;
  const { reactToConfession } = useConfessions();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [reactions, setReactions] = useState(confession.reactions);
  const [activeReaction, setActiveReaction] = useState(null);
  const inputRef = useRef(null);
  const [myIdentity, setMyIdentity] = useState('Anonymous');

  // Load user's anonymous name
  useEffect(() => {
    getSavedAnonName().then(name => { if (name) setMyIdentity(name); });
  }, []);

  // Fetch comments from Firestore subcollection
  useEffect(() => {
    const q = query(
      collection(db, 'confessions', confession.id, 'comments'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [confession.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Sync reactions from parent update
  useEffect(() => {
    setReactions({ ...confession.reactions });
  }, [confession.reactions]);

  const handleSend = async () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText(''); // clear instantly for good UX

    try {
      // 1. Add comment to subcollection
      await addDoc(collection(db, 'confessions', confession.id, 'comments'), {
        authorName: myIdentity,
        text,
        timestamp: Date.now(),
      });
      // 2. Increment commentCount on parent document
      await updateDoc(doc(db, 'confessions', confession.id), {
        commentCount: increment(1)
      });
    } catch (e) {
      console.warn("Failed to post comment", e);
    }
  };

  const handleReact = (key) => {
    const isActive = activeReaction === key;
    setReactions((prev) => {
      const updated = { ...prev };
      if (isActive) {
        updated[key] = Math.max(0, updated[key] - 1);
        reactToConfession(confession.id, key, true); // remove reaction
      } else {
        if (activeReaction) {
          updated[activeReaction] = Math.max(0, updated[activeReaction] - 1);
          reactToConfession(confession.id, activeReaction, true); // remove old
        }
        updated[key] = (updated[key] || 0) + 1;
        reactToConfession(confession.id, key, false); // add new
      }
      return updated;
    });
    setActiveReaction(isActive ? null : key);
  };

  const renderHeader = () => (
    <View>
      {/* Confession at top */}
      <View style={styles.confessionBox}>
        <View style={styles.confessionHeader}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.authorName}>{confession.authorName}</Text>
            <Text style={styles.timestamp}>{timeAgo(confession.timestamp)}</Text>
          </View>
          <TagChip tag={confession.tag} />
        </View>
        <Text style={styles.confessionText}>{confession.text}</Text>
        <View style={styles.divider} />
        <ReactionBar reactions={reactions} onReact={handleReact} activeReaction={activeReaction} />
      </View>

      {/* Comments heading */}
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>💬 Comments</Text>
        <Text style={styles.commentsCount}>{comments.length}</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyText}>Be the first to comment...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Back header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Confession</Text>
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => Alert.alert('🚨 Report', 'Report this confession?', [
            { text: 'Yes, Report', onPress: () => Alert.alert('✅ Reported') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        >
          <Ionicons name="flag-outline" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Comment Input */}
        <View style={styles.inputBar}>
          <View style={styles.inputAvatar}>
            <Text style={{ fontSize: 12 }}>👤</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add an anonymous comment..."
            placeholderTextColor={COLORS.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={200}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={18} color={commentText.trim() ? COLORS.purple : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  reportBtn: {
    padding: 8,
  },
  kav: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  confessionBox: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    margin: 16,
    padding: 16,
  },
  confessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  confessionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.separator,
    marginBottom: 12,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  commentsTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  commentsCount: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
  },
});

export default CommentsScreen;
