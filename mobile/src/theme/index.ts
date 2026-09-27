import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { spacing, typography, borderRadius, shadows } from './tokens';

export { colors, spacing, typography, borderRadius, shadows };

export const useTheme = () => {
  const isDark = useColorScheme() === 'dark';
  const themeColors = isDark ? colors.dark : colors.light;

  return {
    isDark,
    colors: {
      ...colors,
      background: themeColors.background,
      card: themeColors.card,
      text: themeColors.text,
      textSecondary: themeColors.textSecondary,
      textMuted: themeColors.textMuted,
      border: themeColors.border,
      inputBg: themeColors.inputBg,
      inputBorder: themeColors.inputBorder,
      divider: themeColors.divider,
    },
    spacing,
    typography,
    borderRadius,
    shadows,
  };
};
