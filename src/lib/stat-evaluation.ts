import OpenAI from 'openai';
import { db } from './db';
import { themes } from '@/themes';
import { env } from './env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface StatChange {
  change: number;
  reason: string;
  confidence: number;
}

export interface StatEvaluationResult {
  [statName: string]: StatChange;
}

/**
 * Evaluate stat changes based on user input and reimagined text
 */
export async function evaluateStatChanges(
  originalText: string,
  reimaginedText: string,
  characterTheme: string,
  characterStats: Record<string, { value: number; description: string }>
): Promise<StatEvaluationResult> {
  const themeConfig = themes[characterTheme as keyof typeof themes];
  
  if (!themeConfig?.archetype?.stats) {
    throw new Error('Theme does not have archetype stats defined');
  }

  // Get the stat names and descriptions for this theme
  const statDescriptions = Object.entries(themeConfig.archetype.stats)
    .map(([name, description]) => `${name}: ${description}`)
    .join('\n');

  const prompt = `You are evaluating how a character's actions and experiences in a journal entry should affect their stats.

Character's current stats and their meanings:
${statDescriptions}

Original user input:
"${originalText}"

Reimagined story/chapter:
"${reimaginedText}"

Based on the character's actions, decisions, and experiences in this story, evaluate how each stat should change. Consider:
- Positive actions that demonstrate growth in a stat
- Negative actions or missed opportunities that might decrease a stat
- The character's overall development and choices

Return a JSON object with the exact stat names as keys. Each stat should have:
- "change": integer between -4 and +4 (the amount to change the stat)
- "reason": brief explanation for the change
- "confidence": number between 0 and 1 (how confident you are in this evaluation)

Example format:
{
  "Discipline": { "change": 1, "reason": "Completed a difficult task despite fatigue", "confidence": 0.8 },
  "Valor": { "change": -1, "reason": "Avoided a direct confrontation", "confidence": 0.6 }
}

Only include stats that should change. If a stat shouldn't change, don't include it in the response.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a character development expert who evaluates how fictional experiences should affect character stats. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Validate and clamp the results
    const validatedResult: StatEvaluationResult = {};
    
    for (const [statName, statChange] of Object.entries(result)) {
      if (typeof statChange === 'object' && statChange !== null && 'change' in statChange) {
        const change = statChange as StatChange;
        
        // Validate stat name exists in theme
        if (!themeConfig.archetype?.stats[statName]) {
          console.warn(`Unknown stat name: ${statName}`);
          continue;
        }
        
        // Clamp change to -4 to +4
        const clampedChange = Math.max(-4, Math.min(4, Math.round(change.change || 0)));
        
        // Clamp confidence to 0-1
        const clampedConfidence = Math.max(0, Math.min(1, change.confidence || 0.5));
        
        validatedResult[statName] = {
          change: clampedChange,
          reason: change.reason || 'No reason provided',
          confidence: clampedConfidence
        };
      }
    }
    
    return validatedResult;
  } catch (error) {
    console.error('Error evaluating stat changes:', error);
    throw new Error('Failed to evaluate stat changes');
  }
}

/**
 * Apply stat changes to character and create progression records
 */
export async function applyStatChanges(
  characterId: string,
  entryId: string,
  statChanges: StatEvaluationResult,
  originalText: string
): Promise<{ updatedStats: Record<string, { value: number; description: string }>; expGained: number }> {
  // Get current character stats
  const character = await db.character.findUnique({
    where: { id: characterId },
    select: { stats: true, experience: true }
  });

  if (!character) {
    throw new Error('Character not found');
  }

  const currentStats = character.stats ? JSON.parse(character.stats) : {};
  const updatedStats = { ...currentStats };
  let totalExpGained = 15; // Base EXP per entry
  let totalPositiveChanges = 0;

  // Process each stat change
  for (const [statName, change] of Object.entries(statChanges)) {
    const currentValue = updatedStats[statName]?.value || 10;
    const newValue = Math.max(1, Math.min(100, currentValue + change.change));
    
    // Create StatProgression record
    await db.statProgression.create({
      data: {
        characterId,
        entryId,
        statName,
        oldValue: currentValue,
        newValue,
        change: change.change,
        reason: change.reason,
        confidence: change.confidence,
        entryText: originalText.substring(0, 500), // Truncate for storage
        analysis: JSON.stringify(change)
      }
    });

    // Update the stat
    updatedStats[statName] = {
      ...updatedStats[statName],
      value: newValue
    };

    // Add EXP bonus for positive changes
    if (change.change > 0) {
      totalPositiveChanges += change.change;
    }
  }

  // Calculate EXP bonus (positive changes × 3)
  const expBonus = totalPositiveChanges * 3;
  totalExpGained += expBonus;

  // Update character stats and experience
  const newExperience = character.experience + totalExpGained;
  
  // Calculate level using scaling curve: 100 + 20×(level-1)
  // Level 1→2: 100 EXP, Level 2→3: 120 EXP, Level 3→4: 140 EXP, etc.
  let newLevel = 1;
  let expForNextLevel = 100;
  let totalExpNeeded = 0;
  
  while (totalExpNeeded + expForNextLevel <= newExperience) {
    totalExpNeeded += expForNextLevel;
    newLevel++;
    expForNextLevel = 100 + 20 * (newLevel - 1);
  }

  await db.character.update({
    where: { id: characterId },
    data: {
      stats: JSON.stringify(updatedStats),
      experience: newExperience,
      level: newLevel
    }
  });

  // Update the entry with EXP gained and stat analysis
  await db.journalEntry.update({
    where: { id: entryId },
    data: {
      expGained: totalExpGained,
      statAnalysis: JSON.stringify(statChanges)
    }
  });

  return {
    updatedStats,
    expGained: totalExpGained
  };
}
