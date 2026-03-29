// ═══════════════════════════════════════════════════════════════
//  MODERATION SERVICE
//  Handles: device ID, cooldown, duplicate detection,
//           auto-hide on reports, post tracking
// ═══════════════════════════════════════════════════════════════
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkContent } from './profanityFilter';

// ── Storage keys ────────────────────────────────────────────────
const KEYS = {
  DEVICE_ID:    '@device_id',
  POST_LOG:     '@post_log',       // timestamps of past posts
  REPORTS:      '@confession_reports',
  REPORT_COUNTS:'@report_counts',  // { [postId]: number }
};

// ── Constants ───────────────────────────────────────────────────
const BASE_COOLDOWN_MS     = 60_000;   // 60 s between posts
const SPAM_COOLDOWN_MS     = 300_000;  // 5 min for spammers
const SPAM_THRESHOLD       = 3;        // posts in window = spam
const SPAM_WINDOW_MS       = 120_000;  // 2-min window to count spam
const DUPLICATE_WINDOW_MS  = 600_000;  // 10-min window for duplicate check
const AUTO_HIDE_THRESHOLD  = 5;        // reports before auto-hiding post

// ── Result object helper ─────────────────────────────────────────
const ok  = ()          => ({ allowed: true,  reason: null });
const err = (reason)    => ({ allowed: false, reason });

// ════════════════════════════════════════════════════════════════
//  1. DEVICE ID  – stable UUID per device, stored in AsyncStorage
// ════════════════════════════════════════════════════════════════
const generateUUID = () => {
  // Simple RFC4122 v4-alike UUID without crypto dependency
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getDeviceId = async () => {
  try {
    let id = await AsyncStorage.getItem(KEYS.DEVICE_ID);
    if (!id) {
      id = generateUUID();
      await AsyncStorage.setItem(KEYS.DEVICE_ID, id);
    }
    return id;
  } catch {
    return 'unknown-device';
  }
};

// ════════════════════════════════════════════════════════════════
//  2. POST LOG  – track recent post timestamps for cooldown & spam
// ════════════════════════════════════════════════════════════════
const getPostLog = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.POST_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const savePostLog = async (log) => {
  try {
    await AsyncStorage.setItem(KEYS.POST_LOG, JSON.stringify(log));
  } catch {}
};

const recordPost = async (text) => {
  const log = await getPostLog();
  log.push({ timestamp: Date.now(), textHash: simpleHash(text) });
  // Keep only last 50 entries
  await savePostLog(log.slice(-50));
};

// ════════════════════════════════════════════════════════════════
//  3. SIMPLE HASH  – to compare post content without storing text
// ════════════════════════════════════════════════════════════════
const simpleHash = (str = '') => {
  // Normalize whitespace + lowercase so "Hello World" === "hello  world"
  const s = str.toLowerCase().replace(/\s+/g, ' ').trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0; // 32-bit int
  }
  return hash;
};

// ════════════════════════════════════════════════════════════════
//  4. COOLDOWN CHECK
// ════════════════════════════════════════════════════════════════
/**
 * Returns remaining cooldown in seconds, or 0 if free to post.
 * Spam users (≥ SPAM_THRESHOLD posts in SPAM_WINDOW_MS) get a 5-min cooldown.
 */
const checkCooldown = async () => {
  const log = await getPostLog();
  const now = Date.now();

  // How many posts in the last spam window?
  const recentCount = log.filter((e) => now - e.timestamp < SPAM_WINDOW_MS).length;
  const isSpammer   = recentCount >= SPAM_THRESHOLD;
  const cooldown    = isSpammer ? SPAM_COOLDOWN_MS : BASE_COOLDOWN_MS;

  // Find the most recent post
  const lastPost = log.length ? log[log.length - 1].timestamp : 0;
  const elapsed  = now - lastPost;
  const remaining = Math.max(0, cooldown - elapsed);

  return { remaining, isSpammer, cooldownSec: Math.ceil(remaining / 1000) };
};

// ════════════════════════════════════════════════════════════════
//  5. DUPLICATE DETECTION
// ════════════════════════════════════════════════════════════════
const checkDuplicate = async (text) => {
  const log  = await getPostLog();
  const now  = Date.now();
  const hash = simpleHash(text);

  const isDuplicate = log.some(
    (e) => e.textHash === hash && now - e.timestamp < DUPLICATE_WINDOW_MS
  );
  return isDuplicate;
};

// ════════════════════════════════════════════════════════════════
//  6. REPORT COUNTING & AUTO-HIDE
// ════════════════════════════════════════════════════════════════

/**
 * Save a new report and return updated count for that postId.
 */
export const submitReport = async (postId, reason) => {
  try {
    // Save full report log (existing behaviour)
    const raw      = await AsyncStorage.getItem(KEYS.REPORTS);
    const reports  = raw ? JSON.parse(raw) : [];
    reports.push({ postId, reason, timestamp: Date.now() });
    await AsyncStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));

    // Increment per-post counter
    const countsRaw = await AsyncStorage.getItem(KEYS.REPORT_COUNTS);
    const counts    = countsRaw ? JSON.parse(countsRaw) : {};
    counts[postId]  = (counts[postId] || 0) + 1;
    await AsyncStorage.setItem(KEYS.REPORT_COUNTS, JSON.stringify(counts));

    return counts[postId];
  } catch (e) {
    console.warn('submitReport error:', e);
    return 0;
  }
};

/**
 * Returns true if the post should be hidden based on report count.
 */
export const shouldHidePost = async (postId) => {
  try {
    const raw    = await AsyncStorage.getItem(KEYS.REPORT_COUNTS);
    const counts = raw ? JSON.parse(raw) : {};
    return (counts[postId] || 0) >= AUTO_HIDE_THRESHOLD;
  } catch {
    return false;
  }
};

/**
 * Get all report counts as an object { [postId]: number }
 */
export const getReportCounts = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.REPORT_COUNTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ════════════════════════════════════════════════════════════════
//  7. MASTER GATE — call before every post submission
// ════════════════════════════════════════════════════════════════
/**
 * Runs all checks in order. Returns:
 *   { allowed: true }
 *   { allowed: false, reason: string, type: 'cooldown'|'duplicate'|'profanity' }
 *
 * If allowed, also records the post in the log.
 */
export const canPost = async (text = '') => {
  // ① Content filter
  const { clean, matchedWord } = checkContent(text);
  if (!clean) {
    return {
      allowed: false,
      type: 'profanity',
      reason: `⚠️ Your confession contains inappropriate content. Please revise it.`,
    };
  }

  // ② Cooldown
  const { remaining, isSpammer, cooldownSec } = await checkCooldown();
  if (remaining > 0) {
    const msg = isSpammer
      ? `🚨 You're posting too fast. Please wait ${cooldownSec}s before posting again.`
      : `⏳ Please wait ${cooldownSec}s before your next confession.`;
    return { allowed: false, type: 'cooldown', reason: msg, cooldownSec };
  }

  // ③ Duplicate
  const isDuplicate = await checkDuplicate(text);
  if (isDuplicate) {
    return {
      allowed: false,
      type: 'duplicate',
      reason: `🔁 You already posted this recently. Share something new!`,
    };
  }

  // ✅ All clear — record this post
  await recordPost(text);
  return { allowed: true };
};
