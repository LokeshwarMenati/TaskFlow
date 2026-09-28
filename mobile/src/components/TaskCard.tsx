import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Task } from '../types/task.types';
import { PriorityBadge } from './PriorityBadge';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography, shadows } from '../theme/tokens';
import { formatDate, formatTime, getRelativeDeadlineLabel } from '../utils/dateUtils';
import { calculateCompositeScore } from '../utils/sorting';

interface TaskCardProps {
  task: Task;
  index?: number;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index = 0,
  onPress,
  onToggleComplete,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';

  // Calculate overdue: only if status !== 'completed' AND deadline < now
  const deadlineMs = new Date(task.deadline).getTime();
  const isOverdue = !isCompleted && !isNaN(deadlineMs) && deadlineMs < Date.now();
  const deadlineInfo = getRelativeDeadlineLabel(task.deadline, task.status);

  // Animations
  const cardScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Staggered cascade entrance
  useEffect(() => {
    Animated.sequence([
      Animated.delay(Math.min(index * 45, 300)),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  // Breathing pulse for high priority or overdue tasks
  useEffect(() => {
    if (!isCompleted && (task.priority === 'high' || isOverdue)) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isCompleted, task.priority, isOverdue, pulseAnim]);

  // Press tactile physics
  const handlePressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 100,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  // Pop animation on checkmark
  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 80,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleComplete();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
      { cancelable: true }
    );
  };

  // Calculate composite rank score (showcase assessment algorithm)
  const compositeScore = !isCompleted
    ? Math.max(0, Math.round(calculateCompositeScore(task) * 100))
    : null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: cardScale }],
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isCompleted && styles.completedCard,
          isOverdue && styles.overdueCard,
        ]}
      >
        {/* Top Header: Checkbox + Title + Category + Delete */}
        <View style={styles.headerRow}>
          {/* Animated Checkbox */}
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleToggle}
              style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          </Animated.View>

          {/* Title & Category Tag */}
          <View style={styles.titleContainer}>
            <Text
              numberOfLines={2}
              style={[styles.title, isCompleted && styles.completedTitle]}
            >
              {task.title}
            </Text>
            <View style={styles.tagRow}>
              {Boolean(task.category) && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              )}
              {compositeScore !== null && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreBadgeText}>⚡ Rank {compositeScore}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Delete Action */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={confirmDelete}
            style={styles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Description Preview */}
        {Boolean(task.description) && (
          <Text
            numberOfLines={2}
            style={[styles.description, isCompleted && styles.completedDescription]}
          >
            {task.description}
          </Text>
        )}

        <View style={styles.divider} />

        {/* Footer: Priority Badge, Dates & Overdue */}
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            <Animated.View
              style={
                !isCompleted && (task.priority === 'high' || isOverdue)
                  ? { transform: [{ scale: pulseAnim }] }
                  : undefined
              }
            >
              <PriorityBadge priority={task.priority} size="sm" />
            </Animated.View>
            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueBadgeText}>OVERDUE</Text>
              </View>
            )}
          </View>

          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Scheduled:</Text>
              <Text style={styles.dateValue}>
                {formatDate(task.dateTime)} • {formatTime(task.dateTime)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Deadline:</Text>
              <Text
                style={[
                  styles.dateValue,
                  isOverdue && styles.overdueDateValue,
                  isCompleted && styles.completedDateValue,
                ]}
              >
                {deadlineInfo.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  completedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.8,
  },
  overdueCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF5F5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: spacing.sm,
    marginLeft: 36,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: '#CBD5E1',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  datesContainer: {
    alignItems: 'flex-end',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  overdueDateValue: {
    color: '#DC2626',
    fontWeight: '700',
  },
  completedDateValue: {
    color: '#94A3B8',
  },
});
