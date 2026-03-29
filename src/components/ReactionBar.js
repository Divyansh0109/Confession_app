import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const REACTIONS = [
  { key: 'Love', emoji: '❤️', activeColor: '#EF4444' },
  { key: 'Funny', emoji: '😂', activeColor: '#F59E0B' },
  { key: 'Dead', emoji: '💀', activeColor: '#8B5CF6' },
  { key: 'Shocked', emoji: '🤯', activeColor: '#3B82F6' },
];

const ReactionButton = ({ reaction, count, onPress, active }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.5,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 8,
      }),
    ]).start();
    onPress(reaction.key);
  };

  return (
    <Pressable onPress={handlePress} style={styles.reactionBtn}>
      <Animated.View style={[styles.reactionInner, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>{reaction.emoji}</Text>
      </Animated.View>
      <Text style={[styles.count, active && { color: reaction.activeColor }]}>
        {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </Text>
    </Pressable>
  );
};

const ReactionBar = ({ reactions, onReact, activeReaction }) => {
  return (
    <View style={styles.bar}>
      {REACTIONS.map((r) => (
        <ReactionButton
          key={r.key}
          reaction={r}
          count={reactions[r.key] || 0}
          onPress={onReact}
          active={activeReaction === r.key}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 4,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reactionInner: {
    // wrapper for animation
  },
  emoji: {
    fontSize: 14,
  },
  count: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});

export default ReactionBar;
