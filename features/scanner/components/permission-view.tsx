/**
 * Camera permission prompt — shown when camera access is not granted.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, FontSize } from '@/constants/theme';

type Props = {
  onRequestPermission: () => void;
};

export function PermissionView({ onRequestPermission }: Props) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="photo-camera" size={64} color="#FFF" />
      <Text style={styles.title}>Camera Access Required</Text>
      <Text style={styles.text}>
        NutricIA needs camera access to scan your meals and analyze nutritional
        content.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onRequestPermission}>
        <Text style={styles.buttonText}>Grant Access</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  title: {
    color: '#FFF',
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginTop: 16,
  },
  text: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
