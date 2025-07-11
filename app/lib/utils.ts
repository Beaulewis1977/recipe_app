
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Ingredient } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Spiciness calculation based on ingredients (returns 0-5 scale)
export function calculateSpiciness(ingredients: Ingredient[]): number {
  const spicyKeywords = [
    // Level 1 - Mild
    { keywords: ['black pepper', 'white pepper', 'paprika', 'ginger', 'turmeric'], level: 1 },
    // Level 2 - Mild-Medium  
    { keywords: ['cumin', 'mustard', 'mild chili', 'bell pepper'], level: 2 },
    // Level 3 - Medium
    { keywords: ['jalapeño', 'chipotle', 'chili powder', 'curry', 'red pepper flakes'], level: 3 },
    // Level 4 - Hot
    { keywords: ['serrano', 'cayenne', 'hot sauce', 'sriracha', 'tabasco'], level: 4 },
    // Level 5 - Very Hot
    { keywords: ['habanero', 'ghost pepper', 'carolina reaper', 'scotch bonnet', 'thai chili'], level: 5 }
  ];

  let maxSpiciness = 0;
  
  ingredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    const original = ingredient.originalString.toLowerCase();
    
    spicyKeywords.forEach(({ keywords, level }) => {
      keywords.forEach(keyword => {
        if (name.includes(keyword) || original.includes(keyword)) {
          maxSpiciness = Math.max(maxSpiciness, level);
        }
      });
    });
  });

  return maxSpiciness; // Returns 0-5
}

// Check for allergens in ingredients
export function checkAllergens(ingredients: Ingredient[], userAllergens: string[]): string[] {
  const commonAllergens: Record<string, string[]> = {
    dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'mozzarella', 'parmesan', 'cheddar'],
    nuts: ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'peanut'],
    gluten: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye'],
    eggs: ['egg', 'mayonnaise'],
    shellfish: ['shrimp', 'crab', 'lobster', 'scallop', 'clam', 'oyster'],
    fish: ['salmon', 'tuna', 'cod', 'bass', 'trout'],
    soy: ['soy', 'tofu', 'soy sauce', 'miso']
  };

  const foundAllergens: string[] = [];

  userAllergens.forEach(allergen => {
    const keywords = commonAllergens[allergen.toLowerCase()] || [allergen.toLowerCase()];
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const original = ingredient.originalString.toLowerCase();
      
      keywords.forEach(keyword => {
        if ((name.includes(keyword) || original.includes(keyword)) && !foundAllergens.includes(allergen)) {
          foundAllergens.push(allergen);
        }
      });
    });
  });

  return foundAllergens;
}

// Generate random ingredients for slot machine
export function generateRandomIngredients(): string[] {
  const proteins = ['CHICKEN', 'BEEF', 'SALMON', 'TOFU', 'EGGS', 'TURKEY', 'PORK', 'SHRIMP'];
  const carbs = ['PASTA', 'RICE', 'BREAD', 'POTATO', 'QUINOA', 'NOODLES', 'TORTILLA', 'OATS'];
  const vegetables = ['TOMATO', 'ONION', 'GARLIC', 'SPINACH', 'BROCCOLI', 'CARROT', 'PEPPER', 'MUSHROOM'];
  
  return [
    carbs[Math.floor(Math.random() * carbs.length)],
    proteins[Math.floor(Math.random() * proteins.length)],
    vegetables[Math.floor(Math.random() * vegetables.length)]
  ];
}

