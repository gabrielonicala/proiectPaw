import { JournalEntry } from "@/types";
import { db } from "./db";
import { validateUserSession } from "./auth";
import { evaluateStatChanges, applyStatChanges } from "./stat-evaluation";
import { encryptText, decryptText } from "./encryption";

// Database functions for journal entries
export async function saveEntryToDatabase(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<JournalEntry> {
  // Validate that the user still exists in the database
  const userExists = await validateUserSession(entry.userId);
  if (!userExists) {
    throw new Error('USER_ACCOUNT_DELETED');
  }

  // Encrypt text fields directly
  const encryptedOriginalText = await encryptText(entry.originalText);
  const encryptedReimaginedText = entry.reimaginedText 
    ? await encryptText(entry.reimaginedText) 
    : null;

  const dbEntry = await db.journalEntry.create({
    data: {
      userId: entry.userId,
      characterId: entry.characterId,
      originalText: encryptedOriginalText,
      reimaginedText: encryptedReimaginedText,
      imageUrl: entry.imageUrl,
      // videoUrl: entry.videoUrl, // VIDEO GENERATION COMMENTED OUT
      // coming-soon entries don't need special handling
      outputType: entry.outputType,
      pastContext: entry.pastContext ? JSON.stringify(entry.pastContext) : undefined,
    },
  });

  // Evaluate stat changes for text entries only
  if (entry.outputType === 'text' && entry.reimaginedText) {
    try {
      // Get character info for stat evaluation
      const character = await db.character.findUnique({
        where: { id: entry.characterId },
        select: { theme: true, stats: true }
      });

      if (character?.theme && character?.stats) {
        const currentStats = JSON.parse(character.stats);
        
        // Evaluate stat changes
        const statChanges = await evaluateStatChanges(
          entry.originalText,
          entry.reimaginedText,
          character.theme,
          currentStats
        );

        // Apply stat changes if any
        if (Object.keys(statChanges).length > 0) {
          await applyStatChanges(
            entry.characterId,
            dbEntry.id,
            statChanges,
            entry.originalText
          );
        }
      }
    } catch (error) {
      console.error('Error evaluating stat changes:', error);
      // Don't fail the entry creation if stat evaluation fails
    }
  }

  // Fetch the updated entry with stat analysis
  const updatedEntry = await db.journalEntry.findUnique({
    where: { id: dbEntry.id },
    select: {
      id: true,
      userId: true,
      characterId: true,
      originalText: true,
      reimaginedText: true,
      imageUrl: true,
      outputType: true,
      createdAt: true,
      updatedAt: true,
      pastContext: true,
      expGained: true,
      statAnalysis: true,
    }
  });

  // Return decrypted data
  return {
    id: updatedEntry!.id,
    userId: updatedEntry!.userId,
    characterId: updatedEntry!.characterId,
    originalText: await decryptText(updatedEntry!.originalText),
    reimaginedText: updatedEntry!.reimaginedText 
      ? await decryptText(updatedEntry!.reimaginedText) 
      : undefined,
    imageUrl: updatedEntry!.imageUrl || undefined,
    // videoUrl: updatedEntry!.videoUrl || undefined, // VIDEO GENERATION COMMENTED OUT
    outputType: updatedEntry!.outputType as 'text' | 'image' | 'coming-soon',
    createdAt: updatedEntry!.createdAt,
    updatedAt: updatedEntry!.updatedAt,
    pastContext: updatedEntry!.pastContext ? JSON.parse(updatedEntry!.pastContext) : undefined,
    expGained: updatedEntry!.expGained || undefined,
    statAnalysis: updatedEntry!.statAnalysis || undefined,
  };
}

export async function loadEntriesFromDatabase(userId: string): Promise<JournalEntry[]> {
  // Validate that the user still exists in the database
  const userExists = await validateUserSession(userId);
  if (!userExists) {
    throw new Error('USER_ACCOUNT_DELETED');
  }

  const dbEntries = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Decrypt all entries
  const decryptedEntries = await Promise.all(
    dbEntries.map(async (entry) => ({
      id: entry.id,
      userId: entry.userId,
      characterId: entry.characterId,
      originalText: await decryptText(entry.originalText),
      reimaginedText: entry.reimaginedText 
        ? await decryptText(entry.reimaginedText) 
        : undefined,
      imageUrl: entry.imageUrl || undefined,
      // videoUrl: entry.videoUrl || undefined, // VIDEO GENERATION COMMENTED OUT
      outputType: entry.outputType as 'text' | 'image' | 'coming-soon',
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
      pastContext: entry.pastContext ? JSON.parse(entry.pastContext) : undefined,
      expGained: entry.expGained || undefined,
      statAnalysis: entry.statAnalysis || undefined,
    }))
  );

  return decryptedEntries;
}

export async function deleteEntryFromDatabase(entryId: string, userId: string): Promise<void> {
  // Validate that the user still exists in the database
  const userExists = await validateUserSession(userId);
  if (!userExists) {
    throw new Error('USER_ACCOUNT_DELETED');
  }

  await db.journalEntry.delete({
    where: { 
      id: entryId,
      userId: userId, // Ensure user can only delete their own entries
    },
  });
}
