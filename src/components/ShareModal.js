import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Pressable, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { COLORS } from '../constants/theme';

// Aesthetic card that gets captured as an image
const ShareCardContent = React.forwardRef(({ confession }, ref) => (
  <ViewShot
    ref={ref}
    options={{ format: 'jpg', quality: 0.96 }}
    style={styles.cardShot}
  >
    <LinearGradient
      colors={['#0D0D0F', '#1A0A2E', '#0D0D0F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.shareCard}
    >
      {/* accent blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* quote icon */}
      <Text style={styles.quoteIcon}>❝</Text>

      {/* confession text */}
      <Text style={styles.cardText}>{confession?.text}</Text>

      {/* author + tag row */}
      <View style={styles.cardMeta}>
        <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.cardAvatar}>
          <Text style={styles.cardAvatarText}>👤</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardAuthor}>{confession?.authorName || 'Anonymous'}</Text>
          {confession?.tag ? (
            <Text style={styles.cardTag}>#{confession.tag}</Text>
          ) : null}
        </View>
        <View style={styles.anonBadge}>
          <Ionicons name="shield-checkmark" size={10} color="#10B981" />
          <Text style={styles.anonText}>Anonymous</Text>
        </View>
      </View>

      {/* branding footer */}
      <View style={styles.footer}>
        <Text style={styles.footerBrand}>Confessions 🤫</Text>
        <Text style={styles.footerSub}>Anonymous · Safe · Real</Text>
      </View>
    </LinearGradient>
  </ViewShot>
));

// ── main modal ─────────────────────────────────────────────────
const ShareModal = ({ visible, confession, onClose }) => {
  const viewShotRef = useRef(null);
  const [sharing, setSharing] = React.useState(false);

  const handleShare = async () => {
    if (!viewShotRef.current) return;
    try {
      setSharing(true);
      const uri = await viewShotRef.current.capture();
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing not available', 'Your device does not support sharing.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share this confession',
        UTI: 'public.jpeg',
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share. Try again.');
    } finally {
      setSharing(false);
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.overlay} />
      </Pressable>

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Confession</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={22} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Preview of your shareable card</Text>

        {/* Card preview */}
        <ShareCardContent ref={viewShotRef} confession={confession} />

        {/* Share button */}
        <TouchableOpacity
          onPress={handleShare}
          disabled={sharing}
          activeOpacity={0.85}
          style={styles.shareBtn}
        >
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareBtnInner}
          >
            {sharing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="share-social" size={18} color="#fff" />
                <Text style={styles.shareBtnText}>Share to Apps</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.hint}>Share to WhatsApp, Instagram, and more</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.82)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 16,
  },
  // ── shareable card ──────────────────────────────────────────
  cardShot: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareCard: {
    borderRadius: 20,
    padding: 28,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 200,
  },
  blob1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(168,85,247,0.18)',
  },
  blob2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(236,72,153,0.12)',
  },
  quoteIcon: {
    fontSize: 40,
    color: 'rgba(168,85,247,0.4)',
    lineHeight: 44,
    marginBottom: 4,
  },
  cardText: {
    color: '#F0F0F0',
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '500',
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  cardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: { fontSize: 16 },
  cardAuthor: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
  },
  cardTag: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  anonText: { color: '#10B981', fontSize: 10, fontWeight: '700' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
    alignItems: 'center',
  },
  footerBrand: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  footerSub: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.4,
  },
  // ── share button ────────────────────────────────────────────
  shareBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 18,
  },
  shareBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ShareModal;
