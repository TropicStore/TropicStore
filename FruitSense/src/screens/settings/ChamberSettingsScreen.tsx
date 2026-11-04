import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { chamberSource } from '../../services/chamberSource';
import { useChamberState } from '../../hooks/useChamberState';
import { useChamberData } from '../../hooks/useChamberData';
import useChamberStore from '../../store/chamberStore';
import { Colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { fontSize, fontWeight, textStyles } from '../../constants/typography';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SHADOW } from '../../utils/shadow';

type DraftKey =
  | 'targetTemperature'
  | 'temperatureTolerance'
  | 'targetHumidity'
  | 'humidityTolerance'
  | 'gasThresholdHigh'
  | 'gasThresholdLow';

interface FieldConfig {
  key: DraftKey;
  label: string;
  unit: string;
  icon: string;
  color: string;
  lightColor: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'targetTemperature',
    label: 'Target Temperature',
    unit: '°C',
    icon: 'thermometer',
    color: Colors.blue,
    lightColor: Colors.blueLight,
  },
  {
    key: 'temperatureTolerance',
    label: 'Temperature Tolerance',
    unit: '°C',
    icon: 'set-center',
    color: Colors.blue,
    lightColor: Colors.blueLight,
  },
  {
    key: 'targetHumidity',
    label: 'Target Humidity',
    unit: '%',
    icon: 'water-percent',
    color: Colors.primary,
    lightColor: Colors.primaryVeryLight,
  },
  {
    key: 'humidityTolerance',
    label: 'Humidity Tolerance',
    unit: '%',
    icon: 'set-center',
    color: Colors.primary,
    lightColor: Colors.primaryVeryLight,
  },
  {
    key: 'gasThresholdHigh',
    label: 'Gas Threshold High',
    unit: '',
    icon: 'flask',
    color: Colors.orange,
    lightColor: Colors.orangeLight,
  },
  {
    key: 'gasThresholdLow',
    label: 'Gas Threshold Low',
    unit: '',
    icon: 'flask-outline',
    color: Colors.orange,
    lightColor: Colors.orangeLight,
  },
];

type Draft = Record<DraftKey, string>;

function isValid(draft: Draft): string | null {
  const temp = Number(draft.targetTemperature);
  const tempTol = Number(draft.temperatureTolerance);
  const hum = Number(draft.targetHumidity);
  const humTol = Number(draft.humidityTolerance);
  const high = Number(draft.gasThresholdHigh);
  const low = Number(draft.gasThresholdLow);

  if (draft.targetTemperature !== '' && (Number.isNaN(temp) || temp < 0 || temp > 50)) {
    return 'Target temperature must be between 0 and 50 °C.';
  }
  if (draft.temperatureTolerance !== '' && (Number.isNaN(tempTol) || tempTol < 0)) {
    return 'Temperature tolerance must be 0 or greater.';
  }
  if (draft.targetHumidity !== '' && (Number.isNaN(hum) || hum < 0 || hum > 100)) {
    return 'Target humidity must be between 0 and 100%.';
  }
  if (draft.humidityTolerance !== '' && (Number.isNaN(humTol) || humTol < 0)) {
    return 'Humidity tolerance must be 0 or greater.';
  }
  if (draft.gasThresholdHigh !== '' && (Number.isNaN(high) || high < 0)) {
    return 'Gas threshold high must be 0 or greater.';
  }
  if (draft.gasThresholdLow !== '' && (Number.isNaN(low) || low < 0)) {
    return 'Gas threshold low must be 0 or greater.';
  }
  if (draft.gasThresholdHigh !== '' && draft.gasThresholdLow !== '' && low > high) {
    return 'Gas threshold low cannot exceed gas threshold high.';
  }
  return null;
}

