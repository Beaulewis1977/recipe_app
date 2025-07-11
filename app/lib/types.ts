
export interface Recipe {
  id: number;
  spoonacularId: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  sourceUrl?: string;
  summary?: string;
  instructions?: string;
  ingredients: Ingredient[];
  nutrition?: any;
  spiciness: number; // 0 = Not Spicy, 1-5 = Spiciness levels
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  originalString: string;
}

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  extendedIngredients: SpoonacularIngredient[];
  nutrition?: any;
}

export interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface SavedRecipe {
  id: number;
  recipeId: number;
  recipe: Recipe;
  savedAt: Date;
}

export interface TriedRecipe {
  id: number;
  recipeId: number;
  recipe: Recipe;
  rating?: number;
  notes?: string;
  triedAt: Date;
}

export interface UserSettings {
  id: number;
  servingsDefault: number;
  measurementUnits: 'US' | 'Metric';
  dietaryFilters: string[];
  allergies: string[];
  maxSpiciness: number; // 0 = Not Spicy, 1-5 = Max spiciness levels, 6 = Any level
  hasSeenSwipeOverlay: boolean;
  showAllergyWarning: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PantryIngredient {
  id: number;
  name: string;
  addedAt: Date;
  lastUsedAt: Date;
}

export interface GroceryList {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  items: GroceryListItem[];
}

export interface GroceryListItem {
  id: number;
  groceryListId: number;
  groceryList?: GroceryList;
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  priority: 'high' | 'medium' | 'low';
  storeSection?: string;
  isCompleted: boolean;
  recipeId?: number;
  recipe?: Recipe;
  addedAt: Date;
}

export interface GroceryListTemplate {
  id: number;
  name: string;
  description?: string;
  items: GroceryListTemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroceryListTemplateItem {
  id: number;
  templateId: number;
  template?: GroceryListTemplate;
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  createdAt: Date;
}

export type SwipeDirection = 'left' | 'right' | 'up';

export interface SlotMachineState {
  ingredients: string[];
  isSpinning: boolean;
  currentValues: string[];
}
