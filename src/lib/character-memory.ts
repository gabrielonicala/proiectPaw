import { db } from './db';
import { Character, CharacterMemory, JournalEntry } from '@prisma/client';
import { themes } from '@/themes';

export interface WorldState {
  relationships: Record<string, string>; // name -> relationship type
  locations: string[]; // visited/important locations
  ongoingPlots: string[]; // ongoing storylines
  characterTraits: string[]; // personality traits that have emerged
}

export interface RecentEntry {
  id: string;
  originalText: string;
  reimaginedText: string | null;
  createdAt: Date;
}

export interface CharacterMemoryData {
  worldState: WorldState;
  summaryLog: string;
  recentEntries: RecentEntry[];
}

// Memory limits to prevent unbounded growth
const MEMORY_LIMITS = {
  MAX_SUMMARY_LENGTH: 2000,
  MAX_RECENT_ENTRIES: 5,
  MAX_WORLD_STATE_ITEMS: 20
} as const;

/**
 * Get or create character memory
 */
export async function getCharacterMemory(characterId: string): Promise<CharacterMemoryData> {
  let memory = await db.characterMemory.findUnique({
    where: { characterId }
  });

  if (!memory) {
    // Create initial memory
    memory = await db.characterMemory.create({
      data: {
        characterId,
        worldState: JSON.stringify({
          relationships: {},
          locations: [],
          ongoingPlots: [],
          characterTraits: []
        }),
        summaryLog: '',
        recentEntries: JSON.stringify([])
      }
    });
  }

  return {
    worldState: JSON.parse(memory.worldState || '{}'),
    summaryLog: memory.summaryLog || '',
    recentEntries: JSON.parse(memory.recentEntries || '[]')
  };
}

/**
 * Update character memory with new entry
 */
export async function updateCharacterMemory(
  characterId: string, 
  newEntry: { originalText: string; reimaginedText: string | null }
): Promise<void> {
  const memory = await getCharacterMemory(characterId);
  
  // Add new entry to recent entries
  const newRecentEntry: RecentEntry = {
    id: Date.now().toString(), // Temporary ID
    originalText: newEntry.originalText,
    reimaginedText: newEntry.reimaginedText,
    createdAt: new Date()
  };

  // Keep only last N entries (enforce limit)
  const updatedRecentEntries = [newRecentEntry, ...memory.recentEntries].slice(0, MEMORY_LIMITS.MAX_RECENT_ENTRIES);

  // Update summary log (this will be enhanced with AI summarization later)
  const updatedSummaryLog = await updateSummaryLog(memory.summaryLog, newEntry);

  // Update world state (this will be enhanced with AI analysis later)
  const updatedWorldState = await updateWorldState(memory.worldState, newEntry);

  // Monitor memory usage
  const memoryUsage = {
    summaryLength: updatedSummaryLog.length,
    recentEntriesCount: updatedRecentEntries.length,
    worldStateSize: JSON.stringify(updatedWorldState).length
  };
  
  // Log warning if approaching limits
  if (memoryUsage.summaryLength > MEMORY_LIMITS.MAX_SUMMARY_LENGTH * 0.8) {
    console.warn(`⚠️ Character ${characterId} memory approaching limit:`, memoryUsage);
  }

  // Save to database
  await db.characterMemory.upsert({
    where: { characterId },
    create: {
      characterId,
      worldState: JSON.stringify(updatedWorldState),
      summaryLog: updatedSummaryLog,
      recentEntries: JSON.stringify(updatedRecentEntries)
    },
    update: {
      worldState: JSON.stringify(updatedWorldState),
      summaryLog: updatedSummaryLog,
      recentEntries: JSON.stringify(updatedRecentEntries),
      lastUpdated: new Date()
    }
  });
}

/**
 * Update summary log with new entry
 * Implements compression to prevent unbounded growth
 */
async function updateSummaryLog(currentSummary: string, newEntry: { originalText: string; reimaginedText: string | null }): Promise<string> {
  const entryText = newEntry.reimaginedText || newEntry.originalText;
  const date = new Date().toLocaleDateString();
  
  // Add new entry
  const newSummary = currentSummary ? `${currentSummary}\n\n${date}: ${entryText}` : `${date}: ${entryText}`;
  
  // Compress if summary gets too long (prevent memory issues)
  if (newSummary.length > MEMORY_LIMITS.MAX_SUMMARY_LENGTH) {
    return await compressSummary(newSummary);
  }
  
  return newSummary;
}

