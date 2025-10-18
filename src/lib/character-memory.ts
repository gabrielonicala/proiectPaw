import { db } from './db';
import { Character, CharacterMemory, JournalEntry } from '@prisma/client';
import { themes } from '@/themes';

export interface Goal {
  id: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface Relationship {
  name: string;
  relationshipType: string;
  context: string; // what activity/context this relationship is about
  establishedIn: string; // brief description of when/where it was established
  lastMentioned: Date;
}

export interface Location {
  reimaginedName: string; // the fantasy name used in stories
  realName: string; // what it actually represents (e.g., "gym", "library", "office")
  context: string; // what activities happen there
  establishedIn: string; // brief description of when/where it was established
  lastMentioned: Date;
}

export interface WorldState {
  relationships: Relationship[]; // array of relationship objects with context
  locations: Location[]; // array of location objects with context
  goals: Goal[]; // goals with status tracking
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
  MAX_GOALS: 10,
  MAX_RELATIONSHIPS: 20
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
        memory: '{}', // Provide default value for the old memory field
        worldState: JSON.stringify({
          relationships: [],
          locations: [],
          goals: []
        }),
        summaryLog: '',
        recentEntries: JSON.stringify([])
      }
    });
  }

  const worldState = JSON.parse(memory.worldState || '{}');
  
  // Handle backward compatibility - migrate old structure to new structure
  if (worldState.relationships && !Array.isArray(worldState.relationships)) {
    // Convert old Record<string, string> format to new Relationship[] format
    worldState.relationships = Object.entries(worldState.relationships).map(([name, relationshipType]) => ({
      name,
      relationshipType,
      context: 'Unknown context',
      establishedIn: 'Previous entry',
      lastMentioned: new Date()
    }));
  }
  
  if (worldState.goals && !Array.isArray(worldState.goals)) {
    // Convert old string[] format to new Goal[] format
    worldState.goals = [];
  }
  
  // Ensure all are arrays
  if (!Array.isArray(worldState.relationships)) {
    worldState.relationships = [];
  }
  if (!Array.isArray(worldState.locations)) {
    worldState.locations = [];
  }
  if (!Array.isArray(worldState.goals)) {
    worldState.goals = [];
  }
  
  // Clean up any existing duplicate relationships and goals
  worldState.relationships = deduplicateRelationships(worldState.relationships);
  worldState.goals = deduplicateGoals(worldState.goals);

  return {
    worldState,
    summaryLog: memory.summaryLog || '',
    recentEntries: JSON.parse(memory.recentEntries || '[]')
  };
}

/**
 * Update character memory with new entry
 */
