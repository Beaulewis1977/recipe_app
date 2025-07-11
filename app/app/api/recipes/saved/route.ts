
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { recipeId } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if already saved to avoid duplicates
    const existingSaved = await prisma.savedRecipe.findUnique({
      where: { recipeId: recipeId }
    });

    if (existingSaved) {
      return NextResponse.json({ 
        success: true, 
        message: 'Recipe already saved',
        recipeId,
        alreadyExists: true
      });
    }

    // Save the recipe
    const savedRecipe = await prisma.savedRecipe.create({
      data: {
        recipeId: recipeId
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe saved successfully',
      recipeId,
      savedRecipe 
    });
    
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all saved recipes with recipe details
    const savedRecipes = await prisma.savedRecipe.findMany({
      include: {
        recipe: true
      },
      orderBy: {
        savedAt: 'desc'
      }
    });

    return NextResponse.json({ 
      savedRecipes: savedRecipes,
      count: savedRecipes.length
    });
    
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved recipes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Delete the saved recipe
    const deletedSaved = await prisma.savedRecipe.delete({
      where: { recipeId: parseInt(recipeId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe removed from saved',
      recipeId: parseInt(recipeId)
    });
    
  } catch (error) {
    console.error('Error removing saved recipe:', error);
    // Handle case where saved recipe doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        success: true, 
        message: 'Recipe was not in saved list'
      });
    }
    return NextResponse.json(
      { error: 'Failed to remove saved recipe' },
      { status: 500 }
    );
  }
}
