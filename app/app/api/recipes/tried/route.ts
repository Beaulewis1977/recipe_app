
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { recipeId, rating, notes } = await request.json();
    
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

    // Check if already tried and update, or create new
    const existingTried = await prisma.triedRecipe.findUnique({
      where: { recipeId: recipeId }
    });

    let triedRecipe;

    if (existingTried) {
      // Update existing tried recipe
      triedRecipe = await prisma.triedRecipe.update({
        where: { recipeId: recipeId },
        data: {
          rating: rating ?? existingTried.rating,
          notes: notes ?? existingTried.notes,
          triedAt: new Date() // Update tried date
        },
        include: {
          recipe: true
        }
      });
    } else {
      // Create new tried recipe
      triedRecipe = await prisma.triedRecipe.create({
        data: {
          recipeId: recipeId,
          rating: rating || null,
          notes: notes || null
        },
        include: {
          recipe: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: existingTried ? 'Recipe updated' : 'Recipe marked as tried',
      recipeId,
      triedRecipe 
    });
    
  } catch (error) {
    console.error('Error marking recipe as tried:', error);
    return NextResponse.json(
      { error: 'Failed to mark recipe as tried' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all tried recipes with recipe details
    const triedRecipes = await prisma.triedRecipe.findMany({
      include: {
        recipe: true
      },
      orderBy: {
        triedAt: 'desc'
      }
    });

    return NextResponse.json({ 
      triedRecipes: triedRecipes,
      count: triedRecipes.length
    });
    
  } catch (error) {
    console.error('Error fetching tried recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tried recipes' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { recipeId, rating, notes } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Update the tried recipe
    const triedRecipe = await prisma.triedRecipe.update({
      where: { recipeId: recipeId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(notes !== undefined && { notes })
      },
      include: {
        recipe: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe updated successfully',
      triedRecipe 
    });
    
  } catch (error) {
    console.error('Error updating tried recipe:', error);
    // Handle case where tried recipe doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Recipe not found in tried list'
      }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update tried recipe' },
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

    // Delete the tried recipe
    const deletedTried = await prisma.triedRecipe.delete({
      where: { recipeId: parseInt(recipeId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe removed from tried',
      recipeId: parseInt(recipeId)
    });
    
  } catch (error) {
    console.error('Error removing tried recipe:', error);
    // Handle case where tried recipe doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        success: true, 
        message: 'Recipe was not in tried list'
      });
    }
    return NextResponse.json(
      { error: 'Failed to remove tried recipe' },
      { status: 500 }
    );
  }
}