export async function updateCharacterMemory(
  characterId: string, 
  newEntry: { 
    originalText: string; 
    reimaginedText: string | null;
    worldStateUpdate?: { 
      relationships: Array<{ name: string; relationshipType: string; context: string; establishedIn: string }>; 
      locations: Array<{ reimaginedName: string; realName: string; context: string; establishedIn: string }>;
      goals: Array<{ description: string; status: string }>; 
    };
  }
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

  // Update world state with data from story generation
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
 */
async function updateWorldState(
  currentState: WorldState, 
  newEntry: { 
    originalText: string; 
    reimaginedText: string | null;
    worldStateUpdate?: { 
      relationships: Array<{ name: string; relationshipType: string; context: string; establishedIn: string }>; 
      locations: Array<{ reimaginedName: string; realName: string; context: string; establishedIn: string }>;
      goals: Array<{ description: string; status: string }>; 
    };
  }
): Promise<WorldState> {
  if (!newEntry.worldStateUpdate) {
    return currentState;
  }

  // Update relationships with context-aware deduplication
  const updatedRelationships = updateRelationships(currentState.relationships, newEntry.worldStateUpdate.relationships);

  // Update locations with context-aware deduplication
  const updatedLocations = updateLocations(currentState.locations, newEntry.worldStateUpdate.locations);

  // Update goals with smart deduplication and status tracking
  const updatedGoals = updateGoals(currentState.goals, newEntry.worldStateUpdate.goals);

  return {
    relationships: updatedRelationships,
    locations: updatedLocations,
    goals: updatedGoals
  };
}

/**
 * Update relationships with context-aware deduplication
 */
function updateRelationships(
  currentRelationships: Relationship[], 
  newRelationships: Array<{ name: string; relationshipType: string; context: string; establishedIn: string }>
): Relationship[] {
  const updatedRelationships = [...currentRelationships];
  
  for (const newRel of newRelationships) {
    // Filter out generic terms
    const lowerName = newRel.name.toLowerCase();
    const genericTerms = [
      'comrade', 'stranger', 'merchant', 'guard', 'soldier', 'knight', 'wizard', 'mage',
      'prince', 'princess', 'king', 'queen', 'lord', 'lady', 'captain', 'commander',
      'friend', 'enemy', 'ally', 'rival', 'mentor', 'student', 'teacher', 'master',
      'servant', 'butler', 'maid', 'peasant', 'noble', 'commoner', 'traveler', 'wanderer'
    ];
    
    if (genericTerms.includes(lowerName)) {
      continue; // Skip generic terms
    }
    
    // Check if this person already exists in a similar context
    const existingIndex = updatedRelationships.findIndex(
      rel => rel.name.toLowerCase() === newRel.name.toLowerCase() && 
             isSimilarContext(rel.context, newRel.context)
    );
    
    if (existingIndex >= 0) {
      // Update existing relationship (update lastMentioned)
      updatedRelationships[existingIndex].lastMentioned = new Date();
    } else {
      // Add new relationship
      const relationship: Relationship = {
        name: newRel.name,
        relationshipType: newRel.relationshipType,
        context: newRel.context,
        establishedIn: newRel.establishedIn,
        lastMentioned: new Date()
      };
      updatedRelationships.push(relationship);
    }
  }
  
  // Limit relationships to prevent unbounded growth
  return updatedRelationships.slice(0, MEMORY_LIMITS.MAX_RELATIONSHIPS);
}

/**
 * Update locations with context-aware deduplication
 */
function updateLocations(
  currentLocations: Location[], 
  newLocations: Array<{ reimaginedName: string; realName: string; context: string; establishedIn: string }>
): Location[] {
  const updatedLocations = [...currentLocations];
  
  for (const newLoc of newLocations) {
    // Check if this real location already exists (same real name and context)
    const existingIndex = updatedLocations.findIndex(
      loc => loc.realName.toLowerCase() === newLoc.realName.toLowerCase() && 
             loc.context.toLowerCase() === newLoc.context.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing location (update reimagined name and lastMentioned)
      updatedLocations[existingIndex].reimaginedName = newLoc.reimaginedName;
      updatedLocations[existingIndex].lastMentioned = new Date();
    } else {
      // Add new location
      const location: Location = {
        reimaginedName: newLoc.reimaginedName,
        realName: newLoc.realName,
        context: newLoc.context,
        establishedIn: newLoc.establishedIn,
        lastMentioned: new Date()
      };
      updatedLocations.push(location);
    }
  }
  
  // Limit locations to prevent unbounded growth
  return updatedLocations.slice(0, MEMORY_LIMITS.MAX_RELATIONSHIPS);
}

/**
 * Update goals with smart deduplication and status tracking
 */
function updateGoals(currentGoals: Goal[], newGoals: Array<{ description: string; status: string }>): Goal[] {
  const updatedGoals = [...currentGoals];
  
  for (const newGoal of newGoals) {
    // Skip invalid goals
    if (!newGoal || !newGoal.description || !newGoal.status) {
      continue;
    }
    
    // Check for similar existing goals (fuzzy matching)
    const existingGoalIndex = updatedGoals.findIndex(existingGoal => 
      existingGoal.description && isSimilarGoal(existingGoal.description, newGoal.description)
    );
    
    if (existingGoalIndex >= 0) {
      // Update existing goal status
      const existingGoal = updatedGoals[existingGoalIndex];
      if (newGoal.status === 'completed' || newGoal.status === 'failed') {
        existingGoal.status = newGoal.status as 'completed' | 'failed';
        existingGoal.completedAt = new Date();
      }
    } else {
      // Add new goal
      const goal: Goal = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        description: newGoal.description,
        status: newGoal.status as 'active' | 'completed' | 'failed',
        createdAt: new Date(),
        completedAt: newGoal.status === 'completed' || newGoal.status === 'failed' ? new Date() : undefined
      };
      updatedGoals.push(goal);
    }
  }
  
  // Remove completed/failed goals that are older than 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const filteredGoals = updatedGoals.filter(goal => {
    // Skip invalid goals
    if (!goal || !goal.description) return false;
    
    if (goal.status === 'active') return true;
    if (goal.completedAt && goal.completedAt > thirtyDaysAgo) return true;
    return false;
  });
  
  return filteredGoals.slice(0, MEMORY_LIMITS.MAX_GOALS);
}

