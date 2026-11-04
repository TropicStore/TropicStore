import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: string;
  onRightPress?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  transparent?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  rightIcon,
  onRightPress,
  showBack,
  onBack,
  transparent,
}) => {
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, transparent && styles.safeAreaTransparent]}
    >
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}

        <View style={styles.titleContainer}>
          <Text style={textStyles.h3} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.rightButton}
            activeOpacity={0.7}
          >
            <Icon name={rightIcon} size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightButtonPlaceholder} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.background,
  },
  safeAreaTransparent: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryVeryLight,
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryVeryLight,
  },
  rightButtonPlaceholder: {
    width: 40,
    height: 40,
  },
});

export default AppHeader;
