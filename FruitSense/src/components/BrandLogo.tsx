import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet } from 'react-native';
import { spacing } from '../constants/spacing';

interface BrandLogoProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 96, style }) => {
  return (
    <Image
      source={require('../assets/Logo.png')}
      style={[
        styles.image,
        {
          width: size,
          height: size,
          marginBottom: spacing.lg,
        },
        style,
      ]}
      resizeMode="contain"
      accessible
      accessibilityLabel="TropicStore logo"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});

export default BrandLogo;
