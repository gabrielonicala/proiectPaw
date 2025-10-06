import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { User, Theme, Character } from '@/types';
import { migrateTheme } from '@/lib/theme-migration';
import { validateUserSession } from '@/lib/auth';

// Type for database character with all fields
type DatabaseCharacter = {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  appearance: string;
  pronouns: string;
  customPronouns: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Validate that the user still exists in the database
    const userExists = await validateUserSession(userId);
    if (!userExists) {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        activeCharacterId: true,
        characterSlots: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionId: true,
        subscriptionEndsAt: true,
        createdAt: true,
        activeCharacter: {
          select: {
            id: true,
            name: true,
            description: true,
            theme: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            appearance: true,
            pronouns: true,
            customPronouns: true,
            experience: true,
            level: true,
            stats: true
          }
        },
        characters: {
          select: {
            id: true,
            name: true,
            description: true,
            theme: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            appearance: true,
            pronouns: true,
            customPronouns: true,
            experience: true,
            level: true,
            stats: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse avatar and stats data for characters
    const charactersWithParsedAvatars = user.characters.map((character: any) => ({
      ...character,
      userId: user.id,
      description: character.description || undefined,
      theme: migrateTheme(character.theme) as Theme,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      appearance: character.appearance as 'masculine' | 'feminine' | 'androgynous' | 'custom',
      pronouns: character.pronouns as 'he/him' | 'she/her' | 'they/them' | 'custom',
      customPronouns: character.customPronouns || undefined,
      experience: character.experience || 0,
      level: character.level || 1,
      stats: character.stats ? JSON.parse(character.stats) : null
    })) as Character[];

    const activeCharacterWithParsedAvatar = user.activeCharacter ? {
      ...user.activeCharacter,
      userId: user.id,
      description: user.activeCharacter.description || undefined,
      theme: migrateTheme(user.activeCharacter.theme) as Theme,
      avatar: user.activeCharacter.avatar ? JSON.parse(user.activeCharacter.avatar) : null,
      appearance: user.activeCharacter.appearance as 'masculine' | 'feminine' | 'androgynous' | 'custom',
      pronouns: user.activeCharacter.pronouns as 'he/him' | 'she/her' | 'they/them' | 'custom',
      customPronouns: user.activeCharacter.customPronouns || undefined,
      experience: user.activeCharacter.experience || 0,
      level: user.activeCharacter.level || 1,
      stats: user.activeCharacter.stats ? JSON.parse(user.activeCharacter.stats) : null
    } as Character : null;

    const userData: User = {
      id: user.id,
      name: user.name || undefined,
      username: user.username || undefined,
      email: user.email,
      activeCharacterId: user.activeCharacterId || undefined,
      characterSlots: user.characterSlots,
      subscriptionPlan: (user.subscriptionPlan as 'tribute' | 'free') || undefined,
      subscriptionStatus: (user.subscriptionStatus as 'active' | 'canceled' | 'past_due' | 'inactive') || undefined,
      subscriptionId: user.subscriptionId || undefined,
      subscriptionEndsAt: user.subscriptionEndsAt || undefined,
      createdAt: user.createdAt,
      characters: charactersWithParsedAvatars,
      activeCharacter: activeCharacterWithParsedAvatar || undefined
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!(session as { user: { id: string } })?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session as { user: { id: string } }).user.id;
    
    // Validate that the user still exists in the database
    const userExists = await validateUserSession(userId);
    if (!userExists) {
      return NextResponse.json({ 
        error: 'Your account has been deleted. You will be signed out automatically.',
        code: 'USER_ACCOUNT_DELETED',
        autoLogout: true
      }, { status: 401 });
    }

    const { characterSlots } = await request.json();

    // Only allow updating character slots (for subscription upgrades)
    const updateData: { characterSlots?: number } = {};
    
    if (characterSlots !== undefined) {
      updateData.characterSlots = characterSlots;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        activeCharacterId: true,
        characterSlots: true,
        createdAt: true,
        activeCharacter: {
          select: {
            id: true,
            name: true,
            description: true,
            theme: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            appearance: true,
            pronouns: true,
            customPronouns: true,
            experience: true,
            level: true,
            stats: true
          }
        },
        characters: {
          select: {
            id: true,
            name: true,
            description: true,
            theme: true,
            avatar: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            appearance: true,
            pronouns: true,
            customPronouns: true,
            experience: true,
            level: true,
            stats: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Parse avatar and stats data for characters
    const charactersWithParsedAvatars = updatedUser.characters.map((character: any) => ({
      ...character,
      userId: updatedUser.id,
      description: character.description || undefined,
      theme: migrateTheme(character.theme) as Theme,
      avatar: character.avatar ? JSON.parse(character.avatar) : null,
      appearance: character.appearance as 'masculine' | 'feminine' | 'androgynous' | 'custom',
      pronouns: character.pronouns as 'he/him' | 'she/her' | 'they/them' | 'custom',
      customPronouns: character.customPronouns || undefined,
      experience: character.experience || 0,
      level: character.level || 1,
      stats: character.stats ? JSON.parse(character.stats) : null
    })) as Character[];

    const activeCharacterWithParsedAvatar = updatedUser.activeCharacter ? {
      ...updatedUser.activeCharacter,
      userId: updatedUser.id,
      description: updatedUser.activeCharacter.description || undefined,
      theme: migrateTheme(updatedUser.activeCharacter.theme) as Theme,
      avatar: updatedUser.activeCharacter.avatar ? JSON.parse(updatedUser.activeCharacter.avatar) : null,
      appearance: updatedUser.activeCharacter.appearance as 'masculine' | 'feminine' | 'androgynous' | 'custom',
      pronouns: updatedUser.activeCharacter.pronouns as 'he/him' | 'she/her' | 'they/them' | 'custom',
      customPronouns: updatedUser.activeCharacter.customPronouns || undefined,
      experience: updatedUser.activeCharacter.experience || 0,
      level: updatedUser.activeCharacter.level || 1,
      stats: updatedUser.activeCharacter.stats ? JSON.parse(updatedUser.activeCharacter.stats) : null
    } as Character : null;

    const userData: User = {
      id: updatedUser.id,
      name: updatedUser.name || undefined,
      username: updatedUser.username || undefined,
      email: updatedUser.email,
      activeCharacterId: updatedUser.activeCharacterId || undefined,
      characterSlots: updatedUser.characterSlots,
      createdAt: updatedUser.createdAt,
      characters: charactersWithParsedAvatars,
      activeCharacter: activeCharacterWithParsedAvatar || undefined
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}