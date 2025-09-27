import { db } from './db';

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
      throw new Error('User not found');
    }
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
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

    // Determine how many characters the user should have access to
    const isActiveSubscription = user.subscriptionStatus === 'active' && user.subscriptionPlan === 'tribute';
    const totalAllowed = isActiveSubscription ? 3 : 1;

    console.log('Access calculation:', {
      isActiveSubscription,
      totalAllowed,
      characterSlots: user.characterSlots
    });

    // Split characters into accessible and locked
    const accessibleCharacters = user.characters.slice(0, totalAllowed);
    const lockedCharacters = user.characters.slice(totalAllowed);

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
 * Get the user's active character (first accessible character if current active is locked)
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

  const accessInfo = await getCharacterAccess(userId);
  
  // If current active character is accessible, return it
  if (user.activeCharacter && accessInfo.canAccessCharacter(user.activeCharacter.id)) {
    return user.activeCharacter;
  }

  // Otherwise, return the first accessible character
  if (accessInfo.accessibleCharacters.length > 0) {
    const firstAccessible = accessInfo.accessibleCharacters[0];
    
    // Update the user's active character to the first accessible one
    await db.user.update({
      where: { id: userId },
      data: { activeCharacterId: firstAccessible.id }
    });

    return firstAccessible;
  }

  return null;
}

/**
 * Migrate users who have more characters than their plan allows
 * This should be run when subscription limits change
 */
export async function migrateCharacterAccess(): Promise<void> {
  console.log('🔄 Starting character access migration...');

  const users = await db.user.findMany({
    include: {
      characters: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  let migratedCount = 0;

  for (const user of users) {
    const isActiveSubscription = user.subscriptionStatus === 'active' && user.subscriptionPlan === 'tribute';
    const totalAllowed = isActiveSubscription ? 3 : 1;

    if (user.characters.length > totalAllowed) {
      console.log(`👤 Migrating user ${user.username}: ${user.characters.length} → ${totalAllowed} characters`);
      
      // Update character slots to match plan
      await db.user.update({
        where: { id: user.id },
        data: { characterSlots: totalAllowed }
      });

      // Ensure active character is accessible
      const accessInfo = await getCharacterAccess(user.id);
      if (user.activeCharacterId && !accessInfo.canAccessCharacter(user.activeCharacterId)) {
        // Switch to first accessible character
        if (accessInfo.accessibleCharacters.length > 0) {
          await db.user.update({
            where: { id: user.id },
            data: { activeCharacterId: accessInfo.accessibleCharacters[0].id }
          });
          console.log(`  ✅ Switched active character to: ${accessInfo.accessibleCharacters[0].name}`);
        }
      }

      migratedCount++;
    }
  }

  console.log(`✅ Migration complete! Migrated ${migratedCount} users.`);
}
