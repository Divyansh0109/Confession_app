export const COLORS = {
  background: '#0D0D0D',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceBorder: 'rgba(255, 255, 255, 0.1)',
  card: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  // Accents
  purple: '#A855F7',
  pink: '#EC4899',
  purpleDark: '#7C3AED',

  // Text
  textPrimary: '#F0F0F0',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textAccent: '#A855F7',

  // Tags
  love: '#EC4899',
  college: '#3B82F6',
  secrets: '#8B5CF6',
  rant: '#EF4444',
  crush: '#F97316',
  funny: '#EAB308',

  // Reactions
  reactionHeart: '#EF4444',
  reactionFunny: '#F59E0B',
  reactionDead: '#8B5CF6',
  reactionShocked: '#3B82F6',

  // UI
  white: '#FFFFFF',
  black: '#000000',
  separator: 'rgba(255,255,255,0.07)',
  overlay: 'rgba(0,0,0,0.7)',
  inputBg: 'rgba(255,255,255,0.08)',
  danger: '#EF4444',
  success: '#10B981',
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extrabold: { fontWeight: '800' },
};

export const SIZES = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  card: 20,
  fab: 60,
};

export const SHADOWS = {
  card: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fab: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const TAG_COLORS = {
  Love: { bg: 'rgba(236,72,153,0.2)', text: '#EC4899', border: 'rgba(236,72,153,0.4)' },
  Crush: { bg: 'rgba(249,115,22,0.2)', text: '#F97316', border: 'rgba(249,115,22,0.4)' },
  Rant: { bg: 'rgba(239,68,68,0.2)', text: '#EF4444', border: 'rgba(239,68,68,0.4)' },
  Secrets: { bg: 'rgba(139,92,246,0.2)', text: '#8B5CF6', border: 'rgba(139,92,246,0.4)' },
  College: { bg: 'rgba(59,130,246,0.2)', text: '#3B82F6', border: 'rgba(59,130,246,0.4)' },
  Funny: { bg: 'rgba(234,179,8,0.2)', text: '#EAB308', border: 'rgba(234,179,8,0.4)' },
};

export const TAGS = ['Love', 'Crush', 'Rant', 'Secrets', 'College', 'Funny'];
