import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';

interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}
      >
        <TextInput
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.input}
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: typography.fontSize.base,
  },
  eyeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  eyeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.error,
    fontWeight: '500',
  },
});
