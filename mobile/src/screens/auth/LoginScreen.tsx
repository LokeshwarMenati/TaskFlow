import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { storageService } from '../../services/storageService';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography } from '../../theme/tokens';
import { isValidEmail } from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (error) dispatch(clearAuthError());
    if (!validateForm()) return;

    await storageService.saveRememberMe(rememberMe);
    dispatch(loginUser({ email: email.trim(), password }));
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
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>✓</Text>
          </View>
          <Text style={styles.title}>Welcome to TaskFlow</Text>
          <Text style={styles.subtitle}>Sign in to manage and prioritize your tasks</Text>
        </View>

        {/* Global API Error Banner */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formCard}>
          <CustomInput
            label="Email Address"
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (emailError) setEmailError(null);
            }}
            error={emailError}
          />

          <CustomInput
            label="Password"
            placeholder="Enter your password"
            isPassword
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
          />

          {/* Remember Me Checkbox */}
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.7}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Keep me signed in</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        {/* Navigation to Register */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              if (error) dispatch(clearAuthError());
              navigation.navigate('Register');
            }}
          >
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  brandBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  brandIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  rememberText: {
    fontSize: typography.fontSize.sm,
    color: '#475569',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
  },
  registerLink: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.primary,
  },
});
