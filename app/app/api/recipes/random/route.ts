
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateSpiciness, checkAllergens, formatRecipeText } from '@/lib/utils';

const prisma = new PrismaClient();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Helper function to process Spoonacular nutrition data
function processNutritionData(spoonacularNutrition: any): any {
  if (!spoonacularNutrition?.nutrients) {
    return null;
  }

  const nutrients = spoonacularNutrition.nutrients;
  const nutritionMap: { [key: string]: number } = {};

  nutrients.forEach((nutrient: any) => {
    const name = nutrient.name?.toLowerCase();
    const amount = parseFloat(nutrient.amount) || 0;

    if (name?.includes('calories')) {
      nutritionMap.calories = amount;
    } else if (name?.includes('protein')) {
      nutritionMap.protein = amount;
    } else if (name?.includes('fat') && !name.includes('saturated')) {
      nutritionMap.fat = amount;
    } else if (name?.includes('carbohydrates') && !name.includes('net')) {
      nutritionMap.carbohydrates = amount;
    } else if (name?.includes('fiber')) {
      nutritionMap.fiber = amount;
    } else if (name?.includes('sugar')) {
      nutritionMap.sugar = amount;
    } else if (name?.includes('sodium')) {
      nutritionMap.sodium = amount;
    } else if (name?.includes('cholesterol')) {
      nutritionMap.cholesterol = amount;
    }
  });

  return nutritionMap;
}

