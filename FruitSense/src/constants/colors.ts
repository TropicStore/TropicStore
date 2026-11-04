export const Colors = {
  primary: '#1F7A4D',
  primaryLight: '#2E9D62',
  primaryDark: '#165C38',
  primaryVeryLight: '#E8F5EC',

  accentMint: '#D4F0E0',

  white: '#FFFFFF',
  background: '#F2F7F4',
  card: '#FFFFFF',

  textPrimary: '#1A2E23',
  textSecondary: '#5A7267',
  textTertiary: '#8A9E94',

  border: '#E0EBE5',

  blue: '#3B82F6',
  blueLight: '#DBEAFE',

  orange: '#F59E0B',
  orangeLight: '#FEF3C7',

  red: '#EF4444',
  redLight: '#FEE2E2',

  green: '#10B981',
  greenLight: '#D1FAE5',

  infoBlue: '#3B82F6',

  gray: '#6B7280',
  grayLight: '#F3F4F6',
} as const;

export type ColorKey = keyof typeof Colors;
