import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { completeTask, deleteTask } from '../../store/slices/tasksSlice';
import { PriorityBadge } from '../../components/PriorityBadge';
import { CustomButton } from '../../components/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography, shadows } from '../../theme/tokens';
import { formatDateTime, getRelativeDeadlineLabel } from '../../utils/dateUtils';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskDetail'>;

export const TaskDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const { taskId } = route.params;

  // Retrieve task from Redux state
  const task = useAppSelector((state) =>
    state.tasks.tasks.find((t) => t._id === taskId)
  );

  if (!task) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Task Not Found</Text>
        <Text style={styles.notFoundDesc}>
          This task may have been removed or deleted.
        </Text>
        <CustomButton
          title="Return to Task List"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.lg }}
        />
      </SafeAreaView>
    );
  }

  const isCompleted = task.status === 'completed';

  // Overdue logic: deadline in past AND not completed
  const deadlineMs = new Date(task.deadline).getTime();
  const isOverdue = !isCompleted && !isNaN(deadlineMs) && deadlineMs < Date.now();
  const deadlineInfo = getRelativeDeadlineLabel(task.deadline, task.status);

  const handleToggleStatus = () => {
    dispatch(completeTask({ id: task._id, currentStatus: task.status }));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to permanently delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteTask(task._id));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddEditTask', { task, isEditing: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Overdue Warning Alert Box */}
        {isOverdue && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueBannerIcon}>⚠️</Text>
            <View style={styles.overdueBannerContent}>
              <Text style={styles.overdueBannerTitle}>Task is OVERDUE</Text>
              <Text style={styles.overdueBannerSub}>
                The scheduled deadline for this task has passed.
              </Text>
            </View>
          </View>
        )}

        {/* Main Details Card */}
        <View style={styles.card}>
          {/* Status Badge + Category Header */}
          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <PriorityBadge priority={task.priority} size="md" />
              {Boolean(task.category) && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.statusBadge,
                isCompleted ? styles.statusCompleted : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isCompleted ? styles.statusCompletedText : styles.statusPendingText,
                ]}
              >
                {isCompleted ? '✓ COMPLETED' : '⏳ PENDING'}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isCompleted && styles.completedTitle]}>
            {task.title}
          </Text>

          {/* Description */}
          <View style={styles.descriptionBox}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Text style={styles.descriptionText}>
              {task.description && task.description.trim() !== ''
                ? task.description
                : 'No additional description provided.'}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Time & Dates Section */}
          <View style={styles.datesGrid}>
            <View style={styles.dateBlock}>
              <Text style={styles.fieldLabel}>Scheduled Start</Text>
              <Text style={styles.dateValue}>{formatDateTime(task.dateTime)}</Text>
            </View>

            <View style={styles.dateBlock}>
              <Text style={styles.fieldLabel}>Deadline</Text>
              <Text
                style={[
                  styles.dateValue,
                  isOverdue && styles.overdueDateText,
                  isCompleted && styles.completedDateText,
                ]}
              >
                {formatDateTime(task.deadline)} ({deadlineInfo.text})
              </Text>
            </View>

            <View style={styles.dateBlock}>
              <Text style={styles.fieldLabel}>Created At</Text>
              <Text style={styles.metaValue}>{formatDateTime(task.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          {/* Status Toggle Button */}
          <CustomButton
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            variant={isCompleted ? 'outline' : 'primary'}
            onPress={handleToggleStatus}
            style={styles.actionButton}
          />

          <View style={styles.secondaryActions}>
            <CustomButton
              title="Edit Task"
              variant="outline"
              onPress={handleEdit}
              style={styles.halfButton}
            />
            <CustomButton
              title="Delete Task"
              variant="danger"
              onPress={handleDelete}
              style={styles.halfButton}
            />
          </View>
        </View>
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
    paddingBottom: spacing.xxxl,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: '#0F172A',
  },
  notFoundDesc: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overdue.bg,
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  overdueBannerIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  overdueBannerContent: {
    flex: 1,
  },
  overdueBannerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.overdue.text,
  },
  overdueBannerSub: {
    fontSize: typography.fontSize.xs,
    color: '#9F1239',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.base,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    color: '#B45309',
    fontSize: typography.fontSize.xs - 1,
    fontWeight: '700',
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusCompletedText: {
    color: '#047857',
    fontSize: typography.fontSize.xs - 1,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: typography.lineHeight.xxl,
    marginBottom: spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  descriptionBox: {
    marginTop: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: '#334155',
    lineHeight: typography.lineHeight.base,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: spacing.lg,
  },
  datesGrid: {
    gap: spacing.md,
  },
  dateBlock: {},
  dateValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#1E293B',
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: '#64748B',
  },
  overdueDateText: {
    color: colors.overdue.badge,
    fontWeight: '700',
  },
  completedDateText: {
    color: '#94A3B8',
  },
  actionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {},
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
});
