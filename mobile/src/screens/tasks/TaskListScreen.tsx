import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTasks,
  completeTask,
  deleteTask,
  setFilters,
  setSort,
} from '../../store/slices/tasksSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { TaskCard } from '../../components/TaskCard';
import { FilterBar } from '../../components/FilterBar';
import { SortModal } from '../../components/SortModal';
import { EmptyState } from '../../components/EmptyState';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { TaskSortOption, Task } from '../../types/task.types';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography, shadows } from '../../theme/tokens';

type Props = NativeStackScreenProps<MainStackParamList, 'TaskList'>;

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { tasks, loading, filters, sort } = useAppSelector((state) => state.tasks);

  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Fetch tasks on mount and when filters/sort change
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch, filters.status, filters.priority, filters.category, sort]);

  const handleRefresh = () => {
    dispatch(fetchTasks());
  };

  const handleToggleComplete = (task: Task) => {
    dispatch(completeTask({ id: task._id, currentStatus: task.status }));
  };

  const handleDelete = (taskId: string) => {
    dispatch(deleteTask(taskId));
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) },
    ]);
  };

  // Derive unique categories from existing tasks
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      if (t.category && t.category.trim() !== '') {
        cats.add(t.category.trim());
      }
    });
    return Array.from(cats);
  }, [tasks]);

  // Client-side filtering when backend already returned tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
      if (
        filters.category !== 'all' &&
        t.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const sortLabelMap: Record<TaskSortOption, string> = {
    composite: '⚡ Smart Urgency',
    deadline: '⏳ Deadline',
    priority: '🔥 Priority',
    dateTime: '📅 Scheduled',
    createdAt: '🕒 Created',
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>TaskFlow</Text>
          <Text style={styles.userEmail}>{user?.email || 'My Workspace'}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Statistics Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Filter Chips Bar */}
      <FilterBar
        statusFilter={filters.status}
        priorityFilter={filters.priority}
        selectedCategory={filters.category}
        availableCategories={availableCategories}
        onStatusChange={(status) => dispatch(setFilters({ status }))}
        onPriorityChange={(priority) => dispatch(setFilters({ priority }))}
        onCategoryChange={(category) => dispatch(setFilters({ category }))}
      />

      {/* Sort Control Row */}
      <View style={styles.sortRow}>
        <Text style={styles.resultsCount}>
          Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.sortButtonText}>{sortLabelMap[sort]}</Text>
          <Text style={styles.sortArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Task List (FlatList used exclusively — no giant ScrollView) */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item._id })}
            onToggleComplete={() => handleToggleComplete(item)}
            onDelete={() => handleDelete(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? (
            <LoadingIndicator message="Fetching your tasks..." />
          ) : (
            <EmptyState
              title={
                filters.status !== 'all' || filters.priority !== 'all'
                  ? 'No matching tasks'
                  : 'No tasks yet'
              }
              subtitle={
                filters.status !== 'all' || filters.priority !== 'all'
                  ? 'Try changing or clearing your active filters.'
                  : 'Create your first task and stay organized.'
              }
              actionText="Create Task"
              onAction={() => navigation.navigate('AddEditTask', {})}
            />
          )
        }
      />

      {/* Floating Action Button (FAB) to Add Task */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddEditTask', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Sort Selection Modal */}
      <SortModal
        visible={sortModalVisible}
        currentSort={sort}
        onSelectSort={(newSort) => dispatch(setSort(newSort))}
        onClose={() => setSortModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    marginTop: 1,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  logoutText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#475569',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.base,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  resultsCount: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sortButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#334155',
  },
  sortArrow: {
    fontSize: 8,
    color: '#64748B',
    marginLeft: 6,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xs,
    paddingBottom: 90, // Leave space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 34,
  },
});
