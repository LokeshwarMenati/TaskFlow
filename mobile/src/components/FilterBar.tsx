import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Priority, TaskStatus } from '../types/task.types';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';

interface FilterBarProps {
  statusFilter: 'all' | TaskStatus;
  priorityFilter: 'all' | Priority;
  selectedCategory: string;
  availableCategories: string[];
  onStatusChange: (status: 'all' | TaskStatus) => void;
  onPriorityChange: (priority: 'all' | Priority) => void;
  onCategoryChange: (category: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  priorityFilter,
  selectedCategory,
  availableCategories,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.groupLabel}>Status:</Text>
        {(['all', 'pending', 'completed'] as const).map((st) => {
          const isActive = statusFilter === st;
          return (
            <TouchableOpacity
              key={st}
              onPress={() => onStatusChange(st)}
              style={[styles.chip, isActive && styles.activeChip]}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.verticalDivider} />

        {/* Priority Filter Chips */}
        <Text style={styles.groupLabel}>Priority:</Text>
        {(['all', 'high', 'medium', 'low'] as const).map((pr) => {
          const isActive = priorityFilter === pr;
          return (
            <TouchableOpacity
              key={pr}
              onPress={() => onPriorityChange(pr)}
              style={[styles.chip, isActive && styles.activeChip]}
            >
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {pr.charAt(0).toUpperCase() + pr.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Category Filter Chips (if any available) */}
        {availableCategories.length > 0 && (
          <>
            <View style={styles.verticalDivider} />
            <Text style={styles.groupLabel}>Category:</Text>
            <TouchableOpacity
              onPress={() => onCategoryChange('all')}
              style={[styles.chip, selectedCategory === 'all' && styles.activeChip]}
            >
              <Text style={[styles.chipText, selectedCategory === 'all' && styles.activeChipText]}>
                All
              </Text>
            </TouchableOpacity>
            {availableCategories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => onCategoryChange(isActive ? 'all' : cat)}
                  style={[styles.chip, isActive && styles.activeChip]}
                >
                  <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: '#94A3B8',
    marginRight: spacing.xs,
    textTransform: 'uppercase',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
    marginRight: spacing.xs,
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#475569',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
    marginHorizontal: spacing.sm,
  },
});
