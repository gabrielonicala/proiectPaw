export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  createdAt: Date;
  // Character system
  activeCharacterId?: string;
  characterSlots: number;
  // Subscription fields
  subscriptionStatus?: 'free' | 'active' | 'inactive' | 'canceled' | 'past_due';
  subscriptionId?: string;
  subscriptionPlan?: 'free' | 'weekly' | 'monthly' | 'yearly';
  subscriptionEndsAt?: Date;
  fastspringAccountId?: string; // FastSpring account ID for reliable webhook matching
  // Credits system
  credits?: number;
  hasPurchasedStarterKit?: boolean;
  // Timezone (set once on signup, locked forever)
  timezone?: string;
  // Relations
  characters?: Character[];
  activeCharacter?: Character;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description?: string;
  theme: Theme;
  avatar?: Avatar;
  appearance: 'masculine' | 'feminine' | 'androgynous' | 'custom';
  pronouns: 'he/him' | 'she/her' | 'they/them' | 'custom';
  customPronouns?: string;
  isActive: boolean;
  isLocked?: boolean; // Added for character access control
  createdAt: Date;
  updatedAt: Date;
  experience?: number;
  level?: number;
  stats?: Record<string, { value: number; description: string }>;
  // Relations
  entries?: JournalEntry[];
}

export interface Avatar {
  id: string;
  name: string;
  image: string; // Emoji or pixel art data URL
  pixelArt?: string; // SVG data URL for pixel art
  color: string;
  accessories: string[];
  description: string;
  race: string;
  class: string;
  stats: {
    strength: number;
    intelligence: number;
    dexterity: number;
    wisdom: number;
    charisma: number;
  };
  options?: {
    clothingColor?: string;
    imagePath?: string;
    category?: 'male' | 'female';
    type?: 'base' | 'clothed';
    layeredAvatar?: {
      head: {
        id: string;
        name: string;
        imagePath: string;
        category: 'head' | 'torso' | 'legs';
        gender: 'male' | 'female' | 'unisex';
        description: string;
      };
      torso: {
        id: string;
        name: string;
        imagePath: string;
        category: 'head' | 'torso' | 'legs';
        gender: 'male' | 'female' | 'unisex';
        description: string;
      };
      legs: {
        id: string;
        name: string;
        imagePath: string;
        category: 'head' | 'torso' | 'legs';
        gender: 'male' | 'female' | 'unisex';
        description: string;
      };
      id: string;
      name: string;
    };
  };
}

export interface JournalEntry {
  id: string;
  userId: string;
  characterId: string;
  originalText: string;
  reimaginedText?: string;
  imageUrl?: string;
  videoUrl?: string;
  outputType: OutputType;
  createdAt: Date;
  updatedAt: Date;
  pastContext?: string[];
  expGained?: number;
  statAnalysis?: string;
  // Relations
  character?: Character;
}

export type OutputType = 'text' | 'image' | 'coming-soon'; // 'coming-soon' replaces 'video' temporarily
export type Theme = 'velour-nights' | 'neon-ashes' | 'crimson-casefiles' | 'blazeheart-saga' | 'echoes-of-dawn' | 'obsidian-veil' | 'starlit-horizon' | 'ivory-quill' | 'wild-west' | 'crimson-tides';

export interface ThemeConfig {
  id: Theme;
  name: string;
  emoji?: string;
  description?: string;
  detailedDescription?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
  background: string;
  effects: string[];
  sounds: string[];
  animations: string[];
  storyPrompts?: string[];
  // NEW: Character archetype stats
  archetype?: {
    name: string;
    stats: Record<string, string>; // stat name -> description
  };
  // NEW: Hide theme from selection if no archetype defined
  hidden?: boolean;
}

export interface AppState {
  user: User | null;
  activeCharacter: Character | null;
  currentTheme: Theme;
  entries: JournalEntry[];
  isLoading: boolean;
}
