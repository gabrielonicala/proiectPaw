import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { CHARACTER_SLOT_PRICE, CHARACTER_SLOT_PRODUCT_PATH } from '@/lib/credits';

/**
 * This endpoint initiates a FastSpring checkout for a character slot purchase
 * The actual slot addition happens via webhook when payment is confirmed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return product info for client-side FastSpring checkout
    // The actual purchase will be handled by FastSpring's client-side builder
    return NextResponse.json({
      success: true,
      productPath: CHARACTER_SLOT_PRODUCT_PATH,
      price: CHARACTER_SLOT_PRICE,
      message: 'Use FastSpring client-side checkout with this product path'
    });
  } catch (error) {
    console.error('Error initiating character slot purchase:', error);
    return NextResponse.json(
      { error: 'Failed to initiate character slot purchase' },
      { status: 500 }
    );
  }
}





