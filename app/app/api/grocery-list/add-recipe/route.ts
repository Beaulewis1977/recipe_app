
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSmartUnit, scaleIngredientAmount, parseFraction } from '@/lib/utils';

const prisma = new PrismaClient();

// POST - Add all ingredients from a recipe to grocery list with smart units and serving size scaling
export async function POST(request: NextRequest) {
  try {
    const { recipeId, servingSize } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Fetch the recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(recipeId) }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Get or create default grocery list
    let groceryList = await prisma.groceryList.findFirst();
    
    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: {
          name: "My Grocery List"
        }
      });
    }

    // Get pantry items to exclude
    const pantryItems = await prisma.pantryIngredient.findMany({
      select: { name: true }
    });
    const pantryNames = new Set(pantryItems.map(item => item.name.toLowerCase()));

    const ingredients = recipe.ingredients as any[];
    const addedItems: any[] = [];
    const skippedItems: any[] = [];
    const updatedItems: any[] = [];
    
    const originalServings = recipe.servings || 4;
    const targetServings = servingSize || originalServings;
    const isScaled = targetServings !== originalServings;

    // Add each ingredient to the grocery list with smart units and scaling
    for (const ingredient of ingredients) {
      try {
        const name = ingredient.originalString?.trim() || ingredient.name?.trim();
        if (!name) continue;

        // Check if ingredient is in pantry (skip if user already has it)
        const ingredientBaseName = ingredient.name?.toLowerCase() || name.toLowerCase();
        if (pantryNames.has(ingredientBaseName)) {
          skippedItems.push({
            name,
            reason: 'In pantry (already have)',
            originalName: ingredient.name
          });
          continue;
        }

        // Parse original amount (handle fractions)
        const originalAmount = parseFraction(ingredient.amount?.toString() || '1');
        
        // Scale amount if needed
        let finalAmount = originalAmount;
        if (isScaled) {
          const scaled = scaleIngredientAmount(originalAmount, originalServings, targetServings);
          finalAmount = scaled.amount;
        }

        // Get smart unit based on ingredient name
        const smartUnit = getSmartUnit(ingredient.name, finalAmount, ingredient.unit);

        // Check if item already exists
        const existingItem = await prisma.groceryListItem.findFirst({
          where: {
            groceryListId: groceryList.id,
            name: name
          }
        });

        if (existingItem) {
          // Update existing item with combined amount
          const existingAmount = existingItem.amount || 0;
          const combinedAmount = existingAmount + smartUnit.amount;
          
          const updatedItem = await prisma.groceryListItem.update({
            where: { id: existingItem.id },
            data: {
              amount: combinedAmount,
              unit: smartUnit.unit, // Use the smart unit
              category: categorizeIngredient(name) // Update category if needed
            }
          });
          
          updatedItems.push({
            name,
            previousAmount: existingAmount,
            addedAmount: smartUnit.amount,
            finalAmount: combinedAmount,
            unit: smartUnit.unit,
            scaled: isScaled
          });
        } else {
          // Determine category based on ingredient name (enhanced categorization)
          const category = categorizeIngredient(name);

          const groceryListItem = await prisma.groceryListItem.create({
            data: {
              groceryListId: groceryList.id,
              name: name,
              amount: smartUnit.amount,
              unit: smartUnit.unit,
              category: category,
              recipeId: recipe.id
            }
          });

          addedItems.push({
            id: groceryListItem.id,
            name,
            amount: smartUnit.amount,
            unit: smartUnit.unit,
            category,
            scaled: isScaled,
            originalAmount: originalAmount,
            scaledAmount: finalAmount
          });
        }
      } catch (error) {
        console.error(`Error adding ingredient ${ingredient.name}:`, error);
        // Continue with other ingredients
      }
    }

    const totalProcessed = addedItems.length + updatedItems.length;
    const pantrySkipped = skippedItems.filter(item => item.reason === 'In pantry (already have)').length;
    
    let message = isScaled 
      ? `Added ${totalProcessed} ingredients to grocery list (scaled for ${targetServings} servings)`
      : `Added ${totalProcessed} ingredients to grocery list`;
    
    if (pantrySkipped > 0) {
      message += `. Skipped ${pantrySkipped} items already in your pantry.`;
    }

    return NextResponse.json({ 
      success: true, 
      message,
      recipeTitle: recipe.title,
      servingInfo: {
        originalServings,
        targetServings,
        isScaled
      },
      summary: {
        itemsAdded: addedItems.length,
        itemsUpdated: updatedItems.length,
        itemsSkipped: skippedItems.length,
        totalProcessed: totalProcessed
      },
      details: {
        addedItems,
        updatedItems,
        skippedItems
      }
    });
    
  } catch (error) {
    console.error('Error adding recipe to grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to add recipe to grocery list' },
      { status: 500 }
    );
  }
}

// Basic ingredient categorization function
function categorizeIngredient(name: string): string {
  const lowercaseName = name.toLowerCase();
  
  // Produce
  if (lowercaseName.match(/\b(apple|banana|orange|lemon|lime|onion|garlic|tomato|potato|carrot|celery|pepper|lettuce|spinach|kale|broccoli|cauliflower|cucumber|zucchini|avocado|berries|grapes|herbs|cilantro|parsley|basil|thyme|rosemary|ginger|mushroom)\b/)) {
    return 'produce';
  }
  
  // Dairy
  if (lowercaseName.match(/\b(milk|cheese|butter|cream|yogurt|sour cream|cottage cheese|parmesan|cheddar|mozzarella|eggs?)\b/)) {
    return 'dairy';
  }
  
  // Meat & Seafood
  if (lowercaseName.match(/\b(chicken|beef|pork|turkey|fish|salmon|tuna|shrimp|bacon|sausage|ham|ground)\b/)) {
    return 'meat';
  }
  
  // Pantry/Dry Goods
  if (lowercaseName.match(/\b(flour|sugar|salt|pepper|oil|vinegar|rice|pasta|bread|cereal|oats|quinoa|beans|lentils|nuts|seeds|spices?|vanilla|baking)\b/)) {
    return 'pantry';
  }
  
  // Frozen
  if (lowercaseName.match(/\b(frozen|ice cream)\b/)) {
    return 'frozen';
  }
  
  // Beverages
  if (lowercaseName.match(/\b(juice|soda|water|coffee|tea|wine|beer|broth|stock)\b/)) {
    return 'beverages';
  }
  
  // Default to pantry for uncategorized items
  return 'pantry';
}
