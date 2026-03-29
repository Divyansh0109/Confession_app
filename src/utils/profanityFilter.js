// ═══════════════════════════════════════════════════════════════
//  ADVANCED CONTENT FILTER  –  English + Hindi + Hinglish
//  Handles: spaced words, l33t-speak, mixed chars, zero-width chars
// ═══════════════════════════════════════════════════════════════

// ── 1. Raw banned word list ─────────────────────────────────────
const BANNED_WORDS = [
  // English core
  'fuck', 'fck', 'fuk', 'f u c k', 'fvck', 'phuck',
  'shit', 'sht', 's h i t',
  'bitch', 'b1tch', 'biatch',
  'asshole', 'assh0le', 'a hole',
  'bastard', 'b4stard',
  'dick', 'd1ck', 'dik',
  'pussy', 'p u s s y',
  'cunt', 'c u n t',
  'whore', 'wh0re',
  'slut', 'sl ut',
  'rape', 'r4pe',
  'nigger', 'n1gger', 'nigga',
  'retard', 'ret4rd',
  'faggot', 'f4ggot',

  // Hindi transliterated
  'madarchod', 'madarchood', 'maderchod',
  'behenchod', 'bhenchod', 'bc',
  'bhosdike', 'bhosdika', 'bhosdi', 'bhosda',
  'lund', 'lauda', 'lawda', 'lode', 'lodu', 'loude',
  'chutiya', 'chtiya', 'chut',
  'gaand', 'gand',
  'randi',
  'haramzada', 'haramkhor', 'harami',
  'jhatu', 'jhaatu',
  'gandu',
  'bkl',       // bekaar log shorthand

  // Hinglish / hybrid
  'mc',        // madarchod abbrev (standalone)
  'sala', 'saale',
  'bakchod', 'bakchodi', 'bkc',
  'kamina', 'kamine',
  'gadha',
  'teri maa', 'terima', 'maa ki',
  'behen ki', 'behenkl',
  'teri behen',
];

// ── 2. l33t-speak / obfuscation map ────────────────────────────
const LEET_MAP = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '6': 'g',
  '7': 't',
  '8': 'b',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '+': 't',
  '|': 'i',
};

// ── 3. Normalize input ──────────────────────────────────────────
/**
 * Normalize text to strip obfuscation tricks:
 * - Lowercase
 * - Remove zero-width / invisible Unicode
 * - Map l33t characters back to letters
 * - Remove all non-alphanumeric except spaces
 * - Collapse spaces (catches "f u c k" style)
 */
export const normalize = (text = '') => {
  // Remove zero-width chars and other invisible Unicode
  let s = text.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');
  // Lowercase
  s = s.toLowerCase();
  // Map l33t chars
  s = s.split('').map((c) => LEET_MAP[c] || c).join('');
  // Remove punctuation/symbols (keep a-z, 0-9, space)
  s = s.replace(/[^a-z0-9\s]/g, '');
  return s;
};

/**
 * Deduplicated version – also removes spaces between letters
 * so "f u c k" and "fu ck" still match.
 */
const normalizeCompact = (text = '') => normalize(text).replace(/\s+/g, '');

// ── 4. Main check ───────────────────────────────────────────────
/**
 * Returns { clean: boolean, matchedWord: string|null }
 */
export const checkContent = (text = '') => {
  const norm    = normalize(text);           // "f uck" → "f uck"
  const compact = normalizeCompact(text);    // "f uck" → "fuck"

  for (const word of BANNED_WORDS) {
    const w = normalize(word);
    const wc = w.replace(/\s+/g, '');

    // Check in spaced version (catches multi-word phrases like "teri maa")
    if (norm.includes(w)) return { clean: false, matchedWord: word };
    // Check in compact version (catches "f u c k")
    if (wc.length >= 3 && compact.includes(wc)) return { clean: false, matchedWord: word };
  }
  return { clean: true, matchedWord: null };
};

// Convenience boolean wrapper (backwards compatible)
export const containsProfanity = (text = '') => !checkContent(text).clean;

/**
 * Validates a custom anonymous name.
 * - Non-empty, max 30 chars, no profanity
 */
export const isValidName = (name = '') => {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) return false;
  return checkContent(trimmed).clean;
};
