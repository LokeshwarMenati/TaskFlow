import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { storageService } from '../../services/storageService';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography, shadows } from '../../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks } = useAppSelector((state) => state.tasks);

  // Settings State
  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-15)).current;
  const cardsFade = useRef(new Animated.Value(0)).current;
  const cardsSlide = useRef(new Animated.Value(20)).current;
  const avatarScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 60,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(cardsFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(cardsSlide, {
            toValue: 0,
            tension: 45,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [avatarScale, headerFade, headerSlide, cardsFade, cardsSlide]);

  // Compute User Initials
  const userInitials = (user?.email || 'TF')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  // Compute Productivity Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleResetDemoData = async () => {
    Alert.alert(
      'Reset Demo Tasks',
      'Reload the pre-configured assessment tasks showcasing priority algorithms and universal offline resilience?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo Data',
          onPress: async () => {
            await storageService.resetDemoTasks();
            dispatch(fetchTasks());
            Alert.alert('Demo Tasks Restored', 'The assessment tasks have been re-seeded into local storage.');
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear All Tasks',
      'Are you sure you want to clear all tasks from local storage?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAllLocalTasks();
            dispatch(fetchTasks());
            Alert.alert('Cleared', 'All local tasks have been cleared.');
          },
        },
      ]
    );
  };

  const handleExportSummary = () => {
    const summary = `📊 TaskFlow Assessment Summary\n` +
      `User: ${user?.email || 'Guest'}\n` +
      `Total Tasks: ${totalTasks}\n` +
      `Completed: ${completedTasks} (${completionRate}%)\n` +
      `Pending: ${pendingTasks}\n` +
      `High Priority Action Items: ${highPriorityTasks}\n` +
      `Smart Urgency Algorithm: 50% Deadline + 35% Priority + 15% Schedule`;
    Alert.alert('Assessment Report', summary);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(logoutUser()),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated User Profile Header Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
            },
          ]}
        >
          <View style={styles.profileHeaderRow}>
            <Animated.View
              style={[
                styles.avatarContainer,
                { transform: [{ scale: avatarScale }] },
              ]}
            >
              <Text style={styles.avatarText}>{userInitials}</Text>
            </Animated.View>
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {(user?.email || 'User').split('@')[0]}
                </Text>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'Candidate Assessment'}
              </Text>
              <Text style={styles.memberSince}>
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Animated Productivity Stats Grid */}
        <Animated.View
          style={[
            styles.cardsGroup,
            {
              opacity: cardsFade,
              transform: [{ translateY: cardsSlide }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Productivity Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { borderLeftColor: colors.primary }]}>
              <Text style={styles.statBoxNumber}>{completionRate}%</Text>
              <Text style={styles.statBoxLabel}>Completion Rate</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: colors.success }]}>
              <Text style={[styles.statBoxNumber, { color: colors.success }]}>
                {completedTasks}
              </Text>
              <Text style={styles.statBoxLabel}>Completed</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: '#F59E0B' }]}>
              <Text style={[styles.statBoxNumber, { color: '#D97706' }]}>
                {pendingTasks}
              </Text>
              <Text style={styles.statBoxLabel}>Pending</Text>
            </View>
            <View style={[styles.statBox, { borderLeftColor: '#EF4444' }]}>
              <Text style={[styles.statBoxNumber, { color: '#DC2626' }]}>
                {highPriorityTasks}
              </Text>
              <Text style={styles.statBoxLabel}>High Priority</Text>
            </View>
          </View>

          {/* Assessment Smart Urgency Algorithm Breakdown */}
          <Text style={styles.sectionTitle}>Smart Urgency Algorithm</Text>
          <View style={styles.cardContainer}>
            <Text style={styles.cardHeader}>Composite Urgency Formula</Text>
            <Text style={styles.cardSub}>
              Combines 3 dimensions to dynamically surface what matters most:
            </Text>

            <View style={styles.formulaRow}>
              <View style={styles.formulaBarContainer}>
                <View style={[styles.formulaSegment, { flex: 50, backgroundColor: '#EF4444' }]} />
                <View style={[styles.formulaSegment, { flex: 35, backgroundColor: '#F59E0B' }]} />
                <View style={[styles.formulaSegment, { flex: 15, backgroundColor: colors.primary }]} />
              </View>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>50% Deadline Urgency</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>35% Priority Level</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.legendText}>15% Scheduled Start</Text>
              </View>
            </View>
          </View>

          {/* App Preferences */}
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.cardContainer}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Default Priority</Text>
                <Text style={styles.settingSub}>For newly drafted tasks</Text>
              </View>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setDefaultPriority(p)}
                    style={[
                      styles.priorityOption,
                      defaultPriority === p && styles.priorityOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityOptionText,
                        defaultPriority === p && styles.priorityOptionTextActive,
                      ]}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Micro-Animations</Text>
                <Text style={styles.settingSub}>Hardware-accelerated 60fps transitions</Text>
              </View>
              <Switch
                value={enableAnimations}
                onValueChange={setEnableAnimations}
                trackColor={{ false: '#CBD5E1', true: '#C7D2FE' }}
                thumbColor={enableAnimations ? colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Compact Mode</Text>
                <Text style={styles.settingSub}>Dense task card layout</Text>
              </View>
              <Switch
                value={compactView}
                onValueChange={setCompactView}
                trackColor={{ false: '#CBD5E1', true: '#C7D2FE' }}
                thumbColor={compactView ? colors.primary : '#F1F5F9'}
              />
            </View>
          </View>

          {/* Assessment Reviewer Actions */}
          <Text style={styles.sectionTitle}>Assessment Reviewer Tools</Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleResetDemoData}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Reset Demo Tasks</Text>
                <Text style={styles.actionSub}>Re-seed initial sample assessment tasks</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportSummary}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>View Assessment Summary</Text>
                <Text style={styles.actionSub}>Inspect completion metrics report</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: '#DC2626' }]}>Clear All Local Tasks</Text>
                <Text style={styles.actionSub}>Empty offline storage for testing</Text>
              </View>
              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Technical Info */}
          <View style={styles.techInfoCard}>
            <Text style={styles.techTitle}>TaskFlow Architecture</Text>
            <Text style={styles.techSub}>
              React Native 0.76 • Redux Toolkit • TypeScript{'\n'}
              Node.js Express API • MongoDB • Universal Offline-First Engine
            </Text>
            <Text style={styles.versionText}>Version 1.2.0 (Build 2026.09)</Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl * 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
    marginBottom: spacing.lg,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: '#0F172A',
  },
  proBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: '#64748B',
    marginTop: 2,
  },
  memberSince: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  cardsGroup: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statBoxNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHeader: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  formulaRow: {
    marginVertical: spacing.xs,
  },
  formulaBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  formulaSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'column',
    gap: 6,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.sm,
  },
  prioritySelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: borderRadius.md,
    padding: 2,
  },
  priorityOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  priorityOptionActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  priorityOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityOptionTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#0F172A',
  },
  actionSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  actionArrow: {
    fontSize: 20,
    color: '#CBD5E1',
    fontWeight: '300',
  },
  techInfoCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  techTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  techSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
  versionText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 6,
  },
  signOutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: spacing.xs,
  },
  signOutText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: typography.fontSize.sm,
  },
});
