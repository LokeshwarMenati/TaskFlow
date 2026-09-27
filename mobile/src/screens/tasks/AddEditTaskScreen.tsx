import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation.types';
import { useAppDispatch } from '../../store/hooks';
import { createTask, updateTask } from '../../store/slices/tasksSlice';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';
import { Priority } from '../../types/task.types';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography } from '../../theme/tokens';
import { validateTaskForm } from '../../utils/validation';

type Props = NativeStackScreenProps<MainStackParamList, 'AddEditTask'>;

const PRESET_CATEGORIES = ['Work', 'Personal', 'Study', 'Finance', 'Health', 'Shopping'];

export const AddEditTaskScreen: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useAppDispatch();
  const existingTask = route.params?.task;
  const isEditing = Boolean(existingTask);

  // Form State
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [dateTime, setDateTime] = useState<Date>(
    existingTask?.dateTime ? new Date(existingTask.dateTime) : new Date()
  );
  const [deadline, setDeadline] = useState<Date>(
    existingTask?.deadline
      ? new Date(existingTask.deadline)
      : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24h in future
  );
  const [priority, setPriority] = useState<Priority>(existingTask?.priority || 'medium');
  const [category, setCategory] = useState(existingTask?.category || 'General');

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    if (saving) return; // Prevent duplicate submissions

    const validation = validateTaskForm({
      title,
      dateTime,
      deadline,
      priority,
      category,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      if (isEditing && existingTask) {
        await dispatch(
          updateTask({
            id: existingTask._id,
            payload: {
              title: title.trim(),
              description: description.trim(),
              dateTime: dateTime.toISOString(),
              deadline: deadline.toISOString(),
              priority,
              category: category.trim(),
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createTask({
            title: title.trim(),
            description: description.trim(),
            dateTime: dateTime.toISOString(),
            deadline: deadline.toISOString(),
            priority,
            category: category.trim(),
          })
        ).unwrap();
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Save Failed',
        err || 'An error occurred while saving the task. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenHeading}>
          {isEditing ? 'Edit Task' : 'New Task'}
        </Text>

        <View style={styles.formCard}>
          {/* Title */}
          <CustomInput
            label="Task Title *"
            placeholder="e.g., Deliver Quarterly Presentation"
            value={title}
            onChangeText={(val) => {
              setTitle(val);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
          />

          {/* Description */}
          <CustomInput
            label="Description (Optional)"
            placeholder="Add relevant notes, links, or context..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            containerStyle={styles.descriptionContainer}
          />

          {/* Scheduled Date & Time */}
          <DateTimePickerModal
            label="Scheduled Start Date & Time *"
            value={dateTime}
            onChange={setDateTime}
            error={errors.dateTime}
          />

          {/* Deadline */}
          <DateTimePickerModal
            label="Task Deadline *"
            value={deadline}
            onChange={setDeadline}
            error={errors.deadline}
          />

          {/* Priority Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const config = colors.priority[p];
                return (
                  <TouchableOpacity
                    key={p}
                    activeOpacity={0.7}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor: isSelected ? config.bg : '#F8FAFC',
                        borderColor: isSelected ? config.badge : '#E2E8F0',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: config.badge },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: isSelected ? config.text : '#64748B' },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Category Input & Preset Chips */}
          <View style={styles.sectionContainer}>
            <CustomInput
              label="Category / Tag"
              placeholder="e.g., Engineering, Work, Home"
              value={category}
              onChangeText={(val) => {
                setCategory(val);
                if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
              }}
              error={errors.category}
              containerStyle={{ marginBottom: spacing.xs }}
            />
            {/* Quick preset chips */}
            <View style={styles.chipsRow}>
              {PRESET_CATEGORIES.map((preset) => {
                const isSelected = category.toLowerCase() === preset.toLowerCase();
                return (
                  <TouchableOpacity
                    key={preset}
                    onPress={() => setCategory(preset)}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextSelected,
                      ]}
                    >
                      {preset}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <CustomButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={saving}
            />
            <CustomButton
              title={isEditing ? 'Save Changes' : 'Create Task'}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.saveButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  screenHeading: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: spacing.base,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionContainer: {
    marginBottom: spacing.base,
  },
  sectionContainer: {
    marginBottom: spacing.base,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#334155',
    marginBottom: spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  presetChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  presetChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: typography.fontSize.xs,
    color: '#64748B',
    fontWeight: '500',
  },
  presetChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1.5,
  },
});
