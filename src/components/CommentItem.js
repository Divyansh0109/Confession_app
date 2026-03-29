import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { timeAgo } from '../utils/timeAgo';

const CommentItem = ({ comment }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>💬</Text>
      </View>
      <View style={styles.bubble}>
        <View style={styles.topRow}>
          <Text style={styles.authorName}>{comment.authorName}</Text>
          <Text style={styles.timestamp}>{timeAgo(comment.timestamp)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    color: COLORS.textAccent,
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CommentItem;
