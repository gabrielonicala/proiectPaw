import { db } from './db';
import { hasPremiumAccess } from './paddle';

export interface CharacterAccessInfo {
  accessibleCharacters: any[];
  lockedCharacters: any[];
  canAccessCharacter: (characterId: string) => boolean;
  totalAllowed: number;
  totalOwned: number;
}

/**
 * Get character access information for a user based on their subscription
 */
export async function getCharacterAccess(userId: string): Promise<CharacterAccessInfo> {
  try {
    console.log('Getting character access for user:', userId);
    
    // First, let's check if the user exists at all
    const userExists = await db.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error('User not found in database:', userId);
      console.error('This could indicate:');
      console.error('1. User was deleted from database');
      console.error('2. Database connection issue');
      console.error('3. Session contains stale user ID');
      throw new Error('USER_ACCOUNT_DELETED');
    }
    
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        characterSlots: true,
        activeCharacterId: true,
        characters: {
          orderBy: { createdAt: 'asc' } // First created character gets priority
        }
      }
    });

    if (!user) {
      console.error('User found but query with includes failed:', userId);
      throw new Error('User not found');
    }

    console.log('User found:', {
      id: user.id,
      username: user.username,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      characterSlots: user.characterSlots,
      characterCount: user.characters.length
    });

    // Determine character access based on subscription
    // Check if user has premium access (active subscription OR cancelled but still in grace period)
    const isActiveSubscription = hasPremiumAccess(user);
    
    // Premium users: all characters accessible
    // Free users: only current active character accessible
    const totalAllowed = isActiveSubscription ? user.characters.length : 1;

    console.log('Access calculation:', {
      isActiveSubscription,
      totalAllowed,
      characterSlots: user.characterSlots
    });

    // Split characters into accessible and locked
    let accessibleCharacters: any[] = [];
    let lockedCharacters: any[] = [];
    
    if (isActiveSubscription) {
      // Premium users: all characters accessible
      accessibleCharacters = user.characters;
      lockedCharacters = [];
    } else {
      // Free users: only current active character accessible
      console.log('🔍 Free user character access logic:', {
        activeCharacterId: user.activeCharacterId,
        characterIds: user.characters.map(c => ({ id: c.id, name: c.name }))
      });
      
      if (user.activeCharacterId) {
        const activeChar = user.characters.find(char => char.id === user.activeCharacterId);
        console.log('🔍 Looking for active character:', {
          activeCharacterId: user.activeCharacterId,
          found: activeChar ? { id: activeChar.id, name: activeChar.name } : null
        });
        
        if (activeChar) {
          accessibleCharacters = [activeChar];
          lockedCharacters = user.characters.filter(char => char.id !== user.activeCharacterId);
          console.log('✅ Found active character, making it accessible:', activeChar.name);
        } else {
          // Fallback: first character if active character not found
          accessibleCharacters = user.characters.slice(0, 1);
          lockedCharacters = user.characters.slice(1);
          console.log('⚠️ Active character not found in characters array, using first character:', accessibleCharacters[0]?.name);
        }
      } else {
        // No active character: first character accessible
        accessibleCharacters = user.characters.slice(0, 1);
        lockedCharacters = user.characters.slice(1);
        console.log('⚠️ No active character ID, using first character:', accessibleCharacters[0]?.name);
      }
    }

    console.log('Character split:', {
      accessibleCount: accessibleCharacters.length,
      lockedCount: lockedCharacters.length
    });

    return {
      accessibleCharacters,
      lockedCharacters,
      canAccessCharacter: (characterId: string) => {
        return accessibleCharacters.some(char => char.id === characterId);
      },
      totalAllowed,
      totalOwned: user.characters.length
    };
  } catch (error) {
    console.error('Error in getCharacterAccess:', error);
    throw error;
  }
}

/**
 * Check if a user can access a specific character
 */
export async function canAccessCharacter(userId: string, characterId: string): Promise<boolean> {
  const accessInfo = await getCharacterAccess(userId);
  return accessInfo.canAccessCharacter(characterId);
}

/**
 * Get the user's active character (current active character if accessible, otherwise first accessible)
 */
