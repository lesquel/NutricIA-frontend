/**
 * Garden — shared constants.
 *
 * Centralized so the screen, PlantCard, and the new-habit modal
 * all pick from the same emoji vocabulary.
 */

export const PLANT_EMOJI: Record<string, string> = {
  fern: '🌿',
  palm: '🌱',
  mint: '🍃',
  cactus: '🌵',
  flower: '🌸',
  sunflower: '🌻',
  tree: '🌳',
  herb: '🌾',
  default: '🌱',
};

export const PLANT_TYPES: readonly string[] = [
  'fern',
  'palm',
  'mint',
  'cactus',
  'flower',
  'sunflower',
  'tree',
  'herb',
];

export interface HabitSuggestion {
  /** Translation key under `tabs.garden.suggestions.<id>.name`. */
  id: string;
  plantType: string;
  icon: string;
}

export const HABIT_SUGGESTIONS: readonly HabitSuggestion[] = [
  { id: 'walk', plantType: 'fern', icon: '🚶' },
  { id: 'sleep', plantType: 'flower', icon: '😴' },
  { id: 'meditate', plantType: 'mint', icon: '🧘' },
  { id: 'read', plantType: 'tree', icon: '📖' },
];