export default function ChamberSettingsScreen() {
  const navigation = useNavigation();
  const { state } = useChamberState();
  const { refreshNow } = useChamberData();
  const [draft, setDraft] = useState<Draft>({
    targetTemperature: '',
    temperatureTolerance: '',
    targetHumidity: '',
    humidityTolerance: '',
    gasThresholdHigh: '',
    gasThresholdLow: '',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialize inputs from the shadow (prefer desired, fall back to reported).
  useEffect(() => {
    const settings = SHADOW.settings(state);
    setDraft((prev) => ({
      targetTemperature:
        prev.targetTemperature !== '' && prev.targetTemperature !== '__loading__'
          ? prev.targetTemperature
          : settings.targetTemperature != null
            ? String(settings.targetTemperature)
            : '',
      temperatureTolerance:
        prev.temperatureTolerance !== ''
          ? prev.temperatureTolerance
          : settings.temperatureTolerance != null
            ? String(settings.temperatureTolerance)
            : '',
      targetHumidity:
        prev.targetHumidity !== ''
          ? prev.targetHumidity
          : settings.targetHumidity != null
            ? String(settings.targetHumidity)
            : '',
      humidityTolerance:
        prev.humidityTolerance !== ''
          ? prev.humidityTolerance
          : settings.humidityTolerance != null
            ? String(settings.humidityTolerance)
            : '',
      gasThresholdHigh:
        prev.gasThresholdHigh !== ''
          ? prev.gasThresholdHigh
          : settings.gasThresholdHigh != null
            ? String(settings.gasThresholdHigh)
            : '',
      gasThresholdLow:
        prev.gasThresholdLow !== ''
          ? prev.gasThresholdLow
          : settings.gasThresholdLow != null
            ? String(settings.gasThresholdLow)
            : '',
    }));
  }, [state]);

  const setField = useCallback((key: DraftKey, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setFeedback(null);

    const validationError = isValid(draft);
    if (validationError) {
      setFeedback({ type: 'error', message: validationError });
      return;
    }

    // Only send fields the user actually changed / provided non-empty values.
    const payload: Record<string, number> = {};
    (Object.keys(draft) as DraftKey[]).forEach((key) => {
      const raw = draft[key];
      if (raw === '') {
        return;
      }
      const value = Number(raw);
      if (!Number.isNaN(value)) {
        payload[key] = value;
      }
    });

    if (Object.keys(payload).length === 0) {
      setFeedback({ type: 'error', message: 'No settings to save.' });
      return;
    }

    setSaving(true);
    try {
      const res = await chamberSource.updateSettings(payload);
      setFeedback({
        type: 'success',
        message: res?.message || 'Settings updated successfully.',
      });
      // Refetch the fresh shadow after a successful write.
      await useChamberStore.getState().refreshState();
      refreshNow();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update settings.';
      setFeedback({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }, [draft, refreshNow]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackgroundDecor />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chamber Settings</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrap}>
            <Icon name="shield-cloud-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Stored in the cloud</Text>
            <Text style={styles.infoSubtitle}>
              These settings update the device shadow through the cloud backend.
              The ESP32 picks up the changes automatically.
            </Text>
          </View>
        </View>

        {FIELDS.map((field) => (
          <View key={field.key} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: field.lightColor }]}>
                <Icon name={field.icon} size={22} color={field.color} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{field.label}</Text>
                <Text style={styles.currentValue}>
                  Current:{' '}
                  <Text style={{ color: field.color, fontWeight: fontWeight.bold }}>
                    {draft[field.key] === '' ? '--' : `${draft[field.key]}${field.unit}`}
                  </Text>
                </Text>
              </View>
            </View>
            <View style={[styles.inputWrap, { borderColor: field.color + '40' }]}>
              <TextInput
                style={styles.input}
                value={draft[field.key]}
                onChangeText={(v) => setField(field.key, v)}
                keyboardType="decimal-pad"
                placeholder="--"
                placeholderTextColor={Colors.textTertiary}
              />
              {field.unit ? <Text style={styles.unitText}>{field.unit}</Text> : null}
            </View>
          </View>
        ))}

        {feedback ? (
          <View
            style={[
              styles.feedbackBanner,
              feedback.type === 'success'
                ? styles.feedbackSuccess
                : styles.feedbackError,
            ]}
          >
            <Icon
              name={feedback.type === 'success' ? 'check-circle' : 'alert-circle'}
              size={18}
              color={feedback.type === 'success' ? Colors.green : Colors.red}
            />
            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedback.type === 'success' ? Colors.green : Colors.red,
                },
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        ) : null}

        <View style={styles.buttonSection}>
          <PrimaryButton
            title={saving ? 'Saving…' : 'Save Settings'}
            onPress={handleSave}
            fullWidth
            disabled={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.h3,
    color: Colors.textPrimary,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryVeryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    alignItems: 'flex-start',
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    ...textStyles.h4,
    color: Colors.primary,
    marginBottom: 2,
  },
  infoSubtitle: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...textStyles.h4,
    color: Colors.textPrimary,
  },
  currentValue: {
    ...textStyles.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    ...textStyles.body,
    color: Colors.textPrimary,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    fontSize: fontSize.lg,
  },
  unitText: {
    ...textStyles.caption,
    color: Colors.textTertiary,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  feedbackSuccess: {
    backgroundColor: Colors.greenLight,
  },
  feedbackError: {
    backgroundColor: Colors.redLight,
  },
  feedbackText: {
    ...textStyles.bodySmall,
    flex: 1,
  },
  buttonSection: {
    marginTop: spacing.sm,
  },
});
