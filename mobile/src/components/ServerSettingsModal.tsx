import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { colors } from '../theme/colors';
import { borderRadius, spacing, typography } from '../theme/tokens';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_LAN_URL, DEFAULT_EMULATOR_URL } from '../services/api';
import { storageService } from '../services/storageService';

interface ServerSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setUrl(getApiBaseUrl());
      setTestResult(null);
    }
  }, [visible]);

  const handleTestConnection = async () => {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    if (!cleanUrl) {
      setTestResult({ success: false, message: 'Please enter a server URL' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await axios.get(`${cleanUrl}/health`, { timeout: 4000 });
      if (res.status === 200 && res.data?.status === 'healthy') {
        setTestResult({ success: true, message: 'Connected successfully! Backend is healthy.' });
      } else {
        setTestResult({ success: true, message: `Server replied with status ${res.status}.` });
      }
    } catch (err: any) {
      const errMsg = err.code === 'ECONNABORTED' 
        ? 'Connection timed out. Check Wi-Fi or firewall.' 
        : (err.message || 'Cannot reach server at this address');
      setTestResult({ success: false, message: errMsg });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    if (!cleanUrl) return;

    await storageService.saveServerUrl(cleanUrl);
    setApiBaseUrl(cleanUrl);
    if (onSaved) onSaved(cleanUrl);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Server Settings</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Configure the backend REST API address for your device:
          </Text>

          {/* Presets */}
          <Text style={styles.sectionLabel}>Quick Presets:</Text>
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={[styles.presetChip, url === DEFAULT_LAN_URL && styles.presetChipActive]}
              onPress={() => {
                setUrl(DEFAULT_LAN_URL);
                setTestResult(null);
              }}
            >
              <Text style={[styles.presetText, url === DEFAULT_LAN_URL && styles.presetTextActive]}>
                📶 Laptop Wi-Fi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetChip, url === DEFAULT_EMULATOR_URL && styles.presetChipActive]}
              onPress={() => {
                setUrl(DEFAULT_EMULATOR_URL);
                setTestResult(null);
              }}
            >
              <Text style={[styles.presetText, url === DEFAULT_EMULATOR_URL && styles.presetTextActive]}>
                💻 Emulator
              </Text>
            </TouchableOpacity>
          </View>

          {/* URL Input */}
          <Text style={styles.sectionLabel}>Server Base URL:</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              if (testResult) setTestResult(null);
            }}
            placeholder="http://192.168.0.3:5000"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {/* Test Status Banner */}
          {testResult && (
            <View style={[styles.statusBanner, testResult.success ? styles.statusSuccess : styles.statusError]}>
              <Text style={[styles.statusText, testResult.success ? styles.statusTextSuccess : styles.statusTextError]}>
                {testResult.success ? '✓ ' : '✕ '} {testResult.message}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.testButton, testing && styles.buttonDisabled]}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <Text style={styles.testButtonText}>Test Connection</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save & Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    padding: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: '#6B7280',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  presetChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  presetChipActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  presetText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: '#4B5563',
  },
  presetTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.sm,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    marginBottom: spacing.md,
  },
  statusBanner: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  statusSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  statusTextSuccess: {
    color: '#065F46',
  },
  statusTextError: {
    color: '#991B1B',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  testButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#4F46E5',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
