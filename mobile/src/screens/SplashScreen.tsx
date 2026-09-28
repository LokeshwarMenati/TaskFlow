import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { restoreSession } from '../store/slices/authSlice';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/tokens';

import { initApiBaseUrl } from '../services/api';

export const SplashScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Attempt to restore saved server URL and persistent session
    const initApp = async () => {
      await initApiBaseUrl();
      dispatch(restoreSession());
    };
    initApp();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>✓</Text>
      </View>
      <Text style={styles.brandTitle}>TaskFlow</Text>
      <Text style={styles.subtitle}>Organize • Prioritize • Execute</Text>

      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing workspace...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '800',
  },
  brandTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  spinnerContainer: {
    marginTop: spacing.xxxl * 1.5,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