/**
 * Compress summary to prevent unbounded growth
 * Keeps only the most recent entries and a compressed overview
 */
async function compressSummary(summary: string): Promise<string> {
  const lines = summary.split('\n\n');
  
  // Keep last 3 entries + compressed overview
  const recentEntries = lines.slice(-3);
  const olderEntries = lines.slice(0, -3);
  
  if (olderEntries.length === 0) {
    return recentEntries.join('\n\n');
  }
  
  // Create compressed overview of older entries
  const compressedOverview = `[Previous ${olderEntries.length} entries compressed for memory efficiency]`;
  
  return `${compressedOverview}\n\n${recentEntries.join('\n\n')}`;
}

/**
 * Update world state with new entry
 * TODO: Enhance with AI analysis
 */
async function updateWorldState(currentState: WorldState, newEntry: { originalText: string; reimaginedText: string | null }): Promise<WorldState> {
  // For now, just return current state
  // Later, we'll use AI to analyze and update relationships, locations, etc.
  return currentState;
}

/**
 * Get character memory for story generation
 */
export async function getCharacterMemoryForStory(characterId: string): Promise<{
  character: Character;
  memory: CharacterMemoryData;
}> {
  const character = await db.character.findUnique({
    where: { id: characterId },
    include: { memory: true }
  });

  if (!character) {
    throw new Error('Character not found');
  }

  const memory = await getCharacterMemory(characterId);

  return { character, memory };
}

/**
 * Create story generation prompt with memory context
 */
export function createStoryPromptWithMemory(
  character: Character,
  memory: CharacterMemoryData,
  userInput: string
): string {
  const themeConfig = getThemeConfig(character.theme);
  
  // Build character profile
  const characterProfile = `
Character Profile:
- Name: ${character.name}
- Pronouns: ${character.pronouns}
- Theme: ${themeConfig.name}
- Appearance: ${character.appearance}
- Avatar: ${character.avatar ? 'Custom avatar configured' : 'Default avatar'}
`;

  // Build world state summary
  const worldStateSummary = memory.worldState ? `
World State:
- Relationships: ${Object.entries(memory.worldState.relationships).map(([name, type]) => `${name} (${type})`).join(', ') || 'None yet'}
- Locations: ${memory.worldState.locations.join(', ') || 'None yet'}
- Ongoing Plots: ${memory.worldState.ongoingPlots.join(', ') || 'None yet'}
- Character Traits: ${memory.worldState.characterTraits.join(', ') || 'None yet'}
` : '';

  // Build recent journey summary
  const recentJourney = memory.summaryLog ? `
Recent Journey: ${memory.summaryLog}
` : '';

  // Build recent entries for continuity
  const recentEntries = memory.recentEntries.length > 0 ? `
Recent Entries (for continuity reference):
${memory.recentEntries.map((entry, index) => 
  `- ${index === 0 ? 'Most Recent' : `${index + 1} entries ago`}: "${entry.reimaginedText || entry.originalText}"`
).join('\n')}
` : '';

  return `${characterProfile}${worldStateSummary}${recentJourney}${recentEntries}

CONTINUITY INSTRUCTIONS:
- NATURALLY REFERENCE previous events, locations, or characters when they relate to today's experience
- Weave continuity subtly into the narrative flow - don't force temporal connectors
- Reference specific elements from previous entries: locations, objects, or emotional states that naturally relate to today's experience
- Build upon the character's emotional journey and ongoing storylines
- Make connections feel natural and organic, not forced or obvious
- Examples of subtle continuity: mentioning the same location, referencing a previous meal, recalling an earlier emotion, or building on established relationships
- AVOID REPETITIVE OPENINGS: Don't start multiple stories with the same phrase or pattern as the previous stories
- VARY YOUR OPENINGS: Use different starting approaches - direct action, character thoughts, environmental details, etc.

Today, ${character.name} writes about: ${userInput}`;
}

/**
 * Get theme config from themes configuration
 */
function getThemeConfig(themeId: string) {
  return themes[themeId] || {
    name: themeId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
}
