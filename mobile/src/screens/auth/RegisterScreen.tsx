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
import { registerUser, clearAuthError } from '../../store/slices/authSlice';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, typography } from '../../theme/tokens';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { ServerSettingsModal } from '../../components/ServerSettingsModal';
import { getApiBaseUrl } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(getApiBaseUrl());

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

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
    } else if (!isValidPassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = () => {
    if (error) dispatch(clearAuthError());
    if (!validateForm()) return;

    dispatch(registerUser({ email: email.trim(), password }));
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandIcon}>✓</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join TaskFlow to achieve your goals efficiently</Text>
        </View>

        {/* Global API Error */}
        {Boolean(error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
            {error?.includes('Network Error') && (
              <TouchableOpacity
                style={styles.errorFixButton}
                onPress={() => setServerModalVisible(true)}
              >
                <Text style={styles.errorFixButtonText}>⚙️ Configure Server Address</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Form Card */}
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
            placeholder="Minimum 6 characters"
            isPassword
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (passwordError) setPasswordError(null);
            }}
            error={passwordError}
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            isPassword
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              if (confirmError) setConfirmError(null);
            }}
            error={confirmError}
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        {/* Server Connection Bar */}
        <TouchableOpacity
          style={styles.serverBar}
          onPress={() => setServerModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.serverBarText} numberOfLines={1}>
            ⚙️ Server: <Text style={styles.serverBarUrl}>{currentServerUrl}</Text>
          </Text>
          <Text style={styles.serverBarAction}>Change</Text>
        </TouchableOpacity>

        {/* Navigation to Login */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              if (error) dispatch(clearAuthError());
              navigation.navigate('Login');
            }}
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Server Settings Modal */}
        <ServerSettingsModal
          visible={serverModalVisible}
          onClose={() => setServerModalVisible(false)}
          onSaved={(newUrl) => setCurrentServerUrl(newUrl)}
        />
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
  errorFixButton: {
    marginTop: spacing.sm,
    backgroundColor: '#DC2626',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
  },
  errorFixButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
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
  submitButton: {
    marginTop: spacing.md,
  },
  serverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  serverBarText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  serverBarUrl: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  serverBarAction: {
    fontSize: typography.fontSize.xs,
    color: '#4F46E5',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: '#64748B',
  },
  loginLink: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: colors.primary,
  },
});