// Format cooking time
export function formatCookTime(minutes?: number): string {
  if (!minutes) return 'Unknown';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Get spiciness emoji based on numeric level (0-5)
export function getSpicinessEmoji(spiciness: number): string {
  if (spiciness === 0) return '🌿'; // Not spicy
  
  // Generate appropriate number of pepper emojis (1-5)
  const pepperCount = Math.min(Math.max(spiciness, 0), 5);
  return '🌶️'.repeat(pepperCount);
}

// Get spiciness level name for display
export function getSpicinessName(spiciness: number): string {
  switch (spiciness) {
    case 0: return 'Not Spicy';
    case 1: return 'Mild';
    case 2: return 'Mild-Medium';
    case 3: return 'Medium';
    case 4: return 'Hot';
    case 5: return 'Very Hot';
    default: return 'Not Spicy';
  }
}

// Centralized text formatting utility for recipe descriptions and instructions
export function formatRecipeText(text: string, type: 'summary' | 'instructions' = 'summary'): string {
  if (!text) return '';

  // Step 1: Clean HTML tags and decode entities
  let cleanText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&#39;/g, "'") // Decode apostrophes
    .trim();

  // Step 2: Normalize whitespace
  cleanText = cleanText.replace(/\s+/g, ' ');

  if (type === 'summary') {
    // Summary-specific formatting
    
    // Step 3: Add proper sentence breaks for readability
    cleanText = cleanText.replace(/\. ([A-Z])/g, '.\n\n$1');
    
    // Step 4: Handle common recipe formatting patterns
    cleanText = cleanText.replace(/(\d+\.\s)/g, '\n$1'); // Number lists
    cleanText = cleanText.replace(/(Ingredients?:|Instructions?:|Method:|Preparation:|Directions?:)/gi, '\n\n$1\n'); // Section headers
    
    // Step 5: Handle cooking terminology formatting
    cleanText = cleanText.replace(/(Serves?|Prep time|Cook time|Total time):?/gi, '\n$1:'); // Recipe metadata
    
  } else if (type === 'instructions') {
    // Instructions-specific formatting
    
    // Step 3: Handle step numbering and formatting
    cleanText = cleanText.replace(/(\d+)\.\s*/g, '\n$1. '); // Ensure proper step numbering
    
    // Step 4: Add breaks for common instruction transitions
    cleanText = cleanText.replace(/\. (Then|Next|After|Meanwhile|While|When|Now|Finally)/gi, '.\n$1');
    cleanText = cleanText.replace(/(then|next|after|meanwhile|while|when|now|finally)\s+/gi, '\n$1 ');
    
    // Step 5: Handle cooking actions for better readability
    cleanText = cleanText.replace(/\. (Heat|Cook|Add|Mix|Stir|Combine|Season|Serve|Remove|Place|Pour|Blend)/gi, '.\n$1');
    
    // Step 6: Handle time and temperature mentions
    cleanText = cleanText.replace(/(\d+\s*(?:minutes?|mins?|hours?|hrs?|seconds?|secs?))/gi, '\n$1');
    cleanText = cleanText.replace(/(\d+\s*(?:degrees?|°|F|C))/gi, ' $1');
  }

  // Step 6: Clean up excessive line breaks and formatting
  cleanText = cleanText
    .replace(/\n{3,}/g, '\n\n') // Limit to double line breaks
    .replace(/^\n+|\n+$/g, '') // Remove leading/trailing breaks
    .replace(/\n\s+/g, '\n') // Remove whitespace after line breaks
    .replace(/\s+\n/g, '\n'); // Remove whitespace before line breaks

  // Step 7: Final cleanup
  cleanText = cleanText.trim();

  return cleanText;
}

// Format recipe instructions into structured steps
export function formatInstructionSteps(instructions: string): Array<{ step: number; text: string }> {
  if (!instructions) return [];

  const formattedText = formatRecipeText(instructions, 'instructions');
  
  // Try to split by numbered steps first
  let steps = formattedText.split(/\n\s*\d+\.\s*/).filter(step => step.trim());
  
  // If no numbered steps found, try splitting by line breaks
  if (steps.length <= 1) {
    steps = formattedText.split(/\n+/).filter(step => step.trim());
  }
  
  // If still only one step and it's very long, try splitting by periods
  if (steps.length === 1 && steps[0].length > 200) {
    steps = steps[0].split(/\.\s+/).filter(step => step.trim() && step.length > 10);
    // Add periods back to sentences except the last one
    steps = steps.map((step, index) => 
      index < steps.length - 1 && !step.endsWith('.') ? step + '.' : step
    );
  }
  
  // If we still have no proper steps, treat as one step
  if (steps.length === 0) {
    steps = [formattedText];
  }

  // Remove step numbers from the beginning if they exist
  return steps.map((step, index) => ({
    step: index + 1,
    text: step.trim().replace(/^\d+\.\s*/, '').trim()
  })).filter(step => step.text.length > 0);
}

// Check if text needs formatting (has HTML tags or poor formatting)
export function needsTextFormatting(text: string): boolean {
  if (!text) return false;
  
  return (
    text.includes('<') || // Has HTML tags
    text.includes('&') || // Has HTML entities
    !text.includes('\n') && text.length > 100 || // Long text without breaks
    /\d+\.\s*[A-Z]/.test(text) && !text.includes('\n') // Has numbered lists without breaks
  );
}

// Local storage utilities
// Smart unit measurement utilities for grocery lists
export function getSmartUnit(ingredientName: string, amount: number = 1, originalUnit: string = ''): { amount: number; unit: string } {
  const ingredient = ingredientName.toLowerCase().trim();
  const cleanUnit = originalUnit.toLowerCase().trim();
  
  // If there's already a meaningful unit, keep it (but improve it)
  if (cleanUnit && !['piece', 'pieces', 'item', 'items', ''].includes(cleanUnit)) {
    return { amount, unit: improveUnit(cleanUnit) };
  }
  
  // Smart unit mapping based on ingredient type
  const unitMappings = {
    // Vegetables - heads/bunches
    vegetables: {
      keywords: ['lettuce', 'cabbage', 'broccoli', 'cauliflower', 'bok choy', 'iceberg'],
      unit: 'head',
      plural: 'heads'
    },
    
    // Vegetables - bunches
    bunches: {
      keywords: ['spinach', 'kale', 'chard', 'arugula', 'basil', 'cilantro', 'parsley', 'dill', 'mint', 'scallions', 'green onions', 'asparagus'],
      unit: 'bunch',
      plural: 'bunches'
    },
    
    // Meat/Protein - pounds/ounces
    meat: {
      keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'steak', 'ground beef', 'ground turkey', 'bacon', 'ham', 'sausage'],
      unit: amount >= 1 ? 'lb' : 'oz',
      plural: amount >= 1 ? 'lbs' : 'oz'
    },
    
    // Fish - fillets or pounds
    fish: {
      keywords: ['salmon', 'tuna', 'cod', 'tilapia', 'mahi mahi', 'halibut', 'trout', 'bass', 'fish fillet'],
      unit: 'fillet',
      plural: 'fillets'
    },
    
    // Dairy - containers/cartons
    dairy: {
      keywords: ['milk', 'heavy cream', 'half and half', 'buttermilk'],
      unit: 'carton',
      plural: 'cartons'
    },
    
    // Eggs
    eggs: {
      keywords: ['egg', 'eggs'],
      unit: 'dozen',
      plural: 'dozen'
    },
    
    // Bread/Bakery
    bakery: {
      keywords: ['bread', 'baguette', 'rolls', 'bagels', 'croissants'],
      unit: 'loaf',
      plural: 'loaves'
    },
    
    // Liquids - fluid ounces/cups
    liquids: {
      keywords: ['broth', 'stock', 'wine', 'vinegar', 'oil', 'sauce', 'juice', 'water'],
      unit: amount >= 8 ? 'cup' : 'fl oz',
      plural: amount >= 8 ? 'cups' : 'fl oz'
    },
    
    // Canned goods
    canned: {
      keywords: ['canned', 'can of', 'diced tomatoes', 'tomato sauce', 'tomato paste', 'beans', 'corn', 'peas'],
      unit: 'can',
      plural: 'cans'
    },
    
    // Spices/Seasonings - small amounts
    spices: {
      keywords: ['salt', 'pepper', 'paprika', 'cumin', 'oregano', 'thyme', 'rosemary', 'sage', 'cinnamon', 'nutmeg', 'cardamom', 'turmeric', 'curry powder', 'chili powder', 'garlic powder', 'onion powder'],
      unit: amount > 0.25 ? 'tsp' : 'pinch',
      plural: amount > 0.25 ? 'tsp' : 'pinches'
    },
    
    // Rice and similar grains - measured in cups or ounces
    rice_grains: {
      keywords: ['rice', 'quinoa', 'barley', 'couscous', 'bulgur', 'millet'],
      unit: amount >= 2 ? 'cup' : 'oz',
      plural: amount >= 2 ? 'cups' : 'oz'
    },
    
    // Pasta/Noodles - typically by weight or package
    pasta: {
      keywords: ['pasta', 'noodles', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'macaroni'],
      unit: amount >= 1 ? 'lb' : 'oz',
      plural: amount >= 1 ? 'lbs' : 'oz'
    },
    
    // Flour and baking ingredients - measured by weight
    flour_baking: {
      keywords: ['flour', 'sugar', 'brown sugar', 'powdered sugar', 'baking powder', 'baking soda', 'cornstarch'],
      unit: amount >= 1 ? 'cup' : 'oz',
      plural: amount >= 1 ? 'cups' : 'oz'
    },
    
    // Oats and cereals - measured in cups or packages
    oats_cereals: {
      keywords: ['oats', 'oatmeal', 'cereal', 'granola'],
      unit: amount >= 2 ? 'cup' : 'package',
      plural: amount >= 2 ? 'cups' : 'packages'
    },
    
    // Individual items
    individual: {
      keywords: ['onion', 'garlic', 'lemon', 'lime', 'orange', 'apple', 'banana', 'potato', 'sweet potato', 'bell pepper', 'jalapeño', 'tomato', 'avocado', 'cucumber'],
      unit: 'whole',
      plural: 'whole'
    }
  };
  
  // Find the best matching category
  for (const [category, mapping] of Object.entries(unitMappings)) {
    if (mapping.keywords.some(keyword => ingredient.includes(keyword))) {
      const finalAmount = category === 'eggs' ? Math.ceil(amount / 12) : amount;
      const finalUnit = finalAmount > 1 ? mapping.plural : mapping.unit;
      
      return { 
        amount: finalAmount, 
        unit: finalUnit 
      };
    }
  }
  
  // Default fallback based on amount
  if (amount >= 1) {
    return { amount: Math.round(amount), unit: amount > 1 ? 'items' : 'item' };
  } else {
    return { amount: Math.round(amount * 16), unit: 'oz' }; // Convert to ounces for small amounts
  }
}

