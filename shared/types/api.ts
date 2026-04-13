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
  icon: string;
  plant_type: string;
  level: number;
  streak_days: number;
  plant_state: PlantState;
  progress_percentage: number;
  checked_today: boolean;
};

export type HabitCheckInResponse = {
  habit_id: string;
  checked_at: string;
  new_streak: number;
  new_level: number;
};

export type WaterLogResponse = {
  cups: number;
  goal_cups: number;
  date: string;
};

/* ─── Analytics ─── */
export type DailySummary = {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_count: number;
  calorie_goal: number;
  goal_percentage: number;
};

export type WeeklySummary = {
  week_start: string;
  week_end: string;
  daily_averages: {
    avg_calories: number;
    avg_protein: number;
    avg_carbs: number;
    avg_fat: number;
  };
  days: DailySummary[];
};
