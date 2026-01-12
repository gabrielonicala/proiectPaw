import { db } from './db';

// Credit costs for different entry types
export const INK_VIAL_COSTS = {
  CHAPTER: 15,  // Text/Story generation
  SCENE: 80,    // Image generation
} as const;

// Credit packages available for purchase
export const CREDIT_PACKAGES = {
  'starter-kit': {
    name: 'Starter Kit',
    price: 6.99,
    inkVials: 1000,
    productPath: 'the-starter-kit',
    description: 'A sacred collection of enchanted vials, blessed by the ancient scribes. Perfect for those who seek to begin their legendary chronicle and pen the first chapters of their destined tale.',
  },
  'novice-sack': {
    name: "Wordsmith's Sack",
    price: 4.99,
    inkVials: 400,
    productPath: 'the-novice-sack',
    description: 'A humble leather pouch, filled with a modest amount of shimmering ink essence. Ideal for quick quests and fleeting moments of inspiration that strike like lightning across a stormy sky.',
  },
  'chroniclers-kit': {
    name: "Chronicler's Kit",
    price: 11.99,
    inkVials: 1200,
    productPath: 'the-chronicler-s-kit',
    description: 'The chosen vessel of master storytellers, containing enough mystical ink to weave an abundance of narratives. For those who dedicate their soul to preserving the legends of ages past and future.',
  },
  'worldbuilders-chest': {
    name: "Worldbuilder's Chest",
    price: 29.99,
    inkVials: 3500,
    productPath: 'the-worldbuilder-s-chest',
    description: 'An ancient chest of untold power, overflowing with the purest essence of creation itself. With this treasure, you may craft entire realms and shape destinies that will echo through eternity.',
  },
} as const;

// Character slot purchase price
export const CHARACTER_SLOT_PRICE = 2.99;
export const CHARACTER_SLOT_PRODUCT_PATH = 'character-slot';

// Low credits threshold (for UI flashing animation)
export const LOW_CREDITS_THRESHOLD = 50;

// Starter Kit eligibility: first 30 days after account creation
export const STARTER_KIT_ELIGIBILITY_DAYS = 30;

// Daily recharge amount
export const DAILY_RECHARGE_AMOUNT = 10;

/**
 * Get the cost for a specific output type
 */
export function getCostForOutputType(outputType: 'text' | 'image'): number {
  return outputType === 'text' ? INK_VIAL_COSTS.CHAPTER : INK_VIAL_COSTS.SCENE;
}

/**
 * Check if user has enough credits for an entry
 */
export async function canAffordEntry(
  userId: string,
  outputType: 'text' | 'image'
): Promise<{ allowed: boolean; currentCredits: number; requiredCredits: number; reason?: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  if (!user) {
    return {
      allowed: false,
      currentCredits: 0,
      requiredCredits: getCostForOutputType(outputType),
      reason: 'User not found'
    };
  }

  const requiredCredits = getCostForOutputType(outputType);
  const hasEnough = user.credits >= requiredCredits;

  return {
    allowed: hasEnough,
    currentCredits: user.credits,
    requiredCredits,
    reason: hasEnough ? undefined : `Not enough Ink Vials. You need ${requiredCredits} but only have ${user.credits}.`
  };
}

/**
 * Deduct credits after successful generation
 */
export async function deductCredits(
  userId: string,
  outputType: 'text' | 'image'
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  const cost = getCostForOutputType(outputType);

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      return { success: false, remainingCredits: 0, error: 'User not found' };
    }

    if (user.credits < cost) {
      return {
        success: false,
        remainingCredits: user.credits,
        error: `Insufficient credits. Need ${cost}, have ${user.credits}`
      };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: cost
        }
      },
      select: { credits: true }
    });

    return {
      success: true,
      remainingCredits: updatedUser.credits
    };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      remainingCredits: 0,
      error: error instanceof Error ? error.message : 'Failed to deduct credits'
    };
  }
}

/**
 * Add credits to user account (after purchase)
 */
export async function addCredits(
  userId: string,
  amount: number,
  packageName: string,
  transactionId: string | null,
  price: number,
  metadata?: Record<string, any>
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  try {
    // Add credits to user account
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount
        }
      },
      select: { credits: true }
    });

    // Record the purchase
    await db.creditPurchase.create({
      data: {
        userId,
        packageName,
        inkVials: amount,
        price,
        transactionId: transactionId || null,
        metadata: metadata || undefined
      }
    });

    return {
      success: true,
      newBalance: updatedUser.credits
    };
  } catch (error) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      newBalance: 0,
      error: error instanceof Error ? error.message : 'Failed to add credits'
    };
  }
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  return user?.credits || 0;
}

/**
 * Check if user is eligible for Starter Kit
 * - Must be within first 30 days of account creation
 * - Must not have purchased it before
 */
