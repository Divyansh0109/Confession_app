import React, { useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { submitReport as submitReportToService } from '../utils/ModerationService';

const REPORT_REASONS = [
  { id: 'spam',      label: 'Spam',               icon: 'alert-circle-outline',    color: '#F59E0B' },
  { id: 'abuse',     label: 'Abuse / Harassment',  icon: 'hand-left-outline',       color: '#EF4444' },
  { id: 'explicit',  label: 'Explicit Content',    icon: 'eye-off-outline',         color: '#EC4899' },
  { id: 'hate',      label: 'Hate Speech',         icon: 'ban-outline',             color: '#8B5CF6' },
  { id: 'other',     label: 'Other',               icon: 'ellipsis-horizontal',     color: '#6B7280' },
];



// ── individual reason row ──────────────────────────────────────
const ReasonRow = ({ item, selected, onSelect }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }),
    ]).start();
    onSelect(item.id);
  };

  const isSelected = selected === item.id;

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.reasonRow,
          { transform: [{ scale: scaleAnim }] },
          isSelected && { backgroundColor: `${item.color}18`, borderColor: `${item.color}55` },
        ]}
      >
        <View style={[styles.reasonIcon, { backgroundColor: `${item.color}22` }]}>
          <Ionicons name={item.icon} size={16} color={item.color} />
        </View>
        <Text style={[styles.reasonLabel, isSelected && { color: item.color }]}>{item.label}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={18} color={item.color} style={{ marginLeft: 'auto' }} />
        )}
      </Animated.View>
    </Pressable>
  );
};

// ── main modal ─────────────────────────────────────────────────
const ReportModal = ({ visible, postId, onClose, onReported }) => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setSelected(null);
      setSubmitted(false);
      Animated.parallel([
        Animated.spring(slideAnim,  { toValue: 0,   useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim,{ toValue: 1,   useNativeDriver: true, duration: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim,  { toValue: 300, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim,{ toValue: 0,   useNativeDriver: true, duration: 150 }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!selected) return;
    const count = await submitReportToService(postId, selected);
    setSubmitted(true);
    onReported?.(postId, count);  // notify parent about new count
    setTimeout(onClose, 1400);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </Pressable>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Report Submitted</Text>
            <Text style={styles.successSub}>Thanks for keeping the community safe.</Text>
          </View>
        ) : (
          <>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Report Confession</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={22} color="#374151" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sheetSub}>Why are you reporting this?</Text>

            {/* Reasons */}
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
              {REPORT_REASONS.map((r) => (
                <ReasonRow key={r.id} item={r} selected={selected} onSelect={setSelected} />
              ))}
            </ScrollView>

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selected}
              activeOpacity={0.8}
              style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
            >
              <Ionicons name="flag" size={16} color={selected ? '#fff' : '#4B5563'} />
              <Text style={[styles.submitText, !selected && { color: '#4B5563' }]}>Submit Report</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  sheet: {
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
    minHeight: 360,
  },
  handle: {
    width: 38,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sheetSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 8,
  },
  reasonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 14,
  },
  submitBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  successEmoji: { fontSize: 48 },
  successTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  successSub: { color: COLORS.textMuted, fontSize: 14 },
});

export default ReportModal;
