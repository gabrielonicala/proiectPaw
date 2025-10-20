import { db } from './db';

const adjectives = [
  'Lucky', 'Swift', 'Bold', 'Clever', 'Bright', 'Sharp', 'Quick', 'Wise',
  'Brave', 'Calm', 'Cool', 'Epic', 'Fierce', 'Gentle', 'Happy', 'Jolly',
  'Kind', 'Lively', 'Mighty', 'Noble', 'Proud', 'Quiet', 'Radiant', 'Strong',
  'Tough', 'Vibrant', 'Wild', 'Young', 'Zesty', 'Amazing', 'Brilliant',
  'Charming', 'Daring', 'Elegant', 'Fantastic', 'Glorious', 'Heroic',
  'Mystic', 'Ancient', 'Cosmic', 'Ethereal', 'Golden', 'Silver', 'Crystal',
  'Shadow', 'Storm', 'Thunder', 'Lightning', 'Fire', 'Ice', 'Wind', 'Earth'
];

const nouns = [
  'Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Lion', 'Bear', 'Fox',
  'Hawk', 'Falcon', 'Raven', 'Owl', 'Shark', 'Whale', 'Dolphin', 'Turtle',
  'Butterfly', 'Bee', 'Spider', 'Snake', 'Lizard', 'Frog', 'Fish', 'Bird',
  'Cat', 'Dog', 'Horse', 'Deer', 'Rabbit', 'Squirrel', 'Mouse', 'Rat',
  'Camel', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Panda', 'Koala',
  'Wizard', 'Knight', 'Mage', 'Rogue', 'Paladin', 'Ranger', 'Bard', 'Cleric',
  'Warrior', 'Monk', 'Sorcerer', 'Warlock', 'Druid', 'Barbarian', 'Fighter',
  'Sage', 'Scholar', 'Explorer', 'Adventurer', 'Guardian', 'Champion', 'Hero'
];

export function generateRandomUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  
  return `${adjective}-${noun}${number}`;
}

export async function getUniqueUsername(): Promise<string> {
  let username: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    username = generateRandomUsername();
    const existingUser = await db.user.findUnique({
      where: { username }
    });
    isUnique = !existingUser;
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback: add timestamp to ensure uniqueness
    const baseUsername = generateRandomUsername();
    const timestamp = Date.now().toString().slice(-4);
    username = `${baseUsername}${timestamp}`;
  }
  
  return username!;
}

// Export for testing purposes
export function getAdjectives(): string[] {
  return [...adjectives];
}

export function getNouns(): string[] {
  return [...nouns];
}
