import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { FontSize, BorderRadius } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useCreateHabit } from '../hooks/use-garden';
import { PLANT_EMOJI, PLANT_TYPES } from '../constants';

interface CreateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  colors: ThemeColors;
  initialName?: string;
  initialPlantType?: string;
}

export function CreateHabitModal({
  visible,
  onClose,
  colors,
  initialName = '',
  initialPlantType,
}: CreateHabitModalProps) {
  const { t } = useTranslation();
  const createHabit = useCreateHabit();
  const [name, setName] = useState(initialName);
  const [plantType, setPlantType] = useState(
    initialPlantType ?? PLANT_TYPES[0],
  );
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      setName(initialName);
      setPlantType(initialPlantType ?? PLANT_TYPES[0]);
      setError(null);
    }
  }, [visible, initialName, initialPlantType]);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    createHabit.mutate(
      { name: trimmed, plant_type: plantType },
      {
        onSuccess: () => {
          setName('');
          onClose();
        },
        onError: () => setError(t('tabs.garden.createHabitError')),
      },
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {t('tabs.garden.createHabitTitle')}
          </Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t('tabs.garden.createHabitName')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('tabs.garden.createHabitNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            maxLength={60}
            autoFocus
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>
            {t('tabs.garden.createHabitPlant')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plantRow}
          >
            {PLANT_TYPES.map((type) => {
              const selected = type === plantType;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPlantType(type)}
                  style={[
                    styles.plantChip,
                    {
                      backgroundColor: selected ? colors.primary + '22' : colors.background,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.plantEmoji}>{PLANT_EMOJI[type]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {error !== null && (
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
              disabled={createHabit.isPending}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>
                {t('tabs.garden.createHabitCancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.button,
                styles.submitButton,
                {
                  backgroundColor: name.trim()
                    ? colors.primary
                    : colors.primary + '66',
                },
              ]}
              activeOpacity={0.7}
              disabled={!name.trim() || createHabit.isPending}
            >
              {createHabit.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>
                  {t('tabs.garden.createHabitSubmit')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.base,
  },
  plantRow: {
    gap: 10,
    paddingVertical: 4,
  },
  plantChip: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantEmoji: {
    fontSize: 26,
  },
  errorText: {
    fontSize: FontSize.sm,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {},
  cancelText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
