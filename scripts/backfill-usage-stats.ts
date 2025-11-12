/**
 * Backfill usage stats for all existing characters
 * This script calculates and populates usageStats for all characters based on their journal entries
 */

import { PrismaClient } from '@prisma/client';
import { decryptText } from '../src/lib/encryption';
import { StoredUsageStats, recalculateStreaksAndPatterns } from '../src/lib/usage-stats';

const prisma = new PrismaClient();

interface EntryData {
  id: string;
  outputType: string;
  reimaginedText: string | null;
  createdAt: Date;
}

async function calculateWordCount(text: string | null): Promise<number> {
  if (!text) return 0;
  
  try {
    // Try to decrypt (entries are stored encrypted)
    const decrypted = await decryptText(text);
    return decrypted.split(/\s+/).filter(word => word.length > 0).length;
  } catch (error) {
    // If decryption fails, try counting words directly (might be plain text in some cases)
    // This handles edge cases where text might not be encrypted
    try {
      return text.split(/\s+/).filter(word => word.length > 0).length;
    } catch {
      return 0;
    }
  }
}

async function calculateUsageStatsForCharacter(
  characterId: string,
  entries: EntryData[]
): Promise<StoredUsageStats> {
  if (entries.length === 0) {
    return {
      totalAdventures: 0,
      storiesCreated: 0,
      scenesGenerated: 0,
      longestStreak: 0,
      totalWordsWritten: 0,
      firstAdventureDate: null,
      lastAdventureDate: null,
      mostActiveDay: null,
      mostActiveHour: null,
      lastUpdated: new Date().toISOString()
    };
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Calculate cumulative stats
  let totalAdventures = entries.length;
  // Chapters only count text entries, not matching chapters from scenes
  let storiesCreated = entries.filter(e => e.outputType === 'text').length;
  let scenesGenerated = entries.filter(e => e.outputType === 'image').length;
  let totalWordsWritten = 0;

  // Calculate word count for all text entries AND matching chapters from image entries
  for (const entry of entries) {
    if (entry.reimaginedText && (entry.outputType === 'text' || entry.outputType === 'image')) {
      const wordCount = await calculateWordCount(entry.reimaginedText);
      totalWordsWritten += wordCount;
    }
  }

  // Get first and last adventure dates
  const firstAdventureDate = sortedEntries[0].createdAt.toISOString();
  const lastAdventureDate = sortedEntries[sortedEntries.length - 1].createdAt.toISOString();

  // Calculate streaks and activity patterns
  const { longestStreak, mostActiveDay, mostActiveHour } = 
    await recalculateStreaksAndPatterns(characterId, entries);

  return {
    totalAdventures,
    storiesCreated,
    scenesGenerated,
    longestStreak,
    totalWordsWritten,
    firstAdventureDate,
    lastAdventureDate,
    mostActiveDay,
    mostActiveHour,
    lastUpdated: new Date().toISOString()
  };
}

async function backfillUsageStats() {
  try {
    console.log('🚀 Starting usage stats backfill...\n');

    // Get all characters
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log(`📊 Found ${characters.length} characters to process\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Process each character
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      const progress = `[${i + 1}/${characters.length}]`;

      try {
        // Get all entries for this character
        const entries = await prisma.journalEntry.findMany({
          where: { characterId: character.id },
          select: {
            id: true,
            outputType: true,
            reimaginedText: true,
            createdAt: true
          },
          orderBy: { createdAt: 'asc' }
        });

        if (entries.length === 0) {
          console.log(`${progress} ⏭️  Skipping "${character.name}" - no entries`);
          skippedCount++;
          continue;
        }

        // Calculate usage stats
        const usageStats = await calculateUsageStatsForCharacter(character.id, entries);

        // Update character with usage stats using raw SQL (works even if Prisma client isn't regenerated)
        await prisma.$executeRaw`
          UPDATE "Character" 
          SET "usageStats" = ${JSON.stringify(usageStats)}::text
          WHERE id = ${character.id}
        `;

        console.log(
          `${progress} ✅ "${character.name}" - ${usageStats.totalAdventures} adventures, ` +
          `${usageStats.storiesCreated} stories, ${usageStats.scenesGenerated} scenes, ` +
          `${usageStats.longestStreak} day streak`
        );

        successCount++;
      } catch (error) {
        console.error(`${progress} ❌ Error processing "${character.name}":`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 Backfill Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));
    console.log('\n✅ Backfill complete!');

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillUsageStats();

