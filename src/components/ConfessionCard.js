import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';
import { timeAgo } from '../utils/timeAgo';
import TagChip from './TagChip';
import ReactionBar from './ReactionBar';
import { useConfessions } from '../context/ConfessionsContext';

const AVATAR_GRADIENTS = [
  ['#7C3AED', '#A855F7'],
  ['#2563EB', '#60A5FA'],
  ['#059669', '#34D399'],
  ['#D97706', '#FCD34D'],
  ['#DC2626', '#F87171'],
  ['#DB2777', '#F472B6'],
];

const getGradient = (name) => {
  if (!name) return AVATAR_GRADIENTS[0];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

const ConfessionCard = ({ confession, onPress, onComment, onShare, onReport }) => {
  const { reactToConfession } = useConfessions();
  const [reactions, setReactions] = useState({ ...confession.reactions });
  const [activeReaction, setActiveReaction] = useState(null);
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Sync with Firebase real-time updates
  React.useEffect(() => {
    setReactions({ ...confession.reactions });
  }, [confession.reactions]);

  const handlePressIn = () =>
    Animated.spring(pressAnim, {
      toValue: 0.975, useNativeDriver: true, tension: 300, friction: 12,
    }).start();

  const handlePressOut = () =>
    Animated.spring(pressAnim, {
      toValue: 1, useNativeDriver: true, tension: 300, friction: 12,
    }).start();

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

  const gradient = getGradient(confession.authorName);

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.card, { transform: [{ scale: pressAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorRow}>
            <LinearGradient colors={gradient} style={styles.avatar}>
              <Text style={styles.avatarInitials}>{getInitials(confession.authorName)}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.authorName}>{confession.authorName || 'Anonymous'}</Text>
              <Text style={styles.timestamp}>{timeAgo(confession.timestamp)}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TagChip tag={confession.tag} />
            <TouchableOpacity onPress={onReport} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="ellipsis-horizontal" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Text */}
        <Text style={styles.text}>{confession.text}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Reactions */}
        <ReactionBar reactions={reactions} onReact={handleReact} activeReaction={activeReaction} />

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onComment} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={14} color="#4B5563" />
            <Text style={styles.actionText}>{confession.commentCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onShare} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={14} color="#4B5563" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161616',  // slightly above pure black — no weird border needed
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1F1F1F',       // barely visible, blends with black BG
    marginHorizontal: 14,
    marginVertical: 6,
    padding: 16,
    // NO elevation, NO shadowColor — removes the purple Android glow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  authorName: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    color: '#4B5563',
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  text: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 14,
    letterSpacing: 0.1,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F1F',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ConfessionCard;