/**
 * Check if two goals are similar (for deduplication)
 */
function isSimilarGoal(goal1: string, goal2: string): boolean {
  // Handle undefined/null values
  if (!goal1 || !goal2) return false;
  
  const normalize = (text: string) => text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const norm1 = normalize(goal1);
  const norm2 = normalize(goal2);
  
  // Check for exact match
  if (norm1 === norm2) return true;
  
  // Check for high similarity (same core concept)
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  // If they share most words, they're similar
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  
  // Check for goal-specific synonyms and concepts
  const goalSynonyms = {
    'muscle': ['muscles', 'muscular', 'strength', 'strong', 'build', 'building'],
    'six-pack': ['abs', 'abdominal', 'core', 'stomach', 'belly'],
    'vocabulary': ['words', 'language', 'speech', 'expression', 'communication'],
    'fitness': ['health', 'exercise', 'workout', 'training', 'physical'],
    'weight': ['lose', 'losing', 'reduce', 'reduction', 'shed'],
    'body': ['physique', 'form', 'shape', 'figure', 'appearance'],
    'improve': ['enhance', 'better', 'develop', 'advance', 'progress'],
    'achieve': ['accomplish', 'reach', 'attain', 'gain', 'obtain']
  };
  
  // Check if goals share key concepts through synonyms
  for (const [key, synonyms] of Object.entries(goalSynonyms)) {
    const hasKey1 = words1.includes(key) || words1.some(word => synonyms.includes(word));
    const hasKey2 = words2.includes(key) || words2.some(word => synonyms.includes(word));
    
    if (hasKey1 && hasKey2) {
      // If both goals share a key concept, check if they're similar enough
      const conceptWords1 = words1.filter(word => word === key || synonyms.includes(word));
      const conceptWords2 = words2.filter(word => word === key || synonyms.includes(word));
      
      // If they share the same key concepts, they're likely the same goal
      if (conceptWords1.length > 0 && conceptWords2.length > 0) {
        return true;
      }
    }
  }
  
  return similarity > 0.6; // Lowered threshold to 60% for better detection
}

/**
 * Check if two relationship contexts are similar (for deduplication)
 */
function isSimilarContext(context1: string, context2: string): boolean {
  // Handle undefined/null values
  if (!context1 || !context2) return false;
  
  const normalize = (text: string) => text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const norm1 = normalize(context1);
  const norm2 = normalize(context2);
  
  // Check for exact match
  if (norm1 === norm2) return true;
  
  // Check for high similarity (same core concept)
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  // If they share most words, they're similar
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  
  // Also check for specific context synonyms
  const contextSynonyms = {
    'gym': ['training', 'fitness', 'workout', 'exercise'],
    'library': ['studying', 'learning', 'research', 'reading'],
    'work': ['office', 'job', 'career', 'professional'],
    'school': ['education', 'academic', 'university', 'college'],
    'home': ['house', 'residence', 'living'],
    'partner': ['companion', 'buddy', 'friend', 'ally']
  };
  
  // Check if contexts are synonyms
  for (const [key, synonyms] of Object.entries(contextSynonyms)) {
    const hasKey1 = words1.includes(key) || words1.some(word => synonyms.includes(word));
    const hasKey2 = words2.includes(key) || words2.some(word => synonyms.includes(word));
    
    if (hasKey1 && hasKey2) {
      return true;
    }
  }
  
  return similarity > 0.6; // 60% similarity threshold for contexts
}