// Rate limiting - simple in-memory cache
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitCache.has(ip)) {
    rateLimitCache.set(ip, []);
  }
  
  const requests = rateLimitCache.get(ip).filter((time: number) => time > windowStart);
  rateLimitCache.set(ip, requests);
  
  if (requests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  requests.push(now);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.ip || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const count = Math.min(parseInt(searchParams.get('count') || '20'), 100); // INCREASED: Allow more recipes for better variety
    const tags = searchParams.get('tags') || '';
    
    // Advanced filtering parameters
    const diet = searchParams.get('diet') || '';
    const intolerances = searchParams.get('intolerances') || '';
    const maxReadyTime = searchParams.get('maxReadyTime') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const type = searchParams.get('type') || '';
    const excludeIngredients = searchParams.get('excludeIngredients') || '';
    const spiciness = searchParams.get('spiciness') || '';

    // Check if we have a valid API key
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your-actual-spoonacular-api-key-here') {
      console.error('No valid Spoonacular API key found');
      return NextResponse.json({ 
        error: 'API key required',
        message: 'Please add your Spoonacular API key to the .env file. Get one free at https://spoonacular.com/food-api'
      }, { status: 401 });
    }

    // Build Spoonacular API URL with proper parameters
    const baseUrl = 'https://api.spoonacular.com/recipes/random';
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      number: count.toString(),
      includeNutrition: 'true',
      instructionsRequired: 'true',
      fillIngredients: 'true'
    });

    // Add filtering parameters if provided
    if (tags) {
      params.append('tags', tags);
    }
    
    // CRITICAL CHANGE: Don't apply strict diet/allergen filters to allow warning system to work
    // Comment out restrictive filters so users can see warning indicators on problematic recipes
    /*
    if (diet) {
      params.append('diet', diet.toLowerCase());
    }
    if (intolerances) {
      params.append('intolerances', intolerances.toLowerCase());
    }
    if (excludeIngredients) {
      params.append('excludeIngredients', excludeIngredients.toLowerCase());
    }
    */
    
    // Keep non-safety filters that don't prevent warning display
    if (maxReadyTime && parseInt(maxReadyTime) < 120) {
      params.append('maxReadyTime', maxReadyTime);
    }
    if (cuisine) {
      params.append('cuisine', cuisine.toLowerCase());
    }
    if (type) {
      params.append('type', type.toLowerCase().replace(' ', '%20'));
    }

    const spoonacularUrl = `${baseUrl}?${params.toString()}`;
    
    let spoonacularRecipes;
    
    try {
      console.log('Fetching from Spoonacular API...');
      const response = await fetch(spoonacularUrl, {
        headers: {
          'User-Agent': 'Recipe-Slot-App/1.0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Spoonacular API error: ${response.status} - ${errorText}`);
        
        if (response.status === 402) {
          throw new Error('Spoonacular API quota exceeded');
        } else if (response.status === 401) {
          throw new Error('Invalid Spoonacular API key');
        } else {
          throw new Error(`Spoonacular API error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      spoonacularRecipes = data.recipes || [];
      console.log(`Successfully fetched ${spoonacularRecipes.length} recipes from Spoonacular`);
      
    } catch (error) {
      console.error('Spoonacular API error:', error);
      
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Unknown API error',
        message: 'Failed to fetch recipes from Spoonacular. Check your API key and quota.'
      }, { status: 503 });
    }

    // PROPER RECIPE PROCESSING WITH FULL DATA STRUCTURE
    console.log(`Processing ${spoonacularRecipes.length} recipes from Spoonacular...`);
    const recipes = [];
    
    for (const spoonacularRecipe of spoonacularRecipes) {
      try {
        console.log(`Processing recipe: ${spoonacularRecipe.title} (ID: ${spoonacularRecipe.id})`);
        
        // Validate required fields
        if (!spoonacularRecipe.id || !spoonacularRecipe.title) {
          console.warn('Skipping recipe with missing required fields:', spoonacularRecipe.title);
          continue;
        }

        // Check if recipe already exists in database
        let recipe = await prisma.recipe.findUnique({
          where: { spoonacularId: spoonacularRecipe.id }
        });

        if (!recipe) {
          // Process ingredients with proper formatting
          const rawIngredients = spoonacularRecipe.extendedIngredients || [];
          const processedIngredients = rawIngredients.map((ing: any) => ({
            id: ing.id || Math.floor(Math.random() * 1000000),
            name: (ing.name || 'Unknown ingredient').toLowerCase().trim(),
            amount: parseFloat(ing.amount) || 1,
            unit: (ing.unit || '').trim(),
            originalString: (ing.original || ing.name || 'Unknown ingredient').trim()
          }));

          // Calculate proper spiciness based on ingredients
          const spiciness = calculateSpiciness(processedIngredients);
          
          // Enhanced allergen detection
          const detectedAllergens = checkAllergens(processedIngredients, [
            'dairy', 'nuts', 'gluten', 'eggs', 'shellfish', 'fish', 'soy'
          ]);
          
          // Check for dietary compatibility  
          const dietaryMismatches: string[] = [];
          const recipeIngredients = processedIngredients.map((ing: any) => ing.name.toLowerCase());
          
          // Meat detection for vegetarian/vegan checks
          const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'meat', 'bacon', 'ham', 'sausage', 'fish', 'salmon', 'tuna', 'shrimp', 'crab'];
          const hasMeat = recipeIngredients.some((ing: string) => 
            meatKeywords.some(meat => ing.includes(meat))
          );
          
          const hasDairy = detectedAllergens.includes('dairy') || 
            recipeIngredients.some((ing: string) => 
              ['milk', 'cheese', 'butter', 'cream', 'yogurt'].some(dairy => ing.includes(dairy))
            );
          
          const hasEggs = detectedAllergens.includes('eggs') ||
            recipeIngredients.some((ing: string) => ing.includes('egg'));
          
          if (hasMeat) {
            dietaryMismatches.push('Vegetarian', 'Vegan');
          } else if (hasDairy || hasEggs) {
            dietaryMismatches.push('Vegan');
          }

          // Process nutrition data properly
          const nutrition = processNutritionData(spoonacularRecipe.nutrition);

          // Format summary and instructions properly using utils
          const formattedSummary = spoonacularRecipe.summary ? 
            formatRecipeText(spoonacularRecipe.summary, 'summary') : 
            `Delicious ${spoonacularRecipe.title} recipe with ${processedIngredients.length} ingredients.`;
          
          const formattedInstructions = spoonacularRecipe.instructions ? 
            formatRecipeText(spoonacularRecipe.instructions, 'instructions') :
            'Recipe instructions will be available when you view the full recipe details.';

          // Create temporary recipe object for this session (skip database for now)
          recipe = {
            id: spoonacularRecipe.id,
            spoonacularId: spoonacularRecipe.id,
            title: spoonacularRecipe.title,
            image: spoonacularRecipe.image || 'https://i.pinimg.com/originals/a2/3f/66/a23f6681c77152c0ed650ed8e0886e8c.jpg',
            readyInMinutes: spoonacularRecipe.readyInMinutes || 30,
            servings: spoonacularRecipe.servings || 4,
            sourceUrl: spoonacularRecipe.sourceUrl || '',
            summary: formattedSummary,
            instructions: formattedInstructions,
            ingredients: processedIngredients,
            nutrition: nutrition,
            spiciness,
            allergens: detectedAllergens,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any;

          // Add computed properties for UI compatibility
          (recipe as any).detectedAllergens = detectedAllergens;
          (recipe as any).dietaryMismatches = dietaryMismatches;
          (recipe as any).hasAllergenWarning = detectedAllergens.length > 0;
          (recipe as any).hasDietaryWarning = dietaryMismatches.length > 0;
          (recipe as any).ingredients = processedIngredients;

          console.log(`Processed recipe: ${recipe?.title} (Spiciness: ${spiciness}, Allergens: ${detectedAllergens.join(', ') || 'None'})`);
        } else {
          // Recipe exists, add computed properties
          if (recipe) {
            (recipe as any).detectedAllergens = recipe.allergens || [];
            (recipe as any).dietaryMismatches = []; // Could be computed from existing data
            (recipe as any).hasAllergenWarning = (recipe.allergens?.length || 0) > 0;
            (recipe as any).hasDietaryWarning = false; // Could be computed
            (recipe as any).ingredients = []; // No ingredients for existing recipes for now
            
            console.log(`Found existing recipe: ${recipe.title}`);
          }
        }

        if (recipe) {
          recipes.push(recipe);
        }
      } catch (error) {
        console.error('Error processing recipe:', spoonacularRecipe?.title || 'Unknown recipe', error);
        continue;
      }
    }

    console.log(`Successfully processed ${recipes.length} recipes`);

    // PROPER SPICE LEVEL FILTERING IMPLEMENTATION
    let filteredRecipes = [...recipes];
    
    // Apply spice level filtering based on user preferences
    if (spiciness && spiciness !== '6') { // 6 = Any level
      const maxSpiciness = parseInt(spiciness);
      console.log(`Applying spice level filter: max ${maxSpiciness}`);
      
      filteredRecipes = filteredRecipes.filter(recipe => {
        if (!recipe) return false;
        const recipeSpiciness = recipe.spiciness || 0;
        const passesFilter = recipeSpiciness <= maxSpiciness;
        
        if (!passesFilter) {
          console.log(`Filtered out ${recipe.title} - too spicy (${recipeSpiciness} > ${maxSpiciness})`);
        }
        
        return passesFilter;
      });
      
      console.log(`After spice filtering: ${filteredRecipes.length} recipes remaining`);
    }
    
    // Apply additional filtering based on user allergens (safety priority)
    if (intolerances) {
      const allergenList = intolerances.toLowerCase().split(',').map(a => a.trim());
      console.log(`Applying allergen filtering for: ${allergenList.join(', ')}`);
      
      filteredRecipes = filteredRecipes.filter(recipe => {
        if (!recipe) return false;
        const recipeAllergens = (recipe.allergens || []).map(a => a.toLowerCase());
        const hasConflict = allergenList.some(allergen => 
          recipeAllergens.includes(allergen)
        );
        
        if (hasConflict) {
          console.log(`Filtered out ${recipe.title} - contains allergens: ${recipeAllergens.join(', ')}`);
        }
        
        return !hasConflict;
      });
      
      console.log(`After allergen filtering: ${filteredRecipes.length} recipes remaining`);
    }
    
    // Apply dietary filtering if specified
    if (diet) {
      const dietTypes = diet.toLowerCase().split(',').map(d => d.trim());
      console.log(`Applying dietary filtering for: ${dietTypes.join(', ')}`);
      
      filteredRecipes = filteredRecipes.filter(recipe => {
        if (!recipe) return false;
        const mismatches = (recipe as any).dietaryMismatches || [];
        const hasConflict = dietTypes.some((dietType: string) => 
          mismatches.some((mismatch: string) => mismatch.toLowerCase().includes(dietType))
        );
        
        if (hasConflict) {
          console.log(`Filtered out ${recipe.title} - dietary conflict with ${dietTypes.join(', ')}`);
        }
        
        return !hasConflict;
      });
      
      console.log(`After dietary filtering: ${filteredRecipes.length} recipes remaining`);
    }
    
    console.log(`Returning ${filteredRecipes.length} properly filtered recipes`);
    
    return NextResponse.json({ 
      recipes: filteredRecipes,
      source: 'spoonacular',
      count: filteredRecipes.length,
      totalFound: recipes.length,
      filtered: recipes.length - filteredRecipes.length,
      filtersApplied: {
        diet,
        intolerances,
        maxReadyTime,
        cuisine,
        type,
        excludeIngredients,
        spiciness: spiciness !== '6' ? spiciness : null
      }
    });
    
  } catch (error) {
    console.error('Error in random recipes API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recipes',
        message: 'Server error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}
