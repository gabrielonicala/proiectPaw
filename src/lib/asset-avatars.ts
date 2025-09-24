// Asset-based avatar system using provided professional sprites
// This replaces the basic pixel art with high-quality pre-made assets

export interface AssetAvatar {
  id: string;
  name: string;
  category: 'male' | 'female';
  type: 'base' | 'clothed';
  imagePath: string;
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
}

// Base avatar models
export const baseAvatars: AssetAvatar[] = [
  {
    id: 'male-base',
    name: 'Male Base',
    category: 'male',
    type: 'base',
    imagePath: '/avatars/male/base/avatar.png',
    description: 'Base male character model',
    race: 'Human',
    class: 'Adventurer',
    stats: { strength: 15, intelligence: 15, dexterity: 15, wisdom: 15, charisma: 15 }
  },
  {
    id: 'female-base',
    name: 'Female Base',
    category: 'female',
    type: 'base',
    imagePath: '/avatars/female/base/avatar.png',
    description: 'Base female character model',
    race: 'Human',
    class: 'Adventurer',
    stats: { strength: 15, intelligence: 15, dexterity: 15, wisdom: 15, charisma: 15 }
  }
];

// Male clothed avatars
export const maleClothedAvatars: AssetAvatar[] = [
  {
    id: 'male-warrior-1',
    name: 'Male Warrior 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/3.png',
    description: 'A fierce warrior clad in battle armor',
    race: 'Human',
    class: 'Warrior',
    stats: { strength: 18, intelligence: 12, dexterity: 14, wisdom: 13, charisma: 16 }
  },
  {
    id: 'male-warrior-2',
    name: 'Male Warrior 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/4.png',
    description: 'A veteran warrior with battle scars',
    race: 'Human',
    class: 'Warrior',
    stats: { strength: 19, intelligence: 11, dexterity: 15, wisdom: 12, charisma: 15 }
  },
  {
    id: 'male-mage-1',
    name: 'Male Mage 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/5.png',
    description: 'A wise mage with arcane knowledge',
    race: 'Human',
    class: 'Mage',
    stats: { strength: 10, intelligence: 20, dexterity: 12, wisdom: 18, charisma: 14 }
  },
  {
    id: 'male-mage-2',
    name: 'Male Mage 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/6.png',
    description: 'A scholarly wizard with ancient wisdom',
    race: 'Human',
    class: 'Mage',
    stats: { strength: 9, intelligence: 21, dexterity: 11, wisdom: 19, charisma: 13 }
  },
  {
    id: 'male-ranger-1',
    name: 'Male Ranger 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/7.png',
    description: 'A skilled ranger of the wilds',
    race: 'Human',
    class: 'Ranger',
    stats: { strength: 14, intelligence: 13, dexterity: 18, wisdom: 16, charisma: 12 }
  },
  {
    id: 'male-ranger-2',
    name: 'Male Ranger 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/8.png',
    description: 'A stealthy scout and tracker',
    race: 'Human',
    class: 'Ranger',
    stats: { strength: 13, intelligence: 14, dexterity: 19, wisdom: 15, charisma: 11 }
  },
  {
    id: 'male-rogue-1',
    name: 'Male Rogue 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/9.png',
    description: 'A cunning rogue with quick reflexes',
    race: 'Human',
    class: 'Rogue',
    stats: { strength: 12, intelligence: 15, dexterity: 20, wisdom: 11, charisma: 16 }
  },
  {
    id: 'male-rogue-2',
    name: 'Male Rogue 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/10.png',
    description: 'A master thief and assassin',
    race: 'Human',
    class: 'Rogue',
    stats: { strength: 11, intelligence: 16, dexterity: 21, wisdom: 10, charisma: 17 }
  },
  {
    id: 'male-paladin-1',
    name: 'Male Paladin 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/11.png',
    description: 'A holy warrior of divine justice',
    race: 'Human',
    class: 'Paladin',
    stats: { strength: 17, intelligence: 14, dexterity: 12, wisdom: 18, charisma: 19 }
  },
  {
    id: 'male-paladin-2',
    name: 'Male Paladin 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/12.png',
    description: 'A righteous knight of the light',
    race: 'Human',
    class: 'Paladin',
    stats: { strength: 18, intelligence: 13, dexterity: 11, wisdom: 19, charisma: 20 }
  },
  {
    id: 'male-cleric-1',
    name: 'Male Cleric 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/13.png',
    description: 'A devoted healer and divine caster',
    race: 'Human',
    class: 'Cleric',
    stats: { strength: 13, intelligence: 16, dexterity: 10, wisdom: 20, charisma: 18 }
  },
  {
    id: 'male-cleric-2',
    name: 'Male Cleric 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/14.png',
    description: 'A wise priest of the divine order',
    race: 'Human',
    class: 'Cleric',
    stats: { strength: 12, intelligence: 17, dexterity: 9, wisdom: 21, charisma: 19 }
  },
  {
    id: 'male-barbarian-1',
    name: 'Male Barbarian 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/15.png',
    description: 'A fierce barbarian warrior',
    race: 'Human',
    class: 'Barbarian',
    stats: { strength: 20, intelligence: 8, dexterity: 16, wisdom: 10, charisma: 12 }
  },
  {
    id: 'male-barbarian-2',
    name: 'Male Barbarian 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/16.png',
    description: 'A savage berserker of the wilds',
    race: 'Human',
    class: 'Barbarian',
    stats: { strength: 21, intelligence: 7, dexterity: 17, wisdom: 9, charisma: 11 }
  },
  {
    id: 'male-monk-1',
    name: 'Male Monk 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/17.png',
    description: 'A disciplined martial artist',
    race: 'Human',
    class: 'Monk',
    stats: { strength: 15, intelligence: 14, dexterity: 18, wisdom: 17, charisma: 13 }
  },
  {
    id: 'male-monk-2',
    name: 'Male Monk 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/18.png',
    description: 'A zen master of inner peace',
    race: 'Human',
    class: 'Monk',
    stats: { strength: 14, intelligence: 15, dexterity: 19, wisdom: 18, charisma: 12 }
  },
  {
    id: 'male-warlock-1',
    name: 'Male Warlock 1',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/19.png',
    description: 'A dark caster with eldritch powers',
    race: 'Human',
    class: 'Warlock',
    stats: { strength: 10, intelligence: 19, dexterity: 13, wisdom: 15, charisma: 18 }
  },
  {
    id: 'male-warlock-2',
    name: 'Male Warlock 2',
    category: 'male',
    type: 'clothed',
    imagePath: '/avatars/male/20.png',
    description: 'A pact-bound sorcerer of the void',
    race: 'Human',
    class: 'Warlock',
    stats: { strength: 9, intelligence: 20, dexterity: 12, wisdom: 16, charisma: 19 }
  }
];

