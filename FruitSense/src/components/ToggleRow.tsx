import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { textStyles } from '../constants/typography';

interface ToggleRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: Colors.primaryVeryLight }]}>
        <Icon name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={Colors.white}
        ios_backgroundColor={Colors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...textStyles.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  subtitle: {
    ...textStyles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default ToggleRow;
