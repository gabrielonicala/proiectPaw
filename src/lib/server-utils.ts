import { JournalEntry } from "@/types";
import { db } from "./db";

// Database functions for journal entries
export async function saveEntryToDatabase(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<JournalEntry> {
  const dbEntry = await db.journalEntry.create({
    data: {
      userId: entry.userId,
      characterId: entry.characterId,
      originalText: entry.originalText,
      reimaginedText: entry.reimaginedText,
      imageUrl: entry.imageUrl,
      // videoUrl: entry.videoUrl, // VIDEO GENERATION COMMENTED OUT
      // coming-soon entries don't need special handling
      outputType: entry.outputType,
      pastContext: entry.pastContext ? JSON.stringify(entry.pastContext) : undefined,
    },
  });

  return {
    id: dbEntry.id,
    userId: dbEntry.userId,
    characterId: dbEntry.characterId,
    originalText: dbEntry.originalText,
    reimaginedText: dbEntry.reimaginedText || undefined,
    imageUrl: dbEntry.imageUrl || undefined,
    // videoUrl: dbEntry.videoUrl || undefined, // VIDEO GENERATION COMMENTED OUT
    outputType: dbEntry.outputType as 'text' | 'image' | 'coming-soon',
    createdAt: dbEntry.createdAt,
    updatedAt: dbEntry.updatedAt,
    pastContext: dbEntry.pastContext ? JSON.parse(dbEntry.pastContext) : undefined,
  };
}

export async function loadEntriesFromDatabase(userId: string): Promise<JournalEntry[]> {
  const dbEntries = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return dbEntries.map(entry => ({
    id: entry.id,
    userId: entry.userId,
    characterId: entry.characterId,
    originalText: entry.originalText,
    reimaginedText: entry.reimaginedText || undefined,
    imageUrl: entry.imageUrl || undefined,
    // videoUrl: entry.videoUrl || undefined, // VIDEO GENERATION COMMENTED OUT
    outputType: entry.outputType as 'text' | 'image' | 'coming-soon',
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    pastContext: entry.pastContext ? JSON.parse(entry.pastContext) : undefined,
  }));
}

export async function deleteEntryFromDatabase(entryId: string, userId: string): Promise<void> {
  await db.journalEntry.delete({
    where: { 
      id: entryId,
      userId: userId, // Ensure user can only delete their own entries
    },
  });
}
