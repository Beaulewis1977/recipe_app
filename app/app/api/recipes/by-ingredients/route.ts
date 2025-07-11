
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

// Rate limiting - simple in-memory cache (shared with random recipes)
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
  // Declare ingredients at function scope to avoid scoping issues
  let ingredients = '';
  
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
    ingredients = searchParams.get('ingredients') || '';
    
    // Get additional filtering parameters from URL for user preferences
    const diet = searchParams.get('diet') || '';
    const intolerances = searchParams.get('intolerances') || '';
    const maxReadyTime = searchParams.get('maxReadyTime') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const type = searchParams.get('type') || '';
    const excludeIngredients = searchParams.get('excludeIngredients') || '';
    const spiciness = searchParams.get('spiciness') || '';

    if (!ingredients) {
      return NextResponse.json({ 
        error: 'Ingredients parameter is required',
        message: 'Please provide ingredients to search for recipes.'
      }, { status: 400 });
    }

    // Check if we have a valid API key
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your-actual-spoonacular-api-key-here') {
      console.error('No valid Spoonacular API key found');
      return NextResponse.json({ 
        error: 'API key required',
        message: 'Please add your Spoonacular API key to the .env file. Get one free at https://spoonacular.com/food-api'
      }, { status: 401 });
    }

    // Build Spoonacular API URL for ingredient-based search
    const baseUrl = 'https://api.spoonacular.com/recipes/findByIngredients';
    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      ingredients: ingredients.trim(),
      number: '50', // INCREASED: Request more recipes to leverage Spoonacular's 1M+ database
      ranking: '1',
      ignorePantry: 'true',
      fillIngredients: 'true'
    });

    // Add filtering parameters if provided (user preferences)
    if (diet) {
      params.append('diet', diet.toLowerCase());
    }
    if (intolerances) {
      params.append('intolerances', intolerances.toLowerCase());
    }
    if (maxReadyTime && parseInt(maxReadyTime) < 120) {
      params.append('maxReadyTime', maxReadyTime);
    }
    if (cuisine) {
      params.append('cuisine', cuisine.toLowerCase());
    }
    if (type) {
      params.append('type', type.toLowerCase().replace(' ', '%20'));
    }
    if (excludeIngredients) {
      params.append('excludeIngredients', excludeIngredients.toLowerCase());
    }

    const spoonacularUrl = `${baseUrl}?${params.toString()}`;
    
    let spoonacularRecipes;
    
    try {
      console.log(`Searching Spoonacular for recipes with ingredients: ${ingredients}`);
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
      
      spoonacularRecipes = await response.json();
      console.log(`Found ${spoonacularRecipes.length} recipes with ingredients: ${ingredients}`);
      
    } catch (error) {
      console.error('Spoonacular API error:', error);
      
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : 'Unknown API error',
        message: 'Failed to fetch recipes from Spoonacular. Check your API key and quota.'
      }, { status: 503 });
    }

    // Get detailed information for each recipe with improved processing
    const detailedRecipes = [];
    const maxRecipes = Math.min(spoonacularRecipes.length, 25); // INCREASED: Process more recipes for better variety
    
    for (let i = 0; i < maxRecipes; i++) {
      const recipe = spoonacularRecipes[i];
      
      try {
        // Validate required fields
        if (!recipe.id || !recipe.title) {
          console.warn('Skipping recipe with missing required fields:', recipe);
          continue;
        }

        // Check if recipe already exists
        let detailedRecipe = await prisma.recipe.findUnique({
          where: { spoonacularId: recipe.id }
        });

        if (!detailedRecipe) {
          // Fetch detailed recipe info with proper error handling
          let recipeInfo;
          try {
            console.log(`Fetching details for recipe ${recipe.id}: ${recipe.title}`);
            const detailUrl = new URL(`https://api.spoonacular.com/recipes/${recipe.id}/information`);
            detailUrl.searchParams.append('apiKey', SPOONACULAR_API_KEY);
            detailUrl.searchParams.append('includeNutrition', 'true');
            
            const detailResponse = await fetch(detailUrl.toString(), {
              headers: {
                'User-Agent': 'Recipe-Slot-App/1.0'
              }
            });
            
            if (detailResponse.ok) {
              recipeInfo = await detailResponse.json();
            } else {
              throw new Error(`Failed to fetch recipe details: ${detailResponse.status}`);
            }
          } catch (error) {
            console.error(`Error fetching details for recipe ${recipe.id}:`, error);
            
            // Create fallback recipe info using available data
            const usedIngredients = recipe.usedIngredients || [];
            const missedIngredients = recipe.missedIngredients || [];
            const allIngredients = [...usedIngredients, ...missedIngredients];
            
            recipeInfo = {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              readyInMinutes: 30,
              servings: 4,
              sourceUrl: '',
              summary: `A delicious recipe featuring ${ingredients}. This recipe uses ${usedIngredients.length} of your specified ingredients.`,
              instructions: 'Detailed instructions are available from the original source. Follow standard cooking methods for this recipe.',
              extendedIngredients: allIngredients.map((ing: any, index: number) => ({
                id: ing.id || index,
                name: ing.name || ing.original || 'Unknown ingredient',
                amount: ing.amount || 1,
                unit: ing.unit || '',
                original: ing.original || ing.name || 'Unknown ingredient'
              }))
            };
          }

          // Process ingredients with better validation
          const rawIngredients = recipeInfo.extendedIngredients || [];
          const processedIngredients = rawIngredients.filter(Boolean).map((ing: any) => ({
            id: ing.id || Math.floor(Math.random() * 1000000),
            name: (ing.name || ing.nameClean || ing.original || 'Unknown ingredient').toLowerCase().trim(),
            amount: typeof ing.amount === 'number' ? ing.amount : (parseFloat(ing.amount) || 1),
            unit: (ing.unit || ing.unitShort || '').toLowerCase().trim(),
            originalString: ing.original || ing.name || 'Unknown ingredient'
          }));

          // Extract instructions properly
          let instructions = '';
          if (recipeInfo.instructions) {
            instructions = recipeInfo.instructions;
          } else if (recipeInfo.analyzedInstructions && recipeInfo.analyzedInstructions.length > 0) {
            instructions = recipeInfo.analyzedInstructions[0].steps
              ?.map((step: any) => `${step.number}. ${step.step}`)
              .join('\n') || '';
          }

          // Clean up summary (remove HTML tags)
          const cleanSummary = recipeInfo.summary 
            ? recipeInfo.summary.replace(/<[^>]*>/g, '').trim()
            : `Delicious ${recipeInfo.title} recipe featuring ${ingredients}.`;

          // Calculate derived properties
          const spiciness = calculateSpiciness(processedIngredients);
          const allergens = checkAllergens(processedIngredients, ['dairy', 'nuts', 'gluten', 'eggs', 'shellfish', 'fish', 'soy']);

          // Ensure image URL is valid or use placeholder
          const imageUrl = recipeInfo.image && recipeInfo.image.startsWith('http') 
            ? recipeInfo.image 
            : 'https://get.pxhere.com/photo/beans-close-up-cuisine-delicious-diet-dishes-easy-recipe-eating-healthy-food-food-container-food-photography-food-presentation-healthy-healthy-food-healthy-lifestyle-indoors-ingredients-meals-mouth-watering-rice-tasty-yummy-1556241.jpg';

          // Process nutrition data
          const processedNutrition = processNutritionData(recipeInfo.nutrition);

          // Create recipe in database
          detailedRecipe = await prisma.recipe.create({
            data: {
              spoonacularId: recipeInfo.id,
              title: recipeInfo.title.trim(),
              image: imageUrl,
              readyInMinutes: Math.max(recipeInfo.readyInMinutes || 30, 1),
              servings: Math.max(recipeInfo.servings || 4, 1),
              sourceUrl: recipeInfo.sourceUrl || recipeInfo.spoonacularSourceUrl || '',
              summary: cleanSummary,
              instructions: instructions || 'Follow standard cooking methods for this recipe.',
              ingredients: processedIngredients,
              nutrition: processedNutrition,
              spiciness,
              allergens
            }
          });

          console.log(`Created new recipe: ${detailedRecipe.title} (ID: ${detailedRecipe.id})`);
        } else {
          console.log(`Using cached recipe: ${detailedRecipe.title} (ID: ${detailedRecipe.id})`);
        }

        detailedRecipes.push(detailedRecipe);
      } catch (error) {
        console.error('Error processing recipe:', recipe?.title || 'Unknown recipe', error);
        continue;
      }
    }

    // CRITICAL SAFETY IMPLEMENTATION: Enhanced filtering with warning system
    
    // Parse user preferences for filtering priority logic
    const userAllergies = excludeIngredients ? excludeIngredients.toLowerCase().split(',').map(item => item.trim()) : [];
    const userDietaryPrefs = diet ? diet.toLowerCase().split(',').map(item => item.trim()) : [];
    const userIntolerances = intolerances ? intolerances.toLowerCase().split(',').map(item => item.trim()) : [];
    
    // Helper function to detect allergens in recipe
    const detectAllergens = (recipe: any, allergenList: string[]) => {
      const recipeIngredients = (recipe.ingredients as any[])?.map(ing => ing.name?.toLowerCase()) || [];
      const detectedAllergens: string[] = [];
      
      allergenList.forEach(allergen => {
        const allergenLower = allergen.toLowerCase();
        
        // Enhanced allergen detection with more comprehensive matching
        const isDetected = recipeIngredients.some(ingredient => {
          if (!ingredient) return false;
          
          // Direct allergen matches
          if (ingredient.includes(allergenLower)) return true;
          
          // Enhanced allergen-specific detection
          switch (allergenLower) {
            case 'dairy':
              return ingredient.includes('milk') || ingredient.includes('cheese') || 
                     ingredient.includes('butter') || ingredient.includes('cream') ||
                     ingredient.includes('yogurt') || ingredient.includes('ricotta') ||
                     ingredient.includes('mozzarella') || ingredient.includes('cheddar');
            case 'nuts':
              return ingredient.includes('almond') || ingredient.includes('walnut') ||
                     ingredient.includes('pecan') || ingredient.includes('cashew') ||
                     ingredient.includes('pistachio') || ingredient.includes('hazelnut');
            case 'gluten':
              return ingredient.includes('wheat') || ingredient.includes('flour') ||
                     ingredient.includes('bread') || ingredient.includes('pasta') ||
                     ingredient.includes('barley') || ingredient.includes('rye');
            case 'eggs':
              return ingredient.includes('egg') || ingredient.includes('mayo') ||
                     ingredient.includes('mayonnaise');
            case 'fish':
              return ingredient.includes('salmon') || ingredient.includes('tuna') ||
                     ingredient.includes('cod') || ingredient.includes('tilapia') ||
                     ingredient.includes('fish');
            case 'shellfish':
              return ingredient.includes('shrimp') || ingredient.includes('crab') ||
                     ingredient.includes('lobster') || ingredient.includes('scallop');
            case 'soy':
              return ingredient.includes('soy') || ingredient.includes('tofu') ||
                     ingredient.includes('edamame');
            case 'peanuts':
              return ingredient.includes('peanut') || ingredient.includes('groundnut');
            default:
              return ingredient.includes(allergenLower);
          }
        });
        
        if (isDetected) {
          detectedAllergens.push(allergen);
        }
      });
      
      return detectedAllergens;
    };
    
    // Helper function to check dietary compliance
    const checkDietaryCompliance = (recipe: any, dietaryPrefs: string[]) => {
      if (dietaryPrefs.length === 0) return { compliant: true, mismatches: [] };
      
      const recipeIngredients = (recipe.ingredients as any[])?.map(ing => ing.name?.toLowerCase()) || [];
      const mismatches: string[] = [];
      
      dietaryPrefs.forEach(pref => {
        let isCompliant = true;
        
        switch (pref) {
          case 'vegetarian':
            if (recipeIngredients.some(ing => ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham'].some(meat => ing.includes(meat)))) {
              isCompliant = false;
            }
            break;
          case 'vegan':
            if (recipeIngredients.some(ing => ['meat', 'chicken', 'beef', 'pork', 'fish', 'dairy', 'milk', 'cheese', 'butter', 'egg', 'honey'].some(animal => ing.includes(animal)))) {
              isCompliant = false;
            }
            break;
          case 'gluten-free':
            if (recipeIngredients.some(ing => ['wheat', 'flour', 'bread', 'pasta', 'gluten'].some(gluten => ing.includes(gluten)))) {
              isCompliant = false;
            }
            break;
          case 'dairy-free':
            if (recipeIngredients.some(ing => ['milk', 'cheese', 'butter', 'cream', 'dairy'].some(dairy => ing.includes(dairy)))) {
              isCompliant = false;
            }
            break;
          case 'keto':
            // Check for high-carb ingredients
            if (recipeIngredients.some(ing => ['rice', 'pasta', 'bread', 'potato', 'sugar', 'flour'].some(carb => ing.includes(carb)))) {
              isCompliant = false;
            }
            break;
          case 'paleo':
            if (recipeIngredients.some(ing => ['grain', 'dairy', 'legume', 'bean', 'processed'].some(nonPaleo => ing.includes(nonPaleo)))) {
              isCompliant = false;
            }
            break;
        }
        
        if (!isCompliant) {
          mismatches.push(pref);
        }
      });
      
      return { compliant: mismatches.length === 0, mismatches };
    };
    
    // Process recipes with safety warnings and filtering priority
    let processedRecipes = detailedRecipes.map(recipe => {
      const detectedAllergens = detectAllergens(recipe, [...userAllergies, ...userIntolerances]);
      const dietaryCheck = checkDietaryCompliance(recipe, userDietaryPrefs);
      
      // Calculate priority score for filtering
      let priorityScore = 0;
      
      // HIGHEST PRIORITY: No allergens detected
      if (detectedAllergens.length === 0) priorityScore += 1000;
      
      // HIGH PRIORITY: Dietary compliance
      if (dietaryCheck.compliant) priorityScore += 100;
      
      // Add warnings to recipe
      const warnings: any[] = [];
      
      // CRITICAL RED WARNINGS for allergens
      if (detectedAllergens.length > 0) {
        warnings.push({
          type: 'allergy',
          level: 'critical',
          message: `⚠️ CAUTION: Contains ${detectedAllergens.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}`,
          allergens: detectedAllergens
        });
      }
      
      // YELLOW WARNINGS for dietary mismatches
      if (!dietaryCheck.compliant) {
        warnings.push({
          type: 'dietary',
          level: 'warning',
          message: `⚠️ CAUTION: Not ${dietaryCheck.mismatches.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}`,
          mismatches: dietaryCheck.mismatches
        });
      }
      
      return {
        ...recipe,
        priorityScore,
        safetyWarnings: warnings,
        hasAllergenWarning: detectedAllergens.length > 0,
        hasDietaryWarning: !dietaryCheck.compliant,
        detectedAllergens,
        dietaryMismatches: dietaryCheck.mismatches
      };
    });
    
    // FILTERING PRIORITY LOGIC: match both > match allergies only > match dietary only > match neither
    processedRecipes.sort((a, b) => b.priorityScore - a.priorityScore);
    
    // Apply additional filters
    let filteredRecipes = processedRecipes;
    
    // Filter by cooking time if specified
    if (maxReadyTime && parseInt(maxReadyTime) < 120) {
      const maxTime = parseInt(maxReadyTime);
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.readyInMinutes && recipe.readyInMinutes <= maxTime
      );
    }
    
    // Filter by spiciness if specified (now using numeric levels 0-5)
    if (spiciness && spiciness !== '6') { // 6 = Any level
      const maxSpicinessLevel = parseInt(spiciness);
      filteredRecipes = filteredRecipes.filter(recipe => {
        const recipeSpicinessLevel = recipe.spiciness || 0;
        return recipeSpicinessLevel <= maxSpicinessLevel;
      });
    }
    
    // STRICT ALLERGEN FILTERING: Remove recipes with critical allergens unless no alternatives exist
    if (userAllergies.length > 0) {
      const safeRecipes = filteredRecipes.filter(recipe => !recipe.hasAllergenWarning);
      
      if (safeRecipes.length > 0) {
        // Use only safe recipes if available
        filteredRecipes = safeRecipes;
      } else {
        // If no safe recipes, keep all but ensure prominent warnings are shown
        console.warn('⚠️ SAFETY WARNING: No allergen-free recipes found, showing all with prominent warnings');
      }
    }

    // IMPLEMENT CASCADING INGREDIENT LOGIC WITH SAFETY PRIORITIES
    // Priority: SAFE + ALL ingredients → SAFE + total-1 → ALLERGENIC + ALL ingredients → etc.
    
    const searchedIngredients = ingredients.toLowerCase().split(',').map(ing => ing.trim());
    const cascadingResults = [];
    
    // Group recipes by ingredient match count (descending order) with safety prioritization
    for (let matchCount = searchedIngredients.length; matchCount >= 1; matchCount--) {
      const matchingRecipes = filteredRecipes.filter(recipe => {
        const recipeIngredients = (recipe.ingredients as any[])?.map(ing => ing.name?.toLowerCase()) || [];
        const matches = searchedIngredients.filter(searchIng => 
          recipeIngredients.some(recipeIng => recipeIng?.includes(searchIng))
        );
        return matches.length >= matchCount;
      });
      
      if (matchingRecipes.length > 0) {
        // Further prioritize within each group by safety (allergen-free recipes first)
        const prioritizedRecipes = matchingRecipes.sort((a, b) => {
          // Prioritize recipes without allergen warnings
          if (!a.hasAllergenWarning && b.hasAllergenWarning) return -1;
          if (a.hasAllergenWarning && !b.hasAllergenWarning) return 1;
          
          // Then prioritize recipes without dietary warnings
          if (!a.hasDietaryWarning && b.hasDietaryWarning) return -1;
          if (a.hasDietaryWarning && !b.hasDietaryWarning) return 1;
          
          return 0;
        });
        
        cascadingResults.push({
          matchCount,
          recipes: prioritizedRecipes,
          heading: matchCount === searchedIngredients.length 
            ? `Matches All ${searchedIngredients.length} Ingredients`
            : `Matches ${matchCount} of ${searchedIngredients.length} Ingredients`,
          isFullMatch: matchCount === searchedIngredients.length,
          warning: matchCount < searchedIngredients.length ? 
            `Missing ${searchedIngredients.length - matchCount} ingredient${searchedIngredients.length - matchCount > 1 ? 's' : ''}` : null,
          safetyStatus: {
            safeRecipes: prioritizedRecipes.filter(r => !r.hasAllergenWarning).length,
            allergenRecipes: prioritizedRecipes.filter(r => r.hasAllergenWarning).length,
            dietaryIssues: prioritizedRecipes.filter(r => r.hasDietaryWarning).length
          }
        });
      }
    }
    
    // If no exact matches found, add fallback suggestions with safety warnings
    if (cascadingResults.length === 0 || !cascadingResults.some(group => group.isFullMatch)) {
      // Get any recipes that match at least one ingredient as fallback
      const fallbackRecipes = filteredRecipes.filter(recipe => {
        const recipeIngredients = (recipe.ingredients as any[])?.map(ing => ing.name?.toLowerCase()) || [];
        return searchedIngredients.some(searchIng => 
          recipeIngredients.some(recipeIng => recipeIng?.includes(searchIng))
        );
      }).slice(0, 5); // Limit fallback suggestions
      
      if (fallbackRecipes.length > 0) {
        // Prioritize safe recipes in fallback too
        const prioritizedFallback = fallbackRecipes.sort((a, b) => {
          if (!a.hasAllergenWarning && b.hasAllergenWarning) return -1;
          if (a.hasAllergenWarning && !b.hasAllergenWarning) return 1;
          return 0;
        });
        
        cascadingResults.push({
          matchCount: 0,
          recipes: prioritizedFallback,
          heading: "Fallback Suggestions",
          isFullMatch: false,
          warning: "⚠️ These recipes may not contain your selected ingredients. Consider adjusting your search.",
          safetyStatus: {
            safeRecipes: prioritizedFallback.filter(r => !r.hasAllergenWarning).length,
            allergenRecipes: prioritizedFallback.filter(r => r.hasAllergenWarning).length,
            dietaryIssues: prioritizedFallback.filter(r => r.hasDietaryWarning).length
          }
        });
      }
    }
    
    // FINAL SAFETY CHECK: Ensure safety warnings are preserved in final results
    const finalResults = cascadingResults.map(group => ({
      ...group,
      recipes: group.recipes.map(recipe => {
        // Ensure all safety warnings are properly attached
        if (!recipe.safetyWarnings) {
          recipe.safetyWarnings = [];
          
          // Re-check and add any missing warnings
          if (recipe.hasAllergenWarning && recipe.detectedAllergens?.length > 0) {
            recipe.safetyWarnings.push({
              type: 'allergy',
              level: 'critical',
              message: `⚠️ CAUTION: Contains ${recipe.detectedAllergens.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}`,
              allergens: recipe.detectedAllergens
            });
          }
          
          if (recipe.hasDietaryWarning && recipe.dietaryMismatches?.length > 0) {
            recipe.safetyWarnings.push({
              type: 'dietary',
              level: 'warning',
              message: `⚠️ CAUTION: Not ${recipe.dietaryMismatches.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}`,
              mismatches: recipe.dietaryMismatches
            });
          }
        }
        return recipe;
      })
    }));

    console.log(`Returning ${finalResults.reduce((total, group) => total + group.recipes.length, 0)} recipes in ${finalResults.length} groups for ingredients: ${ingredients}`);

    return NextResponse.json({ 
      cascadingResults: finalResults,
      source: 'spoonacular',
      searchedIngredients: ingredients,
      totalGroups: finalResults.length,
      totalRecipes: finalResults.reduce((total, group) => total + group.recipes.length, 0),
      filtersApplied: {
        diet,
        intolerances,
        maxReadyTime,
        cuisine,
        type,
        excludeIngredients,
        spiciness
      },
      priorityHierarchy: "ALLERGIES → DIETARY → INGREDIENTS → SPICINESS → SERVING SIZE"
    });

  } catch (error) {
    console.error('Error in ingredient-based recipe search:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch recipes',
        message: 'Server error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}
