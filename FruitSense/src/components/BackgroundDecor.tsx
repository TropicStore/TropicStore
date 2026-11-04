import React, { ReactNode } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Colors } from '../constants/colors';

const { height } = Dimensions.get('window');

interface BackgroundDecorProps {
  children?: ReactNode;
}

export const BackgroundDecor: React.FC<BackgroundDecorProps> = ({ children }) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.gradientWrapper} />
      <View style={[styles.circle, styles.circleTopRight]} />
      <View style={[styles.circle, styles.circleBottomLeft]} />
      {children ? <View style={styles.content}>{children}</View> : null}
    </View>
  );
};

export default BackgroundDecor;

const CIRCLE_SIZE = 200;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  gradientWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.45,
    backgroundColor: Colors.primaryVeryLight,
    opacity: 0.6,
  },
  circle: {
    position: 'absolute',
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.accentMint,
    opacity: 0.3,
  },
  circleTopRight: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    top: -CIRCLE_SIZE * 0.6,
    right: -CIRCLE_SIZE * 0.5,
  },
  circleBottomLeft: {
    width: 160,
    height: 160,
    bottom: 100,
    left: -50,
  },
});
