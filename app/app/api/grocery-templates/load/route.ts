
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Load template items into current grocery list
export async function POST(request: NextRequest) {
  try {
    const { templateId, replaceExisting = false } = await request.json();
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get template with items
    const template = await prisma.groceryListTemplate.findUnique({
      where: { id: parseInt(templateId) },
      include: { items: true }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
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

    // If replacing existing, clear current list
    if (replaceExisting) {
      await prisma.groceryListItem.deleteMany({
        where: { groceryListId: groceryList.id }
      });
    }

    // Add template items to grocery list
    const addedItems: any[] = [];
    const skippedItems: any[] = [];

    for (const templateItem of template.items) {
      try {
        // Check if item already exists (only if not replacing)
        if (!replaceExisting) {
          const existingItem = await prisma.groceryListItem.findFirst({
            where: {
              groceryListId: groceryList.id,
              name: templateItem.name
            }
          });

          if (existingItem) {
            skippedItems.push({
              name: templateItem.name,
              reason: 'Already in list'
            });
            continue;
          }
        }

        // Add item to grocery list
        const groceryListItem = await prisma.groceryListItem.create({
          data: {
            groceryListId: groceryList.id,
            name: templateItem.name,
            amount: templateItem.amount,
            unit: templateItem.unit,
            category: templateItem.category
          }
        });

        addedItems.push({
          name: templateItem.name,
          amount: templateItem.amount,
          unit: templateItem.unit,
          category: templateItem.category
        });

      } catch (error) {
        console.error(`Error adding item ${templateItem.name}:`, error);
        skippedItems.push({
          name: templateItem.name,
          reason: 'Error adding item'
        });
      }
    }

    const message = replaceExisting 
      ? `Loaded ${addedItems.length} items from template "${template.name}"`
      : `Added ${addedItems.length} items from template "${template.name}"${skippedItems.length > 0 ? ` (${skippedItems.length} skipped - already in list)` : ''}`;

    return NextResponse.json({ 
      success: true, 
      message,
      templateName: template.name,
      summary: {
        itemsAdded: addedItems.length,
        itemsSkipped: skippedItems.length,
        replaceExisting
      },
      details: {
        addedItems,
        skippedItems
      }
    });
    
  } catch (error) {
    console.error('Error loading template:', error);
    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    );
  }
}