// Improve existing units to be more user-friendly
function improveUnit(unit: string): string {
  const unitMappings: { [key: string]: string } = {
    // Volume
    'fluid ounce': 'fl oz',
    'fluid ounces': 'fl oz',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    
    // Weight
    'pound': 'lb',
    'pounds': 'lbs',
    'ounce': 'oz',
    'ounces': 'oz',
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    
    // Common abbreviations
    'c': 'cup',
    'c.': 'cup',
    't': 'tsp',
    'T': 'tbsp',
    'pt': 'pint',
    'qt': 'quart',
    'gal': 'gallon',
    
    // Plurals
    'cups': 'cup',
    'pints': 'pint',
    'quarts': 'quart',
    'gallons': 'gallon'
  };
  
  return unitMappings[unit] || unit;
}

// Scale ingredient amounts based on serving size
export function scaleIngredientAmount(
  originalAmount: number, 
  originalServings: number, 
  targetServings: number
): { amount: number; unit: string } {
  const scaleFactor = targetServings / originalServings;
  const scaledAmount = originalAmount * scaleFactor;
  
  // Round to reasonable precision based on size
  let roundedAmount: number;
  if (scaledAmount < 0.1) {
    roundedAmount = Math.round(scaledAmount * 100) / 100; // 2 decimal places for very small amounts
  } else if (scaledAmount < 1) {
    roundedAmount = Math.round(scaledAmount * 10) / 10; // 1 decimal place for small amounts
  } else if (scaledAmount < 10) {
    roundedAmount = Math.round(scaledAmount * 4) / 4; // Quarter precision for medium amounts
  } else {
    roundedAmount = Math.round(scaledAmount); // Whole numbers for large amounts
  }
  
  return { amount: roundedAmount, unit: '' };
}

