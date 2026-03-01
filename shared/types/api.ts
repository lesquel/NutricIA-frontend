/**
 * Shared API response types.
 */

/* ─── Auth ─── */
export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserProfile;
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
  name: string;
  ingredients: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
  tags: string[];
};

export type MealResponse = {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_type: MealType;
  confidence_score: number;
  tags: string[];
  image_url: string | null;
  logged_at: string;
  created_at: string;
};

export type MealListResponse = {
  meals: MealResponse[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
};

/* ─── Habits ─── */
export type PlantState = 'healthy' | 'growing' | 'wilted';

export type HabitResponse = {
  id: string;
  name: string;
  description?: string;
  frequency_days?: number;
  icon?: string;
  plant_type: string;
  plant_state: PlantState;
  level: number;
  progress?: number;
  progress_percentage?: number;
  streak?: number;
  streak_days?: number;
  is_checked_today?: boolean;
  checked_today?: boolean;
  created_at?: string;
};

export type WaterLogResponse = {
  cups: number;
  goal_cups: number;
  date: string;
};

/* ─── Analytics ─── */
export type DailySummary = {
  date?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_protein_g?: number;
  total_carbs_g?: number;
  total_fat_g?: number;
  meal_count: number;
  calorie_goal?: number;
  goal_percentage?: number;
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
