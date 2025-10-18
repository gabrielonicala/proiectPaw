import { db } from './db';
import { encryptText, decryptText } from './encryption';

/**
 * Create a new journal entry with encryption
 */
export async function createJournalEntry(data: {
  originalText: string;
  reimaginedText?: string;
  imageUrl?: string;
  videoUrl?: string;
  outputType: string;
  userId: string;
  characterId: string;
  pastContext?: string;
  expGained?: number;
  statAnalysis?: string;
}) {
  // Encrypt the text fields directly
  const encryptedOriginalText = await encryptText(data.originalText);
  const encryptedReimaginedText = data.reimaginedText 
    ? await encryptText(data.reimaginedText) 
    : null;

  return await db.journalEntry.create({
    data: {
      // Store encrypted data directly in main fields
      originalText: encryptedOriginalText,
      reimaginedText: encryptedReimaginedText,
      
      // Other fields
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      outputType: data.outputType,
      userId: data.userId,
      characterId: data.characterId,
      pastContext: data.pastContext,
      expGained: data.expGained || 0,
      statAnalysis: data.statAnalysis,
    }
  });
}

/**
 * Get a journal entry with automatic decryption
 */
export async function getJournalEntry(id: string) {
  const entry = await db.journalEntry.findUnique({
    where: { id },
    include: {
      character: true,
      user: true,
      statProgressions: true
    }
  });

  if (!entry) return null;

  // Return decrypted data
  return {
    ...entry,
    originalText: await decryptText(entry.originalText),
    reimaginedText: entry.reimaginedText 
      ? await decryptText(entry.reimaginedText) 
      : null
  };
}

/**
 * Get journal entries for a character with automatic decryption
 */
export async function getJournalEntriesForCharacter(
  characterId: string, 
  limit: number = 50,
  offset: number = 0
) {
  const entries = await db.journalEntry.findMany({
    where: { characterId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      character: true,
      statProgressions: true
    }
  });

  // Decrypt all entries
  const decryptedEntries = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      originalText: await decryptText(entry.originalText),
      reimaginedText: entry.reimaginedText 
        ? await decryptText(entry.reimaginedText) 
        : null
    }))
  );

  return decryptedEntries;
}

/**
 * Update a journal entry with encryption
 */
export async function updateJournalEntry(
  id: string, 
  data: {
    originalText?: string;
    reimaginedText?: string;
    imageUrl?: string;
    videoUrl?: string;
    pastContext?: string;
    expGained?: number;
    statAnalysis?: string;
  }
) {
  const updateData: any = { ...data };

  // Encrypt text fields if provided
  if (data.originalText !== undefined) {
    updateData.originalText = await encryptText(data.originalText);
  }
  if (data.reimaginedText !== undefined) {
    updateData.reimaginedText = data.reimaginedText 
      ? await encryptText(data.reimaginedText) 
      : null;
  }

  return await db.journalEntry.update({
    where: { id },
    data: updateData
  });
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string) {
  return await db.journalEntry.delete({
    where: { id }
  });
}

/**
 * Get journal entries for a user with automatic decryption
 */
export async function getJournalEntriesForUser(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const entries = await db.journalEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      character: true,
      statProgressions: true
    }
  });

  // Decrypt all entries
  const decryptedEntries = await Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      originalText: await decryptText(entry.originalText),
      reimaginedText: entry.reimaginedText 
        ? await decryptText(entry.reimaginedText) 
        : null
    }))
  );

  return decryptedEntries;
}
