import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Task } from '../types/task.types';
import { PriorityBadge } from './PriorityBadge';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography, shadows } from '../theme/tokens';
import { formatDate, formatTime, getRelativeDeadlineLabel } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}) => {
  const isCompleted = task.status === 'completed';

  // Calculate overdue: only if status !== 'completed' AND deadline < now
  const deadlineMs = new Date(task.deadline).getTime();
  const isOverdue = !isCompleted && !isNaN(deadlineMs) && deadlineMs < Date.now();

  const deadlineInfo = getRelativeDeadlineLabel(task.deadline, task.status);

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

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        isCompleted && styles.completedCard,
        isOverdue && styles.overdueCard,
      ]}
    >
      {/* Top Header: Checkbox + Title + Delete button */}
      <View style={styles.headerRow}>
        {/* Completion Checkbox */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggleComplete}
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Title & Category */}
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={2}
            style={[styles.title, isCompleted && styles.completedTitle]}
          >
            {task.title}
          </Text>
          {Boolean(task.category) && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          )}
        </View>

        {/* Delete Quick Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={confirmDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Description Preview (if present) */}
      {Boolean(task.description) && (
        <Text
          numberOfLines={2}
          style={[styles.description, isCompleted && styles.completedDescription]}
        >
          {task.description}
        </Text>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer Info: Priority, Scheduled Time, Deadline, Overdue Alert */}
      <View style={styles.footerRow}>
        <View style={styles.footerLeft}>
          <PriorityBadge priority={task.priority} size="sm" />
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
    opacity: 0.75,
  },
  overdueCard: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFBFB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: spacing.md,
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
    lineHeight: 14,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: typography.lineHeight.md,
    marginRight: spacing.sm,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
  },
  categoryText: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  description: {
    marginTop: spacing.xs + 2,
    marginLeft: 22 + spacing.md,
    fontSize: typography.fontSize.sm,
    color: '#64748B',
    lineHeight: typography.lineHeight.sm,
  },
  completedDescription: {
    color: '#CBD5E1',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  overdueBadge: {
    backgroundColor: colors.overdue.bg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.xs,
  },
  overdueBadgeText: {
    color: colors.overdue.text,
    fontSize: typography.fontSize.xs - 2,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  datesContainer: {
    alignItems: 'flex-end',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  dateLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#94A3B8',
    marginRight: 4,
  },
  dateValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#475569',
  },
  overdueDateValue: {
    color: colors.overdue.badge,
    fontWeight: '700',
  },
  completedDateValue: {
    color: '#94A3B8',
  },
});
