import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  StyleSheet,
  type ModalProps as RNModalProps,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontSize, Shadows } from '@/constants/theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  animationType?: RNModalProps['animationType'];
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  actions,
  animationType = 'fade',
}: ModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.content, { backgroundColor: colors.surface }, Shadows.soft]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}

          {children && (
            <View style={styles.body}>{children}</View>
          )}

          {actions && (
            <View style={styles.actions}>{actions}</View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
});
