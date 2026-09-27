import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { TaskSortOption } from '../types/task.types';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';

interface SortModalProps {
  visible: boolean;
  currentSort: TaskSortOption;
  onSelectSort: (sort: TaskSortOption) => void;
  onClose: () => void;
}

const SORT_OPTIONS: { id: TaskSortOption; label: string; description: string }[] = [
  {
    id: 'composite',
    label: '⚡ Smart Urgency (Default)',
    description: 'Weighted balance of deadline urgency, priority, and scheduled time',
  },
  {
    id: 'deadline',
    label: '⏳ Closest Deadline',
    description: 'Earliest deadlines appear at the top',
  },
  {
    id: 'priority',
    label: '🔥 Priority (High to Low)',
    description: 'High priority tasks appear first',
  },
  {
    id: 'dateTime',
    label: '📅 Scheduled Date & Time',
    description: 'Earliest scheduled start time first',
  },
  {
    id: 'createdAt',
    label: '🕒 Creation Date',
    description: 'Most recently created tasks first',
  },
];

export const SortModal: React.FC<SortModalProps> = ({
  visible,
  currentSort,
  onSelectSort,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Sort Tasks By</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = currentSort === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionItem, isSelected && styles.selectedOption]}
                      onPress={() => {
                        onSelectSort(option.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.selectedOptionLabel,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.optionDesc}>{option.description}</Text>
                      </View>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.primary,
  },
  optionsList: {
    marginTop: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  selectedOption: {
    backgroundColor: '#EEF2FF',
  },
  optionContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedOptionLabel: {
    color: colors.primary,
  },
  optionDesc: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
});