// Convert fraction strings to decimals for calculations
export function parseFraction(value: string): number {
  if (!value) return 0;
  
  const trimmed = value.trim();
  
  // Handle whole numbers
  if (!isNaN(Number(trimmed))) {
    return Number(trimmed);
  }
  
  // Handle fractions like "1/2", "3/4", etc.
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const numerator = Number(parts[0]);
      const denominator = Number(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }
  }
  
  // Handle mixed numbers like "1 1/2"
  const mixedMatch = trimmed.match(/(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (!isNaN(whole) && !isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
      return whole + (numerator / denominator);
    }
  }
  
  // Handle common fraction words
  const fractionWords: { [key: string]: number } = {
    'half': 0.5,
    'quarter': 0.25,
    'third': 0.33,
    'eighth': 0.125
  };
  
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [word, value] of Object.entries(fractionWords)) {
    if (lowerTrimmed.includes(word)) {
      return value;
    }
  }
  
  return 1; // Default fallback
}

export const localStorage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// Grocery list sorting and filtering utilities
export function sortAndFilterGroceryItems(
  items: any[],
  options: {
    searchTerm: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    showCompleted: boolean;
    filterCategories: string[];
    filterPriorities: string[];
    filterStoreSections: string[];
  },
  hiddenItems: Set<number> = new Set()
) {
  let filtered = items.filter(item => {
    // Skip hidden items (pantry items)
    if (hiddenItems.has(item.id)) return false;
    
    // Search filter
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      if (!item.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    // Completion filter
    if (!options.showCompleted && item.isCompleted) {
      return false;
    }
    
    // Category filter
    if (options.filterCategories.length > 0 && !options.filterCategories.includes(item.category || '')) {
      return false;
    }
    
    // Priority filter
    if (options.filterPriorities.length > 0 && !options.filterPriorities.includes(item.priority || 'medium')) {
      return false;
    }
    
    // Store section filter
    if (options.filterStoreSections.length > 0 && !options.filterStoreSections.includes(item.storeSection || '')) {
      return false;
    }
    
    return true;
  });

  // Sort items
  filtered.sort((a, b) => {
    let comparison = 0;
    
    switch (options.sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 2) - 
                    (priorityOrder[b.priority as keyof typeof priorityOrder] || 2);
        break;
        
      case 'alphabetical':
        comparison = a.name.localeCompare(b.name);
        break;
        
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
        
      case 'dateAdded':
        comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        break;
        
      case 'storeSection':
        const sectionOrder = [
          'entrance', 'produce', 'deli', 'bakery', 'dairy', 
          'meat', 'frozen', 'pantry', 'checkout'
        ];
        const aIndex = sectionOrder.indexOf(a.storeSection || '');
        const bIndex = sectionOrder.indexOf(b.storeSection || '');
        comparison = (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        break;
        
      default:
        comparison = 0;
    }
    
    return options.sortOrder === 'desc' ? -comparison : comparison;
  });

  return filtered;
}
