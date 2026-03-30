/**
 * AdminLoginScreen.js
 *
 * Hidden admin login — reached only via secret 7-tap gesture.
 * PIN is hardcoded (change ADMIN_PIN to whatever you want).
 *
 * Flow:
 *   correct PIN → login() → navigate to AdminPanel
 *   wrong PIN   → show "Something went wrong"
 *   back press  → go back silently
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAdmin } from '../context/AdminContext';
import { COLORS } from '../constants/theme';

// ─── Change this to your secret PIN ───────────────────────
const ADMIN_PIN = '1234';
// ──────────────────────────────────────────────────────────

const AdminLoginScreen = ({ navigation }) => {
  const { login } = useAdmin();

  const [pin, setPin]         = useState('');
  const [error, setError]     = useState('');
  const [secure, setSecure]   = useState(true);

  // shake animation on wrong PIN
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      setError('');
      setPin('');
      login();
      navigation.replace('AdminPanel');
    } else {
      shake();
      setError('Something went wrong.');
      setPin('');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Back button — blends into header, no label */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="chevron-back" size={22} color={COLORS.textMuted} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.center}>

          {/* Lock icon */}
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            style={styles.iconWrap}
          >
            <Ionicons name="lock-closed" size={28} color="#fff" />
          </LinearGradient>

          <Text style={styles.title}>Access Required</Text>
          <Text style={styles.subtitle}>Enter your credentials to continue</Text>

          {/* PIN input */}
          <Animated.View
            style={[styles.inputWrap, { transform: [{ translateX: shakeAnim }] }]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter PIN"
              placeholderTextColor={COLORS.textMuted}
              value={pin}
              onChangeText={(t) => { setPin(t); setError(''); }}
              secureTextEntry={secure}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setSecure((s) => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Error */}
          {!!error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminLoginScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: { flex: 1 },
  backBtn: {
    padding: 16,
    alignSelf: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 32,
    textAlign: 'center',
  },
  inputWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    letterSpacing: 2,
  },
  eyeBtn: {
    padding: 4,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 14,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
