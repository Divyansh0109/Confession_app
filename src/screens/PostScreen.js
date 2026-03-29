import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, TAGS, TAG_COLORS } from '../constants/theme';
import { getRandomIdentity } from '../utils/identity';
import { useConfessions } from '../context/ConfessionsContext';
import { getSavedAnonName } from '../components/ProfileModal';
import { canPost as checkCanPost } from '../utils/ModerationService';

const MAX_CHARS = 300;

const TAG_EMOJIS = {
  Love: '❤️', Crush: '🔥', Rant: '😤', Secrets: '🤫', College: '🏫', Funny: '😂',
};

// Warning banner config per type
const WARNING_CONFIG = {
  profanity: { icon: 'shield-outline',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'  },
  cooldown:  { icon: 'time-outline',         color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  duplicate: { icon: 'copy-outline',         color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
  default:   { icon: 'warning-outline',      color: '#6B7280', bg: 'rgba(107,114,128,0.12)',border: 'rgba(107,114,128,0.3)'},
};

const PostScreen = ({ navigation }) => {
  const { addConfession } = useConfessions();
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [posting, setPosting] = useState(false);
  const [myIdentity, setMyIdentity] = useState(getRandomIdentity());
  const [warning, setWarning] = useState(null); // { message, type }
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const warningAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getSavedAnonName().then((saved) => {
      if (saved) setMyIdentity(saved);
    });
  }, []);

  const showWarning = (message, type = 'default') => {
    setWarning({ message, type });
    warningAnim.setValue(0);
    Animated.spring(warningAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    // Auto-dismiss after 4s
    setTimeout(() => dismissWarning(), 4000);
  };

  const dismissWarning = () => {
    Animated.timing(warningAnim, { toValue: 0, useNativeDriver: true, duration: 200 }).start(
      () => setWarning(null)
    );
  };

  const charsLeft = MAX_CHARS - text.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 30 && !isOverLimit;
  const canSubmit = text.trim().length >= 5 && !isOverLimit;

  const handlePost = async () => {
    if (!canSubmit || posting) return;
    setPosting(true);
    setWarning(null);

    Animated.sequence([
      Animated.spring(buttonAnim, { toValue: 0.95, useNativeDriver: true, tension: 300 }),
      Animated.spring(buttonAnim, { toValue: 1,    useNativeDriver: true, tension: 300 }),
    ]).start();

    const result = await checkCanPost(text.trim());

    if (!result.allowed) {
      setPosting(false);
      showWarning(result.reason, result.type);
      return;
    }

    await addConfession(text.trim(), selectedTag);
    setPosting(false);
    setText('');
    setSelectedTag(null);
    safeGoBack();
  };

  const safeGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };

  const counterColor = isOverLimit
    ? '#EF4444'
    : isNearLimit
    ? '#F97316'
    : charsLeft <= 100
    ? COLORS.textSecondary
    : COLORS.textMuted;

  const warnCfg = warning ? (WARNING_CONFIG[warning.type] || WARNING_CONFIG.default) : null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={safeGoBack} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Confession</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── Inline Warning Banner ────────────────────────── */}
        {warning && warnCfg && (
          <Animated.View
            style={[
              styles.warningBanner,
              {
                backgroundColor: warnCfg.bg,
                borderColor: warnCfg.border,
                transform: [{ scale: warningAnim }],
                opacity: warningAnim,
              },
            ]}
          >
            <Ionicons name={warnCfg.icon} size={16} color={warnCfg.color} />
            <Text style={[styles.warningText, { color: warnCfg.color }]}>{warning.message}</Text>
            <TouchableOpacity onPress={dismissWarning} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={14} color={warnCfg.color} />
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Row */}
          <View style={styles.identityRow}>
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>👤</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.identityName}>{myIdentity}</Text>
              <Text style={styles.identityLabel}>Posting anonymously</Text>
            </View>
            <View style={styles.anonBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#10B981" />
              <Text style={styles.anonBadgeText}>Anonymous</Text>
            </View>
          </View>

          {/* Text Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind? Confess anonymously... 🤫"
              placeholderTextColor="#4B5563"
              multiline
              autoFocus
              value={text}
              onChangeText={setText}
              maxLength={MAX_CHARS + 10}
              textAlignVertical="top"
            />
          </View>

          {/* Counter Row */}
          <View style={styles.counterRow}>
            <Text style={[styles.counter, { color: counterColor }]}>
              {isOverLimit
                ? `${Math.abs(charsLeft)} over limit!`
                : `${charsLeft} left`}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, ((MAX_CHARS - charsLeft) / MAX_CHARS) * 100)}%`,
                    backgroundColor: isOverLimit
                      ? '#EF4444'
                      : isNearLimit
                      ? '#F97316'
                      : COLORS.purple,
                  },
                ]}
              />
            </View>
          </View>

          {/* Tags */}
          <Text style={styles.tagLabel}>Pick a tag</Text>
          <View style={styles.tagGrid}>
            {TAGS.map((tag) => {
              const isActive = selectedTag === tag;
              const colors = TAG_COLORS[tag];
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(isActive ? null : tag)}
                  activeOpacity={0.7}
                  style={[
                    styles.tagOption,
                    isActive && {
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={styles.tagEmoji}>{TAG_EMOJIS[tag]}</Text>
                  <Text style={[styles.tagText, isActive && { color: colors.text }]}>
                    {tag}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={14} color={colors.text} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tip */}
          <View style={styles.tip}>
            <Ionicons name="eye-off-outline" size={13} color="#10B981" />
            <Text style={styles.tipText}>
              No one will ever know it's you. Your identity stays hidden forever.
            </Text>
          </View>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.bottomBar}>
          <Animated.View style={[{ flex: 1 }, { transform: [{ scale: buttonAnim }] }]}>
            <TouchableOpacity
              onPress={handlePost}
              disabled={!canSubmit || posting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canSubmit ? ['#7C3AED', '#EC4899'] : ['#1F1F1F', '#1F1F1F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.postBtn}
              >
                {posting ? (
                  <Text style={styles.postBtnText}>Checking...</Text>
                ) : (
                  <>
                    <Ionicons name="send" size={17} color={canSubmit ? '#fff' : '#4B5563'} />
                    <Text style={[styles.postBtnText, !canSubmit && { color: '#4B5563' }]}>
                      Post Anonymously
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollContent: { padding: 20, paddingBottom: 8 },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 14,
    marginBottom: 18,
  },
  avatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18 },
  identityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  identityLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  anonBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 150,
    padding: 16,
    marginBottom: 10,
  },
  input: {
    color: '#F0F0F0',
    fontSize: 15,
    lineHeight: 23,
    minHeight: 120,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  counter: { fontSize: 12, fontWeight: '600', width: 80 },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: { height: 3, borderRadius: 2 },
  tagLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tagGrid: {
    gap: 8,
    marginBottom: 20,
  },
  tagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tagEmoji: { fontSize: 16 },
  tagText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  tipText: { color: '#10B981', fontSize: 12, flex: 1, lineHeight: 18 },
  bottomBar: {
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: 16,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});

export default PostScreen;
