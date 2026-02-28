import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, FontSize, BorderRadius, Shadows } from '@/constants/theme';
import { useScanFood, useSaveMeal } from '@/features/scanner/hooks/use-scan-food';
import type { ScanResult, MealType } from '@/shared/types/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIEWFINDER_SIZE = 280;

const MEAL_TYPE_OPTIONS: { value: MealType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { value: 'breakfast', label: 'Breakfast', icon: 'wb-sunny' },
  { value: 'lunch', label: 'Lunch', icon: 'light-mode' },
  { value: 'snack', label: 'Snack', icon: 'cookie' },
  { value: 'dinner', label: 'Dinner', icon: 'nightlight-round' },
];

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const scanFood = useScanFood();
  const saveMeal = useSaveMeal();

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [showResults, setShowResults] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <MaterialIcons name="photo-camera" size={64} color="#FFF" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          NutricIA needs camera access to scan your meals and analyze nutritional content.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo?.uri) return;
      setPhotoUri(photo.uri);

      // Auto-detect meal type by time of day
      const hour = new Date().getHours();
      if (hour < 11) setSelectedMealType('breakfast');
      else if (hour < 15) setSelectedMealType('lunch');
      else if (hour < 18) setSelectedMealType('snack');
      else setSelectedMealType('dinner');

      scanFood.mutate(photo.uri, {
        onSuccess: (result) => {
          setScanResult(result);
          setShowResults(true);
        },
        onError: () => {
          Alert.alert('Scan Failed', 'Could not analyze the image. Please try again.');
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handleSave = () => {
    if (!scanResult) return;

    saveMeal.mutate(
      {
        food_name: scanResult.food_name,
        description: scanResult.description,
        calories: scanResult.estimated_calories,
        protein_g: scanResult.protein_g,
        carbs_g: scanResult.carbs_g,
        fat_g: scanResult.fat_g,
        fiber_g: scanResult.fiber_g,
        meal_type: selectedMealType,
        tags: scanResult.tags,
        image_url: photoUri ?? undefined,
      },
      {
        onSuccess: () => {
          setShowResults(false);
          setScanResult(null);
          setPhotoUri(null);
          Alert.alert('Saved!', 'Meal has been logged to your journal.', [
            { text: 'OK' },
          ]);
        },
        onError: () => {
          Alert.alert('Error', 'Failed to save meal. Please try again.');
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flash}
      />

      {/* Gradient overlay */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.scannerPill}>
          <MaterialIcons name="auto-awesome" size={14} color="#FFF" />
          <Text style={styles.scannerPillText}>AI SCANNER</Text>
        </View>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setFlash(!flash)}
        >
          <MaterialIcons
            name={flash ? 'flash-on' : 'flash-off'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderContainer}>
        <View style={styles.viewfinder}>
          {/* 4 corner accents */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {scanFood.isPending ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <MaterialIcons name="center-focus-weak" size={48} color="rgba(255,255,255,0.4)" />
          )}
        </View>
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>
            {scanFood.isPending ? 'Analyzing food...' : 'Align food within frame'}
          </Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.captureButton, scanFood.isPending && { opacity: 0.5 }]}
          onPress={handleCapture}
          activeOpacity={0.7}
          disabled={scanFood.isPending}
        >
          <View style={styles.captureOuter}>
            <View style={styles.captureInner} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualEntry}>
          <MaterialIcons name="keyboard" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.manualText}>Or type manually</Text>
        </TouchableOpacity>
      </View>

      {/* Results Modal */}
      <Modal visible={showResults} transparent animationType="slide">
        <View style={styles.resultOverlay}>
          <View style={styles.resultSheet}>
            <View style={styles.resultHandle} />

            {scanResult && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.resultTitle}>{scanResult.food_name}</Text>
                <Text style={styles.resultDesc}>{scanResult.description}</Text>

                <View style={styles.resultConfidence}>
                  <MaterialIcons name="auto-awesome" size={16} color={Colors.light.primary} />
                  <Text style={styles.resultConfidenceText}>
                    {Math.round(scanResult.confidence * 100)}% confidence
                  </Text>
                </View>

                {/* Nutrition Grid */}
                <View style={styles.nutriGrid}>
                  <View style={styles.nutriItem}>
                    <Text style={styles.nutriValue}>{scanResult.estimated_calories}</Text>
                    <Text style={styles.nutriLabel}>kcal</Text>
                  </View>
                  <View style={styles.nutriItem}>
                    <Text style={styles.nutriValue}>{scanResult.protein_g}g</Text>
                    <Text style={styles.nutriLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutriItem}>
                    <Text style={styles.nutriValue}>{scanResult.carbs_g}g</Text>
                    <Text style={styles.nutriLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutriItem}>
                    <Text style={styles.nutriValue}>{scanResult.fat_g}g</Text>
                    <Text style={styles.nutriLabel}>Fat</Text>
                  </View>
                </View>

                {/* Meal Type Selector */}
                <Text style={styles.mealTypeLabel}>Log as:</Text>
                <View style={styles.mealTypeRow}>
                  {MEAL_TYPE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.mealTypeBtn,
                        selectedMealType === opt.value && styles.mealTypeBtnActive,
                      ]}
                      onPress={() => setSelectedMealType(opt.value)}
                    >
                      <MaterialIcons
                        name={opt.icon}
                        size={18}
                        color={selectedMealType === opt.value ? '#FFF' : '#666'}
                      />
                      <Text
                        style={[
                          styles.mealTypeBtnText,
                          selectedMealType === opt.value && { color: '#FFF' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tags */}
                {scanResult.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {scanResult.tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.resultCancelBtn}
                    onPress={() => { setShowResults(false); setScanResult(null); }}
                  >
                    <Text style={styles.resultCancelText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resultSaveBtn, saveMeal.isPending && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={saveMeal.isPending}
                  >
                    {saveMeal.isPending ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.resultSaveText}>Save Meal</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    marginTop: 16,
  },
  permissionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.15,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scannerPillText: {
    color: '#FFF',
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.8,
  },
  viewfinderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  viewfinder: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#FFF',
  },
  cornerTL: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  hintPill: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  hintText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: FontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 28,
    zIndex: 10,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureOuter: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
  manualEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    fontWeight: '500',
  },

  // Result Modal
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  resultSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  resultHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  resultDesc: {
    fontSize: FontSize.base,
    color: '#666',
    marginBottom: 12,
  },
  resultConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  resultConfidenceText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  nutriGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  nutriItem: { alignItems: 'center', flex: 1 },
  nutriValue: { fontSize: FontSize.xl, fontWeight: '700', color: '#1a1a2e' },
  nutriLabel: { fontSize: FontSize.xs, color: '#888', marginTop: 2 },
  mealTypeLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  mealTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  mealTypeBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  mealTypeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#666',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagChip: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  tagChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resultCancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  resultCancelText: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: '#666',
  },
  resultSaveBtn: {
    flex: 2,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
  },
  resultSaveText: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: '#FFF',
  },
});