export async function canPurchaseStarterKit(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      hasPurchasedStarterKit: true
    }
  });

  if (!user || user.hasPurchasedStarterKit) {
    return false;
  }

  const daysSinceCreation = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceCreation <= STARTER_KIT_ELIGIBILITY_DAYS;
}

/**
 * Mark Starter Kit as purchased
 */
export async function markStarterKitPurchased(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: {
      hasPurchasedStarterKit: true
    }
  });
}

/**
 * Check if user is low on credits (for UI flashing animation)
 */
export async function isLowOnCredits(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits <= LOW_CREDITS_THRESHOLD;
}

/**
 * Add character slot to user account
 */
export async function addCharacterSlot(
  userId: string,
  transactionId: string | null,
  price: number,
  metadata?: Record<string, any>
): Promise<{ success: boolean; newSlotCount: number; error?: string }> {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        characterSlots: {
          increment: 1
        }
      },
      select: { characterSlots: true }
    });

    // Record the purchase as a credit purchase with special package name
    await db.creditPurchase.create({
      data: {
        userId,
        packageName: 'character-slot',
        inkVials: 0, // Character slots don't give credits
        price,
        transactionId: transactionId || null,
        metadata: metadata || undefined
      }
    });

    return {
      success: true,
      newSlotCount: updatedUser.characterSlots
    };
  } catch (error) {
    console.error('Error adding character slot:', error);
    return {
      success: false,
      newSlotCount: 0,
      error: error instanceof Error ? error.message : 'Failed to add character slot'
    };
  }
}

/**
 * Check if user is eligible for daily recharge (24 hours have passed since last recharge)
 */
export async function isEligibleForDailyRecharge(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lastDailyRecharge: true, createdAt: true }
  });

  if (!user) {
    return false;
  }

  // If user has never received a daily recharge, use account creation date
  const lastRechargeDate = user.lastDailyRecharge || user.createdAt;
  const now = new Date();
  const hoursSinceLastRecharge = (now.getTime() - lastRechargeDate.getTime()) / (1000 * 60 * 60);

  // Eligible if 24 hours or more have passed
  return hoursSinceLastRecharge >= 24;
}

/**
 * Process daily recharge for a single user
 * Returns true if recharge was applied, false if not eligible
 */
export async function processDailyRecharge(userId: string): Promise<{ 
  success: boolean; 
  recharged: boolean; 
  newBalance: number; 
  error?: string 
}> {
  try {
    // Check eligibility
    if (!(await isEligibleForDailyRecharge(userId))) {
      return {
        success: true,
        recharged: false,
        newBalance: await getUserCredits(userId)
      };
    }

    // Add daily recharge credits
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: DAILY_RECHARGE_AMOUNT
        },
        lastDailyRecharge: new Date()
      },
      select: { credits: true }
    });

    // Record as a credit purchase with special package name for tracking
    await db.creditPurchase.create({
      data: {
        userId,
        packageName: 'daily-recharge',
        inkVials: DAILY_RECHARGE_AMOUNT,
        price: 0, // Free daily recharge
        transactionId: null,
        metadata: {
          type: 'daily_recharge',
          rechargedAt: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Daily recharge applied to user ${userId}: +${DAILY_RECHARGE_AMOUNT} credits (new balance: ${updatedUser.credits})`);

    return {
      success: true,
      recharged: true,
      newBalance: updatedUser.credits
    };
  } catch (error) {
    console.error('Error processing daily recharge:', error);
    return {
      success: false,
      recharged: false,
      newBalance: await getUserCredits(userId),
      error: error instanceof Error ? error.message : 'Failed to process daily recharge'
    };
  }
}

/**
 * Process daily recharge for all eligible users
 * This is meant to be called by a cron job
 */
export async function processDailyRechargeForAllUsers(): Promise<{
  success: boolean;
  totalUsers: number;
  rechargedUsers: number;
  errors: number;
  error?: string;
}> {
  try {
    // Get all users
    const allUsers = await db.user.findMany({
      select: { id: true }
    });

    let rechargedCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of allUsers) {
      const result = await processDailyRecharge(user.id);
      if (result.success && result.recharged) {
        rechargedCount++;
      } else if (!result.success) {
        errorCount++;
        console.error(`❌ Failed to recharge user ${user.id}:`, result.error);
      }
    }

    console.log(`✅ Daily recharge completed: ${rechargedCount}/${allUsers.length} users recharged`);

    return {
      success: true,
      totalUsers: allUsers.length,
      rechargedUsers: rechargedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Error processing daily recharge for all users:', error);
    return {
      success: false,
      totalUsers: 0,
      rechargedUsers: 0,
      errors: 0,
      error: error instanceof Error ? error.message : 'Failed to process daily recharge for all users'
    };
  }
}

