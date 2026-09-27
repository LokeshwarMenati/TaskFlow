import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types/task.types';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const p = (priority || 'medium').toLowerCase() as Priority;
  const config = colors.priority[p] || colors.priority.medium;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingHorizontal: isSmall ? spacing.xs + 2 : spacing.sm + 2,
          paddingVertical: isSmall ? 2 : spacing.xs,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.badge }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.text,
            fontSize: isSmall ? typography.fontSize.xs - 1 : typography.fontSize.xs,
          },
        ]}
      >
        {p.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
