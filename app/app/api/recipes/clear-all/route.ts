
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE() {
  try {
    // Clear all user data but keep recipes for reuse
    await prisma.triedRecipe.deleteMany({});
    await prisma.savedRecipe.deleteMany({});
    await prisma.userSettings.deleteMany({});
    await prisma.pantryIngredient.deleteMany({});

    return NextResponse.json({ message: 'All user data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}