/**
 * Deduplicate existing relationships by merging similar ones
 */
function deduplicateRelationships(relationships: Relationship[]): Relationship[] {
  const deduplicated: Relationship[] = [];
  
  for (const rel of relationships) {
    // Check if this relationship already exists in a similar form
    const existingIndex = deduplicated.findIndex(
      existing => existing.name.toLowerCase() === rel.name.toLowerCase() && 
                  isSimilarContext(existing.context, rel.context)
    );
    
    if (existingIndex >= 0) {
      // Merge with existing relationship (keep the more recent one or merge details)
      const existing = deduplicated[existingIndex];
      if (rel.lastMentioned > existing.lastMentioned) {
        // Replace with the more recent one
        deduplicated[existingIndex] = rel;
      }
      // Otherwise keep the existing one
    } else {
      // Add new relationship
      deduplicated.push(rel);
    }
  }
  
  return deduplicated;
}

/**
 * Deduplicate existing goals by merging similar ones
 */
function deduplicateGoals(goals: Goal[]): Goal[] {
  const deduplicated: Goal[] = [];
  
  for (const goal of goals) {
    // Check if this goal already exists in a similar form
    const existingIndex = deduplicated.findIndex(
      existing => isSimilarGoal(existing.description, goal.description)
    );
    
    if (existingIndex >= 0) {
      // Merge with existing goal (keep the more recent one or merge details)
      const existing = deduplicated[existingIndex];
      if (goal.createdAt > existing.createdAt) {
        // Replace with the more recent one
        deduplicated[existingIndex] = goal;
      }
      // Otherwise keep the existing one
    } else {
      // Add new goal
      deduplicated.push(goal);
    }
  }
  
  return deduplicated;
}

/**
 * Clean up duplicate relationships and goals in the database for a character
 * This can be called to fix existing duplicate data
 */
export async function cleanupDuplicateRelationships(characterId: string): Promise<void> {
  const memory = await getCharacterMemory(characterId);
  
  const cleanedRelationships = deduplicateRelationships(memory.worldState.relationships);
  const cleanedGoals = deduplicateGoals(memory.worldState.goals);
  
  // Check if there were actually duplicates removed
  const relationshipsRemoved = memory.worldState.relationships.length - cleanedRelationships.length;
  const goalsRemoved = memory.worldState.goals.length - cleanedGoals.length;
  
  if (relationshipsRemoved > 0 || goalsRemoved > 0) {
    console.log(`Cleaned up ${relationshipsRemoved} duplicate relationships and ${goalsRemoved} duplicate goals for character ${characterId}`);
    
    // Update the database with cleaned data
    await db.characterMemory.upsert({
      where: { characterId },
      create: {
        characterId,
        worldState: JSON.stringify({
          relationships: cleanedRelationships,
          locations: memory.worldState.locations,
          goals: cleanedGoals
        }),
        summaryLog: memory.summaryLog,
        recentEntries: JSON.stringify(memory.recentEntries)
      },
      update: {
        worldState: JSON.stringify({
          relationships: cleanedRelationships,
          locations: memory.worldState.locations,
          goals: cleanedGoals
        }),
        lastUpdated: new Date()
      }
    });
  }
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
- Relationships: ${Array.isArray(memory.worldState.relationships) 
  ? memory.worldState.relationships.map(rel => `${rel.name} (${rel.relationshipType}) - ${rel.context}`).join(', ') 
  : 'None yet'}
- Locations: ${Array.isArray(memory.worldState.locations) 
  ? memory.worldState.locations.map(loc => `${loc.reimaginedName} (${loc.realName}) - ${loc.context}`).join(', ') 
  : 'None yet'}
- Active Goals: ${Array.isArray(memory.worldState.goals) 
  ? memory.worldState.goals.filter(goal => goal.status === 'active').map(goal => goal.description).join(', ') 
  : 'None yet'}
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
