import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomButton } from './CustomButton';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/tokens';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No tasks yet',
  subtitle = 'Create your first task and stay organized.',
  actionText = 'Create Task',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.emoji}>✓</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onAction && (
        <CustomButton
          title={actionText}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  emoji: {
    fontSize: 34,
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
    marginBottom: spacing.xl,
  },
  button: {
    paddingHorizontal: spacing.xxl,
  },
});
