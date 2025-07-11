
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all pantry ingredients
export async function GET(request: NextRequest) {
  try {
    const pantryItems = await prisma.pantryIngredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      pantryItems,
      count: pantryItems.length
    });
    
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pantry items' },
      { status: 500 }
    );
  }
}

// POST - Add ingredient to pantry
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Ingredient name is required' }, { status: 400 });
    }

    // Check if ingredient already exists in pantry
    const existing = await prisma.pantryIngredient.findUnique({
      where: { name: name.trim().toLowerCase() }
    });

    if (existing) {
      // Update lastUsedAt
      const updated = await prisma.pantryIngredient.update({
        where: { id: existing.id },
        data: { lastUsedAt: new Date() }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Ingredient already in pantry',
        item: updated,
        alreadyExists: true
      });
    }

    // Add new pantry ingredient
    const pantryItem = await prisma.pantryIngredient.create({
      data: {
        name: name.trim().toLowerCase()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Ingredient added to pantry',
      item: pantryItem
    });
    
  } catch (error) {
    console.error('Error adding ingredient to pantry:', error);
    return NextResponse.json(
      { error: 'Failed to add ingredient to pantry' },
      { status: 500 }
    );
  }
}

// DELETE - Remove ingredient from pantry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const name = searchParams.get('name');
    
    if (!itemId && !name) {
      return NextResponse.json({ error: 'Item ID or name is required' }, { status: 400 });
    }

    if (itemId) {
      await prisma.pantryIngredient.delete({
        where: { id: parseInt(itemId) }
      });
    } else if (name) {
      await prisma.pantryIngredient.delete({
        where: { name: name.toLowerCase() }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ingredient removed from pantry'
    });
    
  } catch (error) {
    console.error('Error removing pantry ingredient:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        success: true, 
        message: 'Ingredient was not in pantry'
      });
    }
    return NextResponse.json(
      { error: 'Failed to remove ingredient from pantry' },
      { status: 500 }
    );
  }
}
