/**
 * AdminPanelScreen.js
 *
 * Full admin control panel:
 *   - Lists ALL confessions (including auto-hidden ones)
 *   - Shows report count on every card
 *   - Delete button fires Firestore deleteDoc
 *   - Logout button resets admin state
 *
 * Only reachable after correct PIN via AdminLoginScreen.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';;
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import { useAdmin } from '../context/AdminContext';
import { COLORS } from '../constants/theme';
import { timeAgo } from '../utils/timeAgo';

const AdminPanelScreen = ({ navigation }) => {
  const { logout } = useAdmin();

  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Real-time listener (all posts, including reported ones) ──
  useEffect(() => {
    const q = query(collection(db, 'confessions'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setRefreshing(false);
    }, (err) => {
      console.warn('AdminPanel fetch error:', err);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = (postId, text) => {
    Alert.alert(
      'Delete Confession',
      `"${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(postId);
              await deleteDoc(doc(db, 'confessions', postId));
            } catch (e) {
              Alert.alert('Error', 'Could not delete this post.');
              console.warn(e);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Exit admin mode?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.popToTop();
        },
      },
    ]);
  };

  const renderPost = ({ item }) => {
    const reportCount = item.reportCount || 0;
    const isDeleting  = deletingId === item.id;
    const isHighFlag  = reportCount >= 3;

    return (
      <View style={[styles.card, isHighFlag && styles.cardFlagged]}>
        {/* Row: author + time */}
        <View style={styles.cardHeader}>
          <Text style={styles.authorName} numberOfLines={1}>
            {item.authorName || 'Anonymous'}
          </Text>
          <Text style={styles.timestamp}>{timeAgo(item.timestamp)}</Text>
        </View>

        {/* Confession text */}
        <Text style={styles.cardText} numberOfLines={4}>
          {item.text}
        </Text>

        {/* Footer row: tag, reports, delete */}
        <View style={styles.cardFooter}>

          {/* Tag badge */}
          {item.tag ? (
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          ) : null}

          {/* Report count badge */}
          <View style={[styles.reportBadge, isHighFlag && styles.reportBadgeDanger]}>
            <Ionicons
              name="flag"
              size={11}
              color={isHighFlag ? '#EF4444' : COLORS.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.reportText, isHighFlag && styles.reportTextDanger]}>
              {reportCount} {reportCount === 1 ? 'report' : 'reports'}
            </Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.text)}
            disabled={isDeleting}
            activeOpacity={0.75}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons name="trash-outline" size={15} color="#EF4444" />
            )}
            {!isDeleting && <Text style={styles.deleteBtnText}>Delete</Text>}
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        {posts.length} total {posts.length === 1 ? 'confession' : 'confessions'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ── Top Bar ── */}
      <LinearGradient
        colors={['rgba(239,68,68,0.15)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.panelTitle}>Admin Panel 🛡️</Text>
            <Text style={styles.panelSub}>Manage confessions</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── Stats strip ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>
            {posts.filter((p) => (p.reportCount || 0) >= 5).length}
          </Text>
          <Text style={styles.statLabel}>Auto-hidden</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F97316' }]}>
            {posts.filter((p) => (p.reportCount || 0) >= 3).length}
          </Text>
          <Text style={styles.statLabel}>Flagged</Text>
        </View>
      </View>

      {/* ── Post list ── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading posts…</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No confessions found.</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => setRefreshing(true)}
              tintColor={COLORS.purple}
              colors={[COLORS.purple]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminPanelScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingBottom: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  panelTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  panelSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  // ── List ──
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 14,
  },
  listHeader: {
    paddingVertical: 8,
  },
  listHeaderText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  // ── Card ──
  card: {
    backgroundColor: '#161616',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    padding: 14,
    marginBottom: 10,
  },
  cardFlagged: {
    borderColor: 'rgba(239,68,68,0.25)',
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  tagText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '600',
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reportBadgeDanger: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderColor: 'rgba(239,68,68,0.25)',
  },
  reportText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  reportTextDanger: {
    color: '#EF4444',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 72,
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  // ── States ──
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
