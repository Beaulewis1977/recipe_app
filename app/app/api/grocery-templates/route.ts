
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all grocery list templates
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.groceryListTemplate.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ 
      templates,
      count: templates.length
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Create new template from current grocery list or save custom template
export async function POST(request: NextRequest) {
  try {
    const { name, description, items, fromCurrentList } = await request.json();
    
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    let templateItems = items || [];

    // If creating from current grocery list, fetch current items
    if (fromCurrentList) {
      const currentList = await prisma.groceryList.findFirst({
        include: { items: true }
      });
      
      if (currentList?.items) {
        templateItems = currentList.items.map(item => ({
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          category: item.category
        }));
      }
    }

    // Create the template
    const template = await prisma.groceryListTemplate.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        items: {
          create: templateItems.map((item: any) => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
            category: item.category
          }))
        }
      },
      include: {
        items: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Template saved successfully',
      template
    });
    
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// DELETE - Remove template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await prisma.groceryListTemplate.delete({
      where: { id: parseInt(templateId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Template deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting template:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        success: true, 
        message: 'Template was not found'
      });
    }
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
