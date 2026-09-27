import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/tokens';

interface LoadingIndicatorProps {
  message?: string;
  fullscreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  fullscreen = false,
}) => {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {Boolean(message) && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: '#64748B',
  },
});
