import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TAG_COLORS } from '../constants/theme';

const TagChip = ({ tag, style }) => {
  const colors = TAG_COLORS[tag] || {
    bg: 'rgba(255,255,255,0.1)',
    text: '#fff',
    border: 'rgba(255,255,255,0.2)',
  };

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{tag}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default TagChip;
