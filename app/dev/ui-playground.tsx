/**
 * Dev-only UI Playground — demonstrates all UI primitives with all variants.
 * Only accessible in development (__DEV__ === true).
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { Modal } from '@/shared/components/ui/Modal';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { useToast } from '@/shared/hooks/use-toast';

if (!__DEV__) {
  throw new Error('ui-playground is only accessible in development mode');
}

export default function UIPlayground() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const toast = useToast();

  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSheet, setShowSheet] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>UI Playground</Text>

        {/* Buttons */}
        <Text style={[styles.section, { color: colors.textMuted }]}>BUTTONS</Text>
        <Button variant="primary" size="lg" onPress={() => toast.success('Primary button!')}>
          Primary lg
        </Button>
        <Button variant="secondary" size="md" onPress={() => toast.info('Secondary!')}>
          Secondary md
        </Button>
        <Button variant="ghost" size="sm" onPress={() => toast.info('Ghost!')}>
          Ghost sm
        </Button>
        <Button variant="destructive" size="md" onPress={() => toast.error('Destructive!')}>
          Destructive
        </Button>
        <Button variant="primary" size="md" loading>
          Loading state
        </Button>
        <Button
          variant="primary"
          size="md"
          leftIcon={<MaterialIcons name="spa" size={18} color="#FFF" />}
          onPress={() => toast.success('With icon!')}
        >
          With left icon
        </Button>

        {/* Inputs */}
        <Text style={[styles.section, { color: colors.textMuted }]}>INPUTS</Text>
        <Input
          label="EMAIL"
          placeholder="vos@ejemplo.com"
          value={inputValue}
          onChangeText={setInputValue}
          prefix={<MaterialIcons name="mail-outline" size={20} color={colors.textMuted} />}
        />
        <Input
          label="WITH ERROR"
          placeholder="Type something"
          value=""
          error="Este campo es requerido"
          onChangeText={() => {}}
        />
        <Input
          label="PASSWORD"
          placeholder="••••••••"
          value=""
          secureTextEntry
          onChangeText={() => {}}
          prefix={<MaterialIcons name="lock-outline" size={20} color={colors.textMuted} />}
        />
        <Input
          label="WITH HELPER"
          placeholder="Optional field"
          value=""
          helperText="This is a helper text"
          onChangeText={() => {}}
        />

        {/* Cards */}
        <Text style={[styles.section, { color: colors.textMuted }]}>CARDS</Text>
        <Card padding="md">
          <Text style={{ color: colors.text }}>Static card with padding md</Text>
        </Card>
        <Card padding="lg" elevated>
          <Text style={{ color: colors.text }}>Elevated card with padding lg</Text>
        </Card>
        <Card padding="sm" onPress={() => toast.info('Card pressed!')}>
          <Text style={{ color: colors.text }}>Pressable card (tap me)</Text>
        </Card>

        {/* Toast variants */}
        <Text style={[styles.section, { color: colors.textMuted }]}>TOASTS</Text>
        <Button variant="secondary" onPress={() => toast.success('Operación exitosa!')}>
          Success toast
        </Button>
        <Button variant="secondary" onPress={() => toast.error('Algo salió mal.')}>
          Error toast
        </Button>
        <Button variant="secondary" onPress={() => toast.info('Información importante.')}>
          Info toast
        </Button>
        <Button variant="secondary" onPress={() => toast.warning('Atención necesaria.')}>
          Warning toast
        </Button>

        {/* Modal */}
        <Text style={[styles.section, { color: colors.textMuted }]}>MODAL</Text>
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          Open Modal
        </Button>

        {/* BottomSheet */}
        <Text style={[styles.section, { color: colors.textMuted }]}>BOTTOM SHEET</Text>
        <Button variant="secondary" onPress={() => setShowSheet(true)}>
          Open Bottom Sheet
        </Button>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Modal Example"
        actions={
          <>
            <Button variant="ghost" size="sm" onPress={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onPress={() => setShowModal(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <Text style={{ color: colors.text }}>
          This is the modal body content. Tap the backdrop or Cancel to close.
        </Text>
      </Modal>

      <BottomSheet visible={showSheet} onClose={() => setShowSheet(false)} snapPoints={['40%']}>
        <Text style={[styles.sheetTitle, { color: colors.text }]}>Bottom Sheet</Text>
        <Text style={{ color: colors.textMuted, marginTop: 8 }}>
          Drag down past 50% or tap backdrop to dismiss.
        </Text>
        <Button
          variant="primary"
          size="md"
          onPress={() => setShowSheet(false)}
          style={{ marginTop: 24 }}
        >
          Cerrar
        </Button>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    marginBottom: 8,
  },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
