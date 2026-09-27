import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';
import { formatDate, formatTime } from '../utils/dateUtils';

interface DateTimePickerModalProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string | null;
  minimumDate?: Date;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  label,
  value,
  onChange,
  error,
  minimumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date>(value);

  const openDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const openTimePicker = () => {
    setPickerMode('time');
    setShowPicker(true);
  };

  const handlePickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        if (pickerMode === 'date') {
          // Merge selected date with existing time
          const merged = new Date(value);
          merged.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
          onChange(merged);
        } else {
          // Merge selected time with existing date
          const merged = new Date(value);
          merged.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
          onChange(merged);
        }
      }
    } else {
      // iOS
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIOSDone = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.buttonsRow}>
        {/* Date Selector Button */}
        <TouchableOpacity
          style={[styles.selectorButton, Boolean(error) && styles.buttonError]}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>📅</Text>
          <Text style={styles.valueText}>{formatDate(value.toISOString())}</Text>
        </TouchableOpacity>

        {/* Time Selector Button */}
        <TouchableOpacity
          style={[styles.selectorButton, Boolean(error) && styles.buttonError]}
          onPress={openTimePicker}
          activeOpacity={0.7}
        >
          <Text style={styles.iconText}>⏰</Text>
          <Text style={styles.valueText}>{formatTime(value.toISOString())}</Text>
        </TouchableOpacity>
      </View>

      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

      {/* Android Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value}
          mode={pickerMode}
          is24Hour={false}
          display="default"
          minimumDate={minimumDate}
          onChange={handlePickerChange}
        />
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.iosOverlay}>
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosTitle}>{label}</Text>
                <TouchableOpacity onPress={handleIOSDone}>
                  <Text style={styles.iosDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display="spinner"
                minimumDate={minimumDate}
                onChange={handlePickerChange}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: '#334155',
    marginBottom: spacing.xs,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectorButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  buttonError: {
    borderColor: colors.error,
  },
  iconText: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  valueText: {
    fontSize: typography.fontSize.base,
    color: '#0F172A',
    fontWeight: '500',
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: '500',
  },
  iosOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosSheet: {
    backgroundColor: '#FFFFFF',
    paddingBottom: spacing.xxxl,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iosTitle: {
    fontWeight: '600',
    fontSize: typography.fontSize.base,
    color: '#0F172A',
  },
  iosCancelText: {
    color: '#64748B',
    fontSize: typography.fontSize.base,
  },
  iosDoneText: {
    color: colors.primary,
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});
