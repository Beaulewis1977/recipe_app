
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { calculateSpiciness, checkAllergens } from '@/lib/utils';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipeId = parseInt(params.id);
    
    if (isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe ID' },
        { status: 400 }
      );
    }

    // First, try to find the recipe in our database
    let recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (recipe) {
      console.log(`Found recipe in database: ${recipe.title}`);
      return NextResponse.json({ recipe, source: 'database' });
    }

    // If not found in database, try to find by spoonacularId
    recipe = await prisma.recipe.findUnique({
      where: { spoonacularId: recipeId }
    });

    if (recipe) {
      console.log(`Found recipe by Spoonacular ID: ${recipe.title}`);
      return NextResponse.json({ recipe, source: 'database' });
    }

    // If still not found, try fetching from Spoonacular with valid API key
    if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'your-actual-spoonacular-api-key-here') {
      return NextResponse.json(
        { 
          error: 'Recipe not found and API key required',
          message: 'Please add your Spoonacular API key to the .env file to fetch recipes. Get one free at https://spoonacular.com/food-api'
        },
        { status: 401 }
      );
    }

    try {
        console.log(`Fetching recipe ${recipeId} from Spoonacular API...`);
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`,
          {
            headers: {
              'User-Agent': 'Recipe-Slot-App/1.0'
            }
          }
        );

        if (response.ok) {
          const spoonacularRecipe = await response.json();
          
          // Process and store the recipe
          const rawIngredients = spoonacularRecipe.extendedIngredients || [];
          const processedIngredients = rawIngredients.filter(Boolean).map((ing: any) => ({
            id: ing.id || Math.floor(Math.random() * 1000000),
            name: (ing.name || ing.nameClean || ing.original || 'Unknown ingredient').toLowerCase().trim(),
            amount: typeof ing.amount === 'number' ? ing.amount : (parseFloat(ing.amount) || 1),
            unit: (ing.unit || ing.unitShort || '').toLowerCase().trim(),
            originalString: ing.original || ing.name || 'Unknown ingredient'
          }));

          // Extract instructions properly
          let instructions = '';
          if (spoonacularRecipe.instructions) {
            instructions = spoonacularRecipe.instructions;
          } else if (spoonacularRecipe.analyzedInstructions && spoonacularRecipe.analyzedInstructions.length > 0) {
            instructions = spoonacularRecipe.analyzedInstructions[0].steps
              ?.map((step: any) => `${step.number}. ${step.step}`)
              .join('\n') || '';
          }

          // Clean up summary (remove HTML tags)
          const cleanSummary = spoonacularRecipe.summary 
            ? spoonacularRecipe.summary.replace(/<[^>]*>/g, '').trim()
            : `Delicious ${spoonacularRecipe.title} recipe.`;

          // Calculate derived properties
          const spiciness = calculateSpiciness(processedIngredients);
          const allergens = checkAllergens(processedIngredients, ['dairy', 'nuts', 'gluten', 'eggs', 'shellfish', 'fish', 'soy']);

          // Ensure image URL is valid or use placeholder
          const imageUrl = spoonacularRecipe.image && spoonacularRecipe.image.startsWith('http') 
            ? spoonacularRecipe.image 
            : 'https://i.pinimg.com/originals/bb/1d/54/bb1d54966ab6c62a90efb170821cdf56.jpg';

          // Process nutrition data
          const processedNutrition = processNutritionData(spoonacularRecipe.nutrition);

          // Create recipe in database
          recipe = await prisma.recipe.create({
            data: {
              spoonacularId: spoonacularRecipe.id,
              title: spoonacularRecipe.title.trim(),
              image: imageUrl,
              readyInMinutes: Math.max(spoonacularRecipe.readyInMinutes || 30, 1),
              servings: Math.max(spoonacularRecipe.servings || 4, 1),
              sourceUrl: spoonacularRecipe.sourceUrl || spoonacularRecipe.spoonacularSourceUrl || '',
              summary: cleanSummary,
              instructions: instructions || 'Follow standard cooking methods for this recipe.',
              ingredients: processedIngredients,
              nutrition: processedNutrition,
              spiciness,
              allergens
            }
          });

          console.log(`Created and cached recipe from Spoonacular: ${recipe.title}`);
          return NextResponse.json({ recipe, source: 'spoonacular' });
        } else {
          console.error(`Spoonacular API error: ${response.status}`);
          return NextResponse.json(
            { 
              error: `Spoonacular API error: ${response.status}`,
              message: 'Failed to fetch recipe from Spoonacular. Check your API key and quota.'
            },
            { status: 503 }
          );
        }
      } catch (error) {
        console.error('Error fetching from Spoonacular:', error);
        return NextResponse.json(
          { 
            error: error instanceof Error ? error.message : 'Unknown API error',
            message: 'Failed to fetch recipe from Spoonacular. Please try again later.'
          },
          { status: 503 }
        );
      }

    // Recipe not found anywhere
    return NextResponse.json(
      { error: 'Recipe not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}
