import { db } from '@/lib/db';

/**
 * Get pending checkout for a user (used by webhook)
 * Returns user ID if checkout started within last 5 minutes
 */
export async function getPendingCheckoutUser(): Promise<string | null> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find the most recent pending checkout
    const pending = await db.pendingCheckout.findFirst({
      where: {
        createdAt: {
          gte: fiveMinutesAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (pending) {
      return pending.userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting pending checkout:', error);
    return null;
  }
}

/**
 * Clear pending checkout after successful linking
 */
export async function clearPendingCheckout(userId: string): Promise<void> {
  try {
    await db.pendingCheckout.deleteMany({
      where: { userId }
    });
  } catch (error) {
    console.error('Error clearing pending checkout:', error);
  }
}

