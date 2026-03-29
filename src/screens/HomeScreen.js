import React, { useState, useCallback, useEffect } from 'react';
import {
  View, FlatList, StyleSheet, Text, ScrollView,
  TouchableOpacity, RefreshControl, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, TAGS, TAG_COLORS } from '../constants/theme';
import ConfessionCard from '../components/ConfessionCard';
import FAB from '../components/FAB';
import ReportModal from '../components/ReportModal';
import ShareModal from '../components/ShareModal';
import ProfileModal from '../components/ProfileModal';
import { useConfessions } from '../context/ConfessionsContext';
import { getSavedAnonName } from '../components/ProfileModal';
import { getReportCounts } from '../utils/ModerationService';

const AUTO_HIDE_THRESHOLD = 5;

const ALL_TAGS = ['All', ...TAGS];
const BATCH_SIZE = 10;

const HomeScreen = ({ navigation }) => {
  const { confessions, loading: isFetchingDB } = useConfessions();
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [refreshing, setRefreshing]         = useState(false);
  const [selectedTag, setSelectedTag]       = useState('All');
  const [loading, setLoading]               = useState(false);
  const [anonName, setAnonName]             = useState('');
  const [hiddenPostIds, setHiddenPostIds]   = useState(new Set()); // auto-hidden

  // modal states
  const [reportModal, setReportModal]   = useState({ visible: false, postId: null });
  const [shareModal, setShareModal]     = useState({ visible: false, confession: null });
  const [profileModal, setProfileModal] = useState(false);

  // load saved custom name + existing report counts on mount
  useEffect(() => {
    getSavedAnonName().then((name) => { if (name) setAnonName(name); });
    // Pre-hide posts that already exceeded threshold
    getReportCounts().then((counts) => {
      const alreadyHidden = new Set(
        Object.entries(counts)
          .filter(([, n]) => n >= AUTO_HIDE_THRESHOLD)
          .map(([id]) => id)
      );
      if (alreadyHidden.size) setHiddenPostIds(alreadyHidden);
    });
  }, []);

  // Called by ReportModal after each submission
  const handleReported = (postId, count) => {
    if (count >= AUTO_HIDE_THRESHOLD) {
      setHiddenPostIds((prev) => new Set([...prev, postId]));
    }
  };

  const visibleConfessions = confessions.filter((c) => !hiddenPostIds.has(c.id));

  const filteredData = selectedTag === 'All'
    ? visibleConfessions
    : visibleConfessions.filter((c) => c.tag === selectedTag);

  const displayedData = filteredData.slice(0, displayedCount);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setDisplayedCount(BATCH_SIZE);
      setRefreshing(false);
    }, 800);
  }, []);

  const onEndReached = () => {
    if (loading || displayedCount >= filteredData.length) return;
    setLoading(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + BATCH_SIZE, filteredData.length));
      setLoading(false);
    }, 500);
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <LinearGradient
        colors={['rgba(168,85,247,0.12)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>Confessions 🤫</Text>
            <Text style={styles.appSubtitle}>Anonymous · Safe · Real</Text>
          </View>
          {/* Profile / identity button */}
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => setProfileModal(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              style={styles.profileGradient}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </LinearGradient>
            {anonName ? (
              <Text style={styles.profileName} numberOfLines={1}>{anonName}</Text>
            ) : (
              <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        {ALL_TAGS.map((tag) => {
          const isActive = selectedTag === tag;
          const tagColor = TAG_COLORS[tag];
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => { setSelectedTag(tag); setDisplayedCount(BATCH_SIZE); }}
              activeOpacity={0.7}
            >
              {isActive ? (
                <LinearGradient
                  colors={tagColor ? [tagColor.bg, tagColor.border] : ['rgba(168,85,247,0.3)', 'rgba(168,85,247,0.2)']}
                  style={[styles.filterChipActive, tagColor && { borderColor: tagColor.border }]}
                >
                  <Text style={[styles.filterTextActive, tagColor && { color: tagColor.text }]}>
                    {tag}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.filterChip}>
                  <Text style={styles.filterText}>{tag}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Posts count */}
      <Text style={styles.postsCount}>{filteredData.length} confessions</Text>
    </View>
  );

  const renderFooter = () => loading ? (
    <View style={styles.loadingFooter}>
      <Text style={styles.loadingText}>Loading more...</Text>
    </View>
  ) : null;

  const renderEmpty = () => {
    if (isFetchingDB) {
      return (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={[styles.emptyText, { marginTop: 14 }]}>Loading confessions...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🌙</Text>
        <Text style={styles.emptyTitle}>No confessions here yet</Text>
        <Text style={styles.emptyText}>Be the first to confess anonymously</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <FlatList
        data={displayedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConfessionCard
            confession={item}
            onPress={() => navigation.navigate('Comments', { confession: item })}
            onComment={() => navigation.navigate('Comments', { confession: item })}
            onShare={() => setShareModal({ visible: true, confession: item })}
            onReport={() => setReportModal({ visible: true, postId: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.purple}
            colors={[COLORS.purple]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <FAB onPress={() => navigation.navigate('Post')} />

      {/* ── Modals ─────────────────────────────────────────── */}
      <ReportModal
        visible={reportModal.visible}
        postId={reportModal.postId}
        onClose={() => setReportModal({ visible: false, postId: null })}
        onReported={handleReported}
      />
      <ShareModal
        visible={shareModal.visible}
        confession={shareModal.confession}
        onClose={() => setShareModal({ visible: false, confession: null })}
      />
      <ProfileModal
        visible={profileModal}
        onClose={() => setProfileModal(false)}
        onNameSaved={(name) => setAnonName(name)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 160,
  },
  headerGradient: {
    paddingBottom: 4,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  // profile button in header
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingRight: 10,
    paddingLeft: 2,
    paddingVertical: 2,
  },
  profileGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: { fontSize: 14 },
  profileName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 90,
  },
  tagRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  filterText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purple,
  },
  postsCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    fontWeight: '500',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});

export default HomeScreen;
