import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Colors } from '../constants/colors';

type Mode = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryVeryLight: string;
  accentMint: string;
  background: string;
  card: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  blue: string;
  blueLight: string;
  orange: string;
  orangeLight: string;
  red: string;
  redLight: string;
  green: string;
  greenLight: string;
  gray: string;
  grayLight: string;
}

const lightTheme: ThemeColors = {
  primary: Colors.primary,
  primaryLight: Colors.primaryLight,
  primaryDark: Colors.primaryDark,
  primaryVeryLight: Colors.primaryVeryLight,
  accentMint: Colors.accentMint,
  background: Colors.background,
  card: Colors.card,
  surface: Colors.white,
  text: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  textTertiary: Colors.textTertiary,
  border: Colors.border,
  blue: Colors.blue,
  blueLight: Colors.blueLight,
  orange: Colors.orange,
  orangeLight: Colors.orangeLight,
  red: Colors.red,
  redLight: Colors.redLight,
  green: Colors.green,
  greenLight: Colors.greenLight,
  gray: Colors.gray,
  grayLight: Colors.grayLight,
};

const darkTheme: ThemeColors = {
  primary: '#34D178',
  primaryLight: '#5AE496',
  primaryDark: '#1F7A4D',
  primaryVeryLight: '#1A2E23',
  accentMint: '#1A3D2C',
  background: '#0F1A14',
  card: '#1A2E23',
  surface: '#223829',
  text: '#F0F7F3',
  textSecondary: '#A3BFB0',
  textTertiary: '#6B8578',
  border: '#2D4A38',
  blue: '#60A5FA',
  blueLight: '#1E3A5F',
  orange: '#FBBF24',
  orangeLight: '#3D3014',
  red: '#F87171',
  redLight: '#3D1C1C',
  green: '#34D399',
  greenLight: '#1A3D2C',
  gray: '#9CA3AF',
  grayLight: '#1F2937',
};

interface ThemeContextValue {
  mode: Mode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const contextValue: ThemeContextValue = {
    mode,
    colors: mode === 'light' ? lightTheme : darkTheme,
    isDark: mode === 'dark',
    toggleTheme,
    setMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
export type { ThemeColors, Mode };
