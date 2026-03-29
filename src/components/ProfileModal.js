import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import { isValidName } from '../utils/profanityFilter';

const STORAGE_KEY = '@custom_anon_name';

// Suggested names to inspire the user
const SUGGESTED_NAMES = [
  'Silent Wolf', 'Hidden Soul', 'Lost Mind', 'Phantom Echo',
  'Midnight Ghost', 'Broken Star', 'Secret Flame', 'Wandering Moon',
  'Hollow Sky', 'Cursed Angel', 'Restless Storm', 'Fading Rain',
  'Sleepless Dream', 'Drifting Shadow', 'Burning Tide',
];

const getRandomSuggestions = () => {
  const shuffled = [...SUGGESTED_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
};

// ── main component ─────────────────────────────────────────────
const ProfileModal = ({ visible, onClose, onNameSaved }) => {
  const [inputName, setInputName]       = useState('');
  const [savedName, setSavedName]       = useState('');
  const [error, setError]               = useState('');
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState(false);
  const [suggestions, setSuggestions]   = useState([]);
  const slideAnim  = useRef(new Animated.Value(400)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  // Load saved name on open
  useEffect(() => {
    if (visible) {
      loadName();
      setSuggestions(getRandomSuggestions());
      setError('');
      setSuccess(false);
      Animated.parallel([
        Animated.spring(slideAnim,   { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, useNativeDriver: true, duration: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim,   { toValue: 400, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 0,   useNativeDriver: true, duration: 150 }),
      ]).start();
    }
  }, [visible]);

  const loadName = async () => {
    try {
      const name = await AsyncStorage.getItem(STORAGE_KEY);
      if (name) { setSavedName(name); setInputName(name); }
    } catch {}
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  useNativeDriver: true, duration: 60 }),
      Animated.timing(shakeAnim, { toValue: -8, useNativeDriver: true, duration: 60 }),
      Animated.timing(shakeAnim, { toValue: 6,  useNativeDriver: true, duration: 60 }),
      Animated.timing(shakeAnim, { toValue: -6, useNativeDriver: true, duration: 60 }),
      Animated.timing(shakeAnim, { toValue: 0,  useNativeDriver: true, duration: 60 }),
    ]).start();
  };

  const handleSave = async () => {
    const trimmed = inputName.trim();
    if (!trimmed) { setError('Please enter a name.'); shake(); return; }
    if (!isValidName(trimmed)) {
      setError('Name not allowed. Please choose a different one.');
      shake();
      return;
    }
    try {
      setSaving(true);
      await AsyncStorage.setItem(STORAGE_KEY, trimmed);
      setSavedName(trimmed);
      setSuccess(true);
      setError('');
      onNameSaved?.(trimmed);
      setTimeout(onClose, 1200);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestion = (name) => {
    setInputName(name);
    setError('');
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]} />
      </Pressable>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Your Anonymous Identity</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={22} color="#374151" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sheetSub}>
          {savedName ? `Current: "${savedName}"` : 'Set your anonymous display name'}
        </Text>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>🎭</Text>
            <Text style={styles.successTitle}>Name Saved!</Text>
            <Text style={styles.successSub}>You'll post as "{inputName.trim()}"</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Input */}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View style={[styles.inputBox, error ? styles.inputBoxError : {}]}>
                <Ionicons name="person-outline" size={16} color={error ? '#EF4444' : COLORS.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Silent Wolf"
                  placeholderTextColor="#4B5563"
                  value={inputName}
                  onChangeText={(t) => { setInputName(t); setError(''); }}
                  maxLength={30}
                  autoCorrect={false}
                />
                {inputName.length > 0 && (
                  <TouchableOpacity onPress={() => { setInputName(''); setError(''); }}>
                    <Ionicons name="close-circle" size={16} color="#4B5563" />
                  </TouchableOpacity>
                )}
              </View>
              {error ? (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={13} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </Animated.View>

            {/* Rules hint */}
            <View style={styles.rulesBox}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#10B981" />
              <Text style={styles.rulesText}>No real names, no offensive words (English, Hindi, Hinglish)</Text>
            </View>

            {/* Suggestions */}
            <Text style={styles.suggestLabel}>✨ Suggestions</Text>
            <View style={styles.suggestRow}>
              {suggestions.map((name) => (
                <TouchableOpacity
                  key={name}
                  onPress={() => handleSuggestion(name)}
                  style={[
                    styles.suggestChip,
                    inputName === name && styles.suggestChipActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestText, inputName === name && styles.suggestTextActive]}>
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !inputName.trim()}
              activeOpacity={0.85}
              style={[styles.saveBtn, (!inputName.trim() || saving) && styles.saveBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Save Name</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>
    </Modal>
  );
};

// helper to read saved name from anywhere
export const getSavedAnonName = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject },
  overlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    maxHeight: '90%',
  },
  handle: {
    width: 38, height: 4,
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
  sheetTitle:  { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sheetSub:    { color: COLORS.textMuted, fontSize: 13, marginBottom: 18 },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputBoxError: { borderColor: '#EF444466' },
  input: {
    flex: 1,
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: { color: '#EF4444', fontSize: 12 },

  rulesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  rulesText: { color: '#10B981', fontSize: 12, flex: 1, lineHeight: 18 },

  suggestLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  suggestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  suggestChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  suggestChipActive: {
    backgroundColor: 'rgba(168,85,247,0.2)',
    borderColor: 'rgba(168,85,247,0.5)',
  },
  suggestText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  suggestTextActive: { color: COLORS.purple },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    paddingVertical: 15,
  },
  saveBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  successBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  successEmoji: { fontSize: 48 },
  successTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  successSub:   { color: COLORS.textMuted, fontSize: 14 },
});

export default ProfileModal;
