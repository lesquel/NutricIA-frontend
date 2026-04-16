/**
 * Shared API response types.
 */

/* ─── Auth ─── */

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
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

/* ─── Chat ─── */

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: ChatMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface MacrosPerServing {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface RecipeCard {
  name: string;
  ingredients: string[];
  macros_per_serving: MacrosPerServing;
  cook_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  steps: string[];
}

export type ChatSSEEvent =
  | { type: 'token'; content: string }
  | { type: 'recipe_card'; data: RecipeCard }
  | { type: 'done'; conversation_id: string; message_id: string }
  | { type: 'error'; message: string };

export interface SendMessageRequest {
  content: string;
  conversation_id?: string;
}

/* ─── Meal Plans ─── */

export type MealPlanStatus = 'active' | 'archived' | 'completed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Macros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface PlannedMeal {
  id: string;
  plan_id: string;
  day_of_week: number; // 0..6 (Mon..Sun)
  meal_type: MealType;
  recipe_name: string;
  recipe_ingredients: string[];
  calories: number;
  macros: Macros;
  cook_time_minutes: number | null;
  difficulty: Difficulty | null;
  servings: number;
  is_logged: boolean;
  logged_meal_id: string | null;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string; // ISO date
  target_calories: number;
  target_macros: Macros;
  status: MealPlanStatus;
  approximation: boolean;
  meals: PlannedMeal[];
}

export interface DietaryConstraints {
  vegetarian: boolean;
  vegan: boolean;
  gluten_free: boolean;
  allergies: string[];
}

export interface GeneratePlanRequest {
  target_calories: number;
  target_macros: Macros;
  constraints: DietaryConstraints;
  week_start?: string;
}

export interface LogMealResponse {
  meal_id: string;
  planned_meal_id: string;
  already_logged: boolean;
}

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