// Female clothed avatars
export const femaleClothedAvatars: AssetAvatar[] = [
  {
    id: 'female-warrior-1',
    name: 'Female Warrior 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/3.png',
    description: 'A fierce warrior clad in battle armor',
    race: 'Human',
    class: 'Warrior',
    stats: { strength: 18, intelligence: 12, dexterity: 14, wisdom: 13, charisma: 16 }
  },
  {
    id: 'female-warrior-2',
    name: 'Female Warrior 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/4.png',
    description: 'A veteran warrior with battle scars',
    race: 'Human',
    class: 'Warrior',
    stats: { strength: 19, intelligence: 11, dexterity: 15, wisdom: 12, charisma: 15 }
  },
  {
    id: 'female-mage-1',
    name: 'Female Mage 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/5.png',
    description: 'A wise mage with arcane knowledge',
    race: 'Human',
    class: 'Mage',
    stats: { strength: 10, intelligence: 20, dexterity: 12, wisdom: 18, charisma: 14 }
  },
  {
    id: 'female-mage-2',
    name: 'Female Mage 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/6.png',
    description: 'A scholarly wizard with ancient wisdom',
    race: 'Human',
    class: 'Mage',
    stats: { strength: 9, intelligence: 21, dexterity: 11, wisdom: 19, charisma: 13 }
  },
  {
    id: 'female-ranger-1',
    name: 'Female Ranger 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/7.png',
    description: 'A skilled ranger of the wilds',
    race: 'Human',
    class: 'Ranger',
    stats: { strength: 14, intelligence: 13, dexterity: 18, wisdom: 16, charisma: 12 }
  },
  {
    id: 'female-ranger-2',
    name: 'Female Ranger 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/8.png',
    description: 'A stealthy scout and tracker',
    race: 'Human',
    class: 'Ranger',
    stats: { strength: 13, intelligence: 14, dexterity: 19, wisdom: 15, charisma: 11 }
  },
  {
    id: 'female-rogue-1',
    name: 'Female Rogue 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/9.png',
    description: 'A cunning rogue with quick reflexes',
    race: 'Human',
    class: 'Rogue',
    stats: { strength: 12, intelligence: 15, dexterity: 20, wisdom: 11, charisma: 16 }
  },
  {
    id: 'female-rogue-2',
    name: 'Female Rogue 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/10.png',
    description: 'A master thief and assassin',
    race: 'Human',
    class: 'Rogue',
    stats: { strength: 11, intelligence: 16, dexterity: 21, wisdom: 10, charisma: 17 }
  },
  {
    id: 'female-paladin-1',
    name: 'Female Paladin 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/11.png',
    description: 'A holy warrior of divine justice',
    race: 'Human',
    class: 'Paladin',
    stats: { strength: 17, intelligence: 14, dexterity: 12, wisdom: 18, charisma: 19 }
  },
  {
    id: 'female-paladin-2',
    name: 'Female Paladin 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/12.png',
    description: 'A righteous knight of the light',
    race: 'Human',
    class: 'Paladin',
    stats: { strength: 18, intelligence: 13, dexterity: 11, wisdom: 19, charisma: 20 }
  },
  {
    id: 'female-cleric-1',
    name: 'Female Cleric 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/13.png',
    description: 'A devoted healer and divine caster',
    race: 'Human',
    class: 'Cleric',
    stats: { strength: 13, intelligence: 16, dexterity: 10, wisdom: 20, charisma: 18 }
  },
  {
    id: 'female-cleric-2',
    name: 'Female Cleric 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/14.png',
    description: 'A wise priest of the divine order',
    race: 'Human',
    class: 'Cleric',
    stats: { strength: 12, intelligence: 17, dexterity: 9, wisdom: 21, charisma: 19 }
  },
  {
    id: 'female-barbarian-1',
    name: 'Female Barbarian 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/15.png',
    description: 'A fierce barbarian warrior',
    race: 'Human',
    class: 'Barbarian',
    stats: { strength: 20, intelligence: 8, dexterity: 16, wisdom: 10, charisma: 12 }
  },
  {
    id: 'female-barbarian-2',
    name: 'Female Barbarian 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/16.png',
    description: 'A savage berserker of the wilds',
    race: 'Human',
    class: 'Barbarian',
    stats: { strength: 21, intelligence: 7, dexterity: 17, wisdom: 9, charisma: 11 }
  },
  {
    id: 'female-monk-1',
    name: 'Female Monk 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/17.png',
    description: 'A disciplined martial artist',
    race: 'Human',
    class: 'Monk',
    stats: { strength: 15, intelligence: 14, dexterity: 18, wisdom: 17, charisma: 13 }
  },
  {
    id: 'female-monk-2',
    name: 'Female Monk 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/18.png',
    description: 'A zen master of inner peace',
    race: 'Human',
    class: 'Monk',
    stats: { strength: 14, intelligence: 15, dexterity: 19, wisdom: 18, charisma: 12 }
  },
  {
    id: 'female-warlock-1',
    name: 'Female Warlock 1',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/19.png',
    description: 'A dark caster with eldritch powers',
    race: 'Human',
    class: 'Warlock',
    stats: { strength: 10, intelligence: 19, dexterity: 13, wisdom: 15, charisma: 18 }
  },
  {
    id: 'female-warlock-2',
    name: 'Female Warlock 2',
    category: 'female',
    type: 'clothed',
    imagePath: '/avatars/female/20.png',
    description: 'A pact-bound sorcerer of the void',
    race: 'Human',
    class: 'Warlock',
    stats: { strength: 9, intelligence: 20, dexterity: 12, wisdom: 16, charisma: 19 }
  }
];

// Get all avatars
export const getAllAssetAvatars = (): AssetAvatar[] => {
  return [...baseAvatars, ...maleClothedAvatars, ...femaleClothedAvatars];
};

// Get avatars by category
export const getAvatarsByCategory = (category: 'male' | 'female'): AssetAvatar[] => {
  return getAllAssetAvatars().filter(avatar => avatar.category === category);
};

// Get avatars by type
export const getAvatarsByType = (type: 'base' | 'clothed'): AssetAvatar[] => {
  return getAllAssetAvatars().filter(avatar => avatar.type === type);
};

// Get avatars by class
export const getAvatarsByClass = (className: string): AssetAvatar[] => {
  return getAllAssetAvatars().filter(avatar => avatar.class === className);
};
