
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch grocery lists
export async function GET(request: NextRequest) {
  try {
    // For Phase 1, we'll use a single default grocery list
    let groceryList = await prisma.groceryList.findFirst({
      include: {
        items: {
          include: {
            recipe: {
              select: {
                id: true,
                title: true,
                image: true
              }
            }
          },
          orderBy: {
            addedAt: 'desc'
          }
        }
      }
    });

    // Create default grocery list if none exists
    if (!groceryList) {
      groceryList = await prisma.groceryList.create({
        data: {
          name: "My Grocery List"
        },
        include: {
          items: {
            include: {
              recipe: {
                select: {
                  id: true,
                  title: true,
                  image: true
                }
              }
            }
          }
        }
      });
    }

    return NextResponse.json({ 
      groceryList,
      itemCount: groceryList.items?.length ?? 0
    });
    
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    );
  }
}

// POST - Add item to grocery list
export async function POST(request: NextRequest) {
  try {
    const { name, amount, unit, category, priority, storeSection, recipeId } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
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

    // Check if item already exists in the list
    const existingItem = await prisma.groceryListItem.findUnique({
      where: {
        groceryListId_name: {
          groceryListId: groceryList.id,
          name: name.trim()
        }
      }
    });

    if (existingItem) {
      return NextResponse.json({ 
        success: true, 
        message: 'Item already in grocery list',
        item: existingItem,
        alreadyExists: true
      });
    }

    // Add the item
    const groceryListItem = await prisma.groceryListItem.create({
      data: {
        groceryListId: groceryList.id,
        name: name.trim(),
        amount: amount ? parseFloat(amount) : null,
        unit: unit?.trim() || null,
        category: category?.trim() || null,
        priority: priority?.trim() || 'medium',
        storeSection: storeSection?.trim() || null,
        recipeId: recipeId ? parseInt(recipeId) : null
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item added to grocery list',
      item: groceryListItem
    });
    
  } catch (error) {
    console.error('Error adding item to grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to add item to grocery list' },
      { status: 500 }
    );
  }
}

// PUT - Update grocery list item
export async function PUT(request: NextRequest) {
  try {
    const { itemId, name, amount, unit, category, priority, storeSection, isCompleted } = await request.json();
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (amount !== undefined) updateData.amount = amount ? parseFloat(amount) : null;
    if (unit !== undefined) updateData.unit = unit?.trim() || null;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (priority !== undefined) updateData.priority = priority?.trim() || 'medium';
    if (storeSection !== undefined) updateData.storeSection = storeSection?.trim() || null;
    if (isCompleted !== undefined) updateData.isCompleted = Boolean(isCompleted);

    const updatedItem = await prisma.groceryListItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item updated successfully',
      item: updatedItem
    });
    
  } catch (error) {
    console.error('Error updating grocery list item:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from grocery list
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await prisma.groceryListItem.delete({
      where: { id: parseInt(itemId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from grocery list',
      itemId: parseInt(itemId)
    });
    
  } catch (error) {
    console.error('Error removing grocery list item:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        success: true, 
        message: 'Item was not in grocery list'
      });
    }
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
