import React, { useState } from 'react';
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../constants/theme';
import ConfessionCard from '../components/ConfessionCard';
import { useConfessions } from '../context/ConfessionsContext';

const getTotalReactions = (c) => Object.values(c.reactions || {}).reduce((s, count) => s + count, 0);

const TrendingScreen = ({ navigation }) => {
  const { confessions } = useConfessions();
  const [activeTab, setActiveTab] = useState('top');

  const sorted = [...confessions].sort(
    (a, b) => getTotalReactions(b) - getTotalReactions(a)
  );

  const todayStart = Date.now() - 24 * 60 * 60 * 1000;
  const todayTrending = sorted.filter((c) => c.timestamp >= todayStart);
  const topAll = sorted.slice(0, 10);
  const data = activeTab === 'top' ? topAll : todayTrending;

  const handleReport = () =>
    Alert.alert('🚨 Report', 'Report this confession?', [
      { text: 'Yes, Report', onPress: () => Alert.alert('✅ Reported') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const renderItem = ({ item, index }) => (
    <View>
      {index === 0 && activeTab === 'top' && (
        <LinearGradient
          colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.crownBanner}
        >
          <Text style={styles.crownText}>👑 Most loved confession</Text>
        </LinearGradient>
      )}
      <View style={styles.rankRow}>
        {index > 0 && (
          <Text style={[styles.rankNumber, index < 3 && { color: COLORS.purple }]}>
            #{index + 1}
          </Text>
        )}
        <View style={{ flex: 1 }}>
          <ConfessionCard
            confession={item}
            onPress={() => navigation.navigate('Comments', { confession: item })}
            onComment={() => navigation.navigate('Comments', { confession: item })}
            onShare={() => Alert.alert('📤', 'Copied link!')}
            onReport={handleReport}
          />
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📅</Text>
      <Text style={styles.emptyTitle}>No trending posts today</Text>
      <Text style={styles.emptyText}>Come back later or be the first to post!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <LinearGradient
        colors={['rgba(239,68,68,0.12)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trending 🔥</Text>
          <Text style={styles.subtitle}>Most reacted confessions</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: 'top', label: '🔥 Top All Time' },
          { key: 'today', label: '📅 Today' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingBottom: 4 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  tabText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.purple },
  crownBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: -4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  crownText: { color: COLORS.purple, fontSize: 13, fontWeight: '700' },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 6 },
  rankNumber: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '800',
    width: 34,
    textAlign: 'center',
  },
  listContent: { paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});

export default TrendingScreen;
