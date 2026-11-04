import { Platform, TextStyle } from 'react-native';

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

export const textStyles = {
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.bold,
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.bold,
    lineHeight: 30,
  } as TextStyle,

  h3: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.semibold,
    lineHeight: 26,
  } as TextStyle,

  h4: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.semibold,
    lineHeight: 22,
  } as TextStyle,

  body: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
  } as TextStyle,

  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.regular,
    lineHeight: 18,
  } as TextStyle,

  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    fontFamily: fontFamily.regular,
    lineHeight: 15,
  } as TextStyle,

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    fontFamily: fontFamily.medium,
    lineHeight: 18,
  } as TextStyle,

  button: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    fontFamily: fontFamily.semibold,
    lineHeight: 20,
  } as TextStyle,

  value: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    fontFamily: fontFamily.bold,
    lineHeight: 40,
  } as TextStyle,
};
