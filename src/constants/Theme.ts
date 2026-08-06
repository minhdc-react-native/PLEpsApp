import {
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';

/**
 * EPS TRAINING uses a calm enterprise palette: one accent, neutral surfaces,
 * and status colors only where they carry meaning. Keeping these roles close
 * to white prevents Paper's elevation containers from introducing extra hues.
 */
const ThemeEvnGenco3 = {
  primary: '#1D5FE9',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E8F0FF',
  onPrimaryContainer: '#0D2E76',

  secondary: '#5B667A',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#EEF2F7',
  onSecondaryContainer: '#263246',

  tertiary: '#0B756D',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E0F4F1',
  onTertiaryContainer: '#063D39',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#410002',

  background: '#F7F9FC',
  onBackground: '#172033',
  surface: '#FFFFFF',
  onSurface: '#172033',

  surfaceVariant: '#F1F4F8',
  onSurfaceVariant: '#5B667A',
  outline: '#AAB5C5',
  outlineVariant: '#E2E8F0',

  shadow: '#172033',
  scrim: '#000000',
  inverseSurface: '#2B3342',
  inverseOnSurface: '#F1F4F8',
  inversePrimary: '#B6CBFF',

  elevation: {
    level0: 'transparent',
    level1: '#F7F9FC',
    level2: '#F3F6FA',
    level3: '#EEF3F8',
    level4: '#EAF0F7',
    level5: '#E5ECF5',
  },

  surfaceDisabled: 'rgba(23, 32, 51, 0.12)',
  onSurfaceDisabled: 'rgba(23, 32, 51, 0.38)',
  backdrop: 'rgba(23, 32, 51, 0.35)',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...ThemeEvnGenco3,
  },
};

export const ui = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 24,
  },
};
