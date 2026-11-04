import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { useStore } from '../../store';
import { PrimaryButton } from '../../components/PrimaryButton';

type Frequency = 'daily' | 'weekly';
type DeliveryMethod = 'push' | 'in_app' | 'both';

export default function ReportScheduleScreen() {
  const navigation = useNavigation();
  const reportSchedule = useStore((s) => s.reportSchedule);
  const updateReportSchedule = useStore((s) => s.updateReportSchedule);

  const [frequency, setFrequency] = useState<Frequency>(reportSchedule.frequency);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(reportSchedule.deliveryMethod);

  const handleSave = () => {
    updateReportSchedule({ frequency, deliveryMethod });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Schedule</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Report Frequency</Text>
          </View>
          <View style={styles.optionRow}>
            {(['daily', 'weekly'] as Frequency[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.optionButton, frequency === f && styles.optionButtonActive]}
                onPress={() => setFrequency(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, frequency === f && styles.optionTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="send" size={16} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Delivery Method</Text>
          </View>
          <View style={styles.optionRow}>
            {([
              { key: 'push' as DeliveryMethod, label: 'Push' },
              { key: 'in_app' as DeliveryMethod, label: 'In-App' },
              { key: 'both' as DeliveryMethod, label: 'Both' },
            ]).map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[
                  styles.optionButton,
                  deliveryMethod === d.key && styles.optionButtonActive,
                ]}
                onPress={() => setDeliveryMethod(d.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    deliveryMethod === d.key && styles.optionTextActive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {reportSchedule.lastReport && (
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.textTertiary} />
            <Text style={styles.infoText}>
              Last report sent: {new Date(reportSchedule.lastReport).toLocaleDateString()}
            </Text>
          </View>
        )}

        <PrimaryButton title="Save Schedule" onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...textStyles.h3, color: Colors.textPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingHorizontal: spacing.lg },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { ...textStyles.label, color: Colors.textSecondary, marginBottom: spacing.md },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  optionRow: { flexDirection: 'row', gap: spacing.sm },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optionButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { ...textStyles.label, color: Colors.textSecondary },
  optionTextActive: { color: Colors.white },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
  },
  infoText: { ...textStyles.bodySmall, color: Colors.textTertiary },
});
