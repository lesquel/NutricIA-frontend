/**
 * Shared API response types.
 */

/* ─── Auth ─── */
export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  calorie_goal: number;
  water_goal_ml: number;
  dietary_preferences: string[];
};

/* ─── Meals ─── */
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type ScanResult = {
  food_name: string;
  description: string;
  estimated_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: number;
  tags: string[];
};

export type MealResponse = {
  id: string;
  food_name: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  meal_type: MealType;
  tags: string[];
  image_url: string | null;
  created_at: string;
};

/* ─── Habits ─── */
export type PlantState = 'healthy' | 'growing' | 'wilted';

export type HabitResponse = {
  id: string;
  name: string;
  description: string;
  frequency_days: number;
  plant_type: string;
  plant_state: PlantState;
  level: number;
  progress: number;
  streak: number;
  is_checked_today: boolean;
  created_at: string;
};

export type WaterLogResponse = {
  cups: number;
  goal_ml: number;
  date: string;
};

/* ─── Analytics ─── */
export type DailySummary = {
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  meal_count: number;
};

export type WeeklySummary = {
  daily_summaries: Record<string, DailySummary>;
  average: {
    avg_calories: number;
    avg_protein_g: number;
    avg_carbs_g: number;
    avg_fat_g: number;
  };
};