export async function getActiveCharacter(userId: string): Promise<any | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      activeCharacter: true,
      characters: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!user) {
    return null;
  }

  console.log('🔍 getActiveCharacter debug:', {
    userId: user.id,
    username: user.username,
    activeCharacterId: user.activeCharacterId,
    activeCharacter: user.activeCharacter ? { id: user.activeCharacter.id, name: user.activeCharacter.name } : null,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    characterSlots: user.characterSlots,
    totalCharacters: user.characters.length
  });

  const accessInfo = await getCharacterAccess(userId);
  
  console.log('🔍 Character access info:', {
    accessibleCount: accessInfo.accessibleCharacters.length,
    lockedCount: accessInfo.lockedCharacters.length,
    accessibleCharacters: accessInfo.accessibleCharacters.map(c => ({ id: c.id, name: c.name })),
    lockedCharacters: accessInfo.lockedCharacters.map(c => ({ id: c.id, name: c.name }))
  });
  
  // If current active character is accessible, return it
  if (user.activeCharacter && accessInfo.canAccessCharacter(user.activeCharacter.id)) {
    console.log('✅ Returning current active character:', user.activeCharacter.name);
    return user.activeCharacter;
  }

  // Otherwise, return the first accessible character but DON'T update the database
  // The user should manually switch if they want to change characters
  if (accessInfo.accessibleCharacters.length > 0) {
    const firstAccessible = accessInfo.accessibleCharacters[0];
    console.log('⚠️ Current active character not accessible, returning first accessible:', firstAccessible.name);
    return firstAccessible;
  }

  console.log('❌ No accessible characters found');
  return null;
}

/**
 * Migrate users who have more characters than their plan allows
 * This should be run when subscription limits change
 */
export async function migrateCharacterAccess(): Promise<void> {
  console.log('🔄 Starting character access migration...');

  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      activeCharacterId: true,
      characters: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  let migratedCount = 0;

  for (const user of users) {
    const isActiveSubscription = hasPremiumAccess(user);
    
    // Premium users: all characters accessible
    // Free users: only current active character accessible
    const totalAllowed = isActiveSubscription ? user.characters.length : 1;

    if (user.characters.length > totalAllowed) {
      console.log(`👤 Migrating user ${user.username}: ${user.characters.length} → ${totalAllowed} characters accessible`);
      
      // Update character slots to match plan
      await db.user.update({
        where: { id: user.id },
        data: { characterSlots: totalAllowed }
      });

      // For free users, ensure they have an active character set
      if (!isActiveSubscription && !user.activeCharacterId && user.characters.length > 0) {
        // Set first character as active if no active character
        await db.user.update({
          where: { id: user.id },
          data: { activeCharacterId: user.characters[0].id }
        });
        console.log(`  ✅ Set active character to: ${user.characters[0].name}`);
      }

      migratedCount++;
    }
  }

  console.log(`✅ Migration complete! Migrated ${migratedCount} users.`);
}

/**
 * Clean up expired subscriptions
 * This should be run periodically to clean up database
 */
export async function cleanupExpiredSubscriptions(): Promise<void> {
  console.log('🧹 Starting expired subscription cleanup...');
  console.log('🔍 Looking for users with expired paid subscriptions');

  try {
    // Find users with expired subscriptions (any paid plan)
    const expiredUsers = await db.user.findMany({
      where: {
        subscriptionPlan: { in: ['weekly', 'monthly', 'yearly'] },
        subscriptionStatus: 'canceled',
        subscriptionEndsAt: { lt: new Date() }
      },
      select: {
        id: true,
        username: true,
        subscriptionEndsAt: true,
        characterSlots: true
      }
    });

    console.log(`🔍 Found ${expiredUsers.length} expired users:`, expiredUsers);

    if (expiredUsers.length === 0) {
      console.log('✅ No expired subscriptions found');
      return;
    }

    console.log(`🔍 Found ${expiredUsers.length} expired subscriptions`);

    // Update expired subscriptions to free plan
    // For each user, preserve their current active character when downgrading
    for (const expiredUser of expiredUsers) {
      console.log(`🔄 Updating user ${expiredUser.username} (${expiredUser.id}) to free plan...`);
      
      const updateResult = await db.user.update({
        where: { id: expiredUser.id },
        data: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'free',
          subscriptionId: null,
          subscriptionEndsAt: null,
          characterSlots: 1 // Reset to free plan character slots
          // Note: We intentionally DON'T change activeCharacterId to preserve user's current character
        }
      });
      
      console.log(`✅ Updated user ${expiredUser.username}:`, {
        subscriptionPlan: updateResult.subscriptionPlan,
        subscriptionStatus: updateResult.subscriptionStatus,
        characterSlots: updateResult.characterSlots,
        activeCharacterId: updateResult.activeCharacterId
      });
    }

    console.log(`✅ Cleaned up ${expiredUsers.length} expired subscriptions`);
    
    // Log details for each cleaned up user
    expiredUsers.forEach(user => {
      console.log(`  👤 ${user.username}: subscription expired on ${user.subscriptionEndsAt}`);
    });

  } catch (error) {
    console.error('❌ Error during subscription cleanup:', error);
  }
}
