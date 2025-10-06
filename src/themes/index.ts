import { ThemeConfig } from '@/types';

export const themes: Record<string, ThemeConfig> = {
  'velour-nights': {
    id: 'velour-nights',
    name: 'Velour Nights',
    emoji: '🌆',
    description: 'Cozy City Life',
    detailedDescription: 'Step into a world of warm cafés, vinyl records, and rain-kissed windows. This theme transforms your everyday moments into cozy urban adventures filled with late-night conversations, chance encounters, and the comforting glow of city lights. Perfect for introspective stories about friendship, love, and finding beauty in the mundane.',
    colors: {
      primary: '#E8A87C',
      secondary: '#8B5A3C',
      accent: '#F4E4BC',
      background: '#2C1810',
      text: '#F5F1E8',
      border: '#E8A87C'
    },
    background: 'linear-gradient(135deg, #2D1B69 0%, #1A0F3A 100%)',
    effects: ['rain-drops', 'neon-blur', 'cozy-glow'],
    sounds: ['lo-fi-beats', 'soft-jazz', 'chillhop'],
    animations: ['gentle-pulse', 'rain-fall', 'neon-flicker'],
    storyPrompts: [
      'A rainy evening in a cozy café with vinyl playing softly',
      'Late night conversations over warm drinks and city lights',
      'Finding comfort in small moments during busy city life',
      'A chance encounter that changes everything',
      'The warmth of friendship in a cold urban world'
    ],
    // Hidden until archetype is defined
    hidden: true
  },
  'neon-ashes': {
    id: 'neon-ashes',
    name: 'Neon Ashes',
    emoji: '🕶️',
    description: 'Cyberpunk Dystopia',
    detailedDescription: 'Enter a neon-soaked future where technology and humanity collide. This theme turns your experiences into high-tech adventures through rain-drenched streets, corporate conspiracies, and digital rebellions. Expect stories of hackers, AI consciousness, and the eternal struggle between megacorps and freedom fighters.',
    colors: {
      primary: '#00FF88',
      secondary: '#FF0080',
      accent: '#FFFF00',
      background: '#0A0A0A',
      text: '#FFFFFF',
      border: '#00FF88'
    },
    background: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A1A 100%)',
    effects: ['neon-glow', 'rain-streaks', 'hologram-flicker'],
    sounds: ['dark-synthwave', 'glitch-pulses', 'cyber-ambient'],
    animations: ['neon-pulse', 'rain-fall', 'glitch-effect'],
    storyPrompts: [
      'A hacker\'s last stand against the megacorp',
      'Rain-soaked alleys and neon reflections',
      'The price of freedom in a controlled world',
      'A rogue AI seeking humanity',
      'Underground resistance in a digital dystopia'
    ],
    archetype: {
      name: 'Net-Runner',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Syntax': 'Your ability to think logically and analyze data.',
        // 'Latency': 'Your speed and reaction time, in both the digital and physical world.',
        // 'Discretion': 'Your ability to move unseen and remain undetected.',
        // 'Reputation': 'Your influence and standing within the city\'s network.',
        // 'Jolt': 'Your raw mental energy and quick-wittedness.'
        
        'Syntax': 'Your ability to think logically, analyze data, and solve complex problems. Affected by: coding, programming, logical reasoning, data analysis, and systematic thinking.',
        'Latency': 'Your speed, reaction time, and quickness in both digital and physical tasks. Affected by: fast-paced activities, quick decision-making, reflexes, and time-sensitive challenges.',
        'Discretion': 'Your ability to move unseen, remain undetected, and keep secrets. Affected by: stealth activities, privacy, keeping confidences, and avoiding attention.',
        'Reputation': 'Your influence, standing, and social connections within networks. Affected by: networking, building relationships, gaining respect, and social influence.',
        'Jolt': 'Your raw mental energy, creativity, and quick-wittedness. Affected by: creative projects, brainstorming, improvisation, and mental agility.'
      }
    }
  },
  'crimson-casefiles': {
    id: 'crimson-casefiles',
    name: 'Crimson Casefiles',
    emoji: '🕵️',
    description: 'Detective Mystery',
    detailedDescription: 'Dive into the shadowy world of noir detectives and unsolved mysteries. This theme transforms your daily experiences into gripping crime stories filled with cigarette smoke, dim desk lamps, and hidden clues. Perfect for stories about missing persons, crime syndicates, and the psychological tension of the hunt for truth.',
    colors: {
      primary: '#B8860B',
      secondary: '#8B4513',
      accent: '#FFD700',
      background: '#1C1C1C',
      text: '#F5F5DC',
      border: '#B8860B'
    },
    background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
    effects: ['cigarette-smoke', 'desk-lamp-glow', 'fog-wisps'],
    sounds: ['saxophone-noir', 'suspenseful-piano', 'city-ambient'],
    animations: ['smoke-rise', 'lamp-flicker', 'fog-drift'],
    storyPrompts: [
      'A missing person case that leads to the city\'s dark underbelly',
      'Late night stakeouts and cigarette smoke',
      'The detective who never gives up, no matter the cost',
      'A crime syndicate with connections in high places',
      'Psychological tension in the interrogation room'
    ],
    archetype: {
      name: 'Detective',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Deduction': 'Your ability to make logical inferences and solve complex problems.',
        // 'Perception': 'Your keen eye for observation and detail.',
        // 'Composure': 'Your ability to remain calm and rational under pressure.',
        // 'Discourse': 'Your skill in conversation and extracting information from others.',
        // 'Stamina': 'Your mental and physical endurance.'
        
        'Deduction': 'Your ability to make logical inferences and solve complex problems. Affected by: puzzle-solving, investigation, logical reasoning, and analytical thinking.',
        'Perception': 'Your keen eye for observation and attention to detail. Affected by: careful observation, noticing details, surveillance, and paying attention to surroundings.',
        'Composure': 'Your ability to remain calm and rational under pressure. Affected by: stressful situations, maintaining calm, emotional control, and handling pressure.',
        'Discourse': 'Your skill in conversation and extracting information from others. Affected by: social interactions, interviews, negotiations, and communication.',
        'Stamina': 'Your mental and physical endurance and persistence. Affected by: long tasks, endurance activities, persistence, and sustained effort.'
      }
    }
  },
  'blazeheart-saga': {
    id: 'blazeheart-saga',
    name: 'Blazeheart Saga',
    emoji: '🔥',
    description: 'Shōnen Protagonist',
    detailedDescription: 'Channel the spirit of classic anime heroes with fiery determination and unbreakable bonds. This theme turns your challenges into epic training arcs, rival battles, and inspiring adventures. Expect stories about never giving up, the power of friendship, and overcoming impossible odds through sheer willpower and determination.',
    colors: {
      primary: '#FF4500',
      secondary: '#FF8C00',
      accent: '#FFD700',
      background: '#1A0A0A',
      text: '#FFFFFF',
      border: '#FF4500'
    },
    background: 'linear-gradient(135deg, #1A0A0A 0%, #2A0A0A 100%)',
    effects: ['energy-burst', 'flame-trails', 'power-aura'],
    sounds: ['upbeat-rock', 'orchestral-shonen', 'battle-music'],
    animations: ['energy-wave', 'flame-flicker', 'power-up'],
    storyPrompts: [
      'The hero\'s journey begins with a single step',
      'Training montages and never giving up',
      'Friendship that transcends all obstacles',
      'The final battle that determines everything',
      'Destiny calls, and the hero answers'
    ],
    archetype: {
      name: 'Hero', // Changed from 'Samurai' to be more anime-generic
      stats: {
        // Original descriptions (commented out for reference):
        // 'Discipline': 'Your mental fortitude and control over your emotions.',
        // 'Valor': 'Your courage and fearlessness in the face of a challenge.',
        // 'Poise': 'Your physical grace, balance, and composure.',
        // 'Vigilance': 'Your awareness of your surroundings and attention to detail.',
        // 'Spirit': 'Your inner strength and resilience in the face of hardship.'
        
        'Discipline': 'Your mental fortitude, self-control, and ability to stick to routines and commitments. Affected by: completing difficult tasks, following through on goals, maintaining habits, resisting temptations, and showing self-restraint.',
        'Valor': 'Your courage, bravery, and willingness to face fears or challenges. Affected by: confronting difficult situations, taking risks, standing up for others, facing your fears, and pushing beyond comfort zones.',
        'Poise': 'Your physical grace, balance, coordination, and athletic ability. Affected by: physical training, sports, dance, martial arts, gym workouts, physical challenges, and activities requiring body control.',
        'Vigilance': 'Your awareness, attention to detail, and ability to notice important things. Affected by: careful observation, problem-solving, detective work, studying, analyzing situations, and paying close attention to surroundings.',
        'Spirit': 'Your inner strength, resilience, and emotional fortitude. Affected by: overcoming setbacks, maintaining optimism, supporting others, emotional challenges, and bouncing back from difficulties.'
      }
    }
  },
  'echoes-of-dawn': {
    id: 'echoes-of-dawn',
    name: 'Echoes of Dawn',
    emoji: '🌸',
    description: 'Nostalgia',
    detailedDescription: 'Journey through bittersweet memories and coming-of-age moments. This theme transforms your experiences into nostalgic tales of childhood summers, first love, and bittersweet farewells. Perfect for stories about growing up, lost innocence, and the beautiful melancholy of remembering what once was.',
    colors: {
      primary: '#DDA0DD',
      secondary: '#F0B6C1',
      accent: '#F0E68C',
      background: '#2F1B69',
      text: '#F5F5F5',
      border: '#DDA0DD'
    },
    background: 'linear-gradient(135deg, #2F1B69 0%, #1A0F3A 100%)',
    effects: ['sunlight-rays', 'petal-fall', 'nostalgic-glow'],
    sounds: ['soft-piano', 'ambient-strings', 'retro-synth'],
    animations: ['gentle-float', 'sunlight-dance', 'petal-drift'],
    storyPrompts: [
      'Childhood summers that felt like they\'d last forever',
      'First love and bittersweet farewells',
      'The classroom at sunset, filled with memories',
      'Old train stations and the promise of new beginnings',
      'Coming of age in a world that\'s always changing'
    ],
    // Hidden until archetype is defined
    hidden: true
  },
  'obsidian-veil': {
    id: 'obsidian-veil',
    name: 'Obsidian Veil',
    emoji: '🖤',
    description: 'Dark Fantasy',
    detailedDescription: 'Enter a realm of gothic castles, ancient curses, and mysterious shadows. This theme transforms your experiences into dark fantasy tales filled with forbidden magic, cursed artifacts, and the eternal struggle between light and darkness. Perfect for stories about ancient evils, gothic mysteries, and the price of power.',
    colors: {
      primary: '#4B0082',
      secondary: '#8B008B',
      accent: '#DC143C',
      background: '#0A0A0A',
      text: '#E6E6FA',
      border: '#4B0082'
    },
    background: 'linear-gradient(135deg, #0A0A0A 0%, #1A0A1A 100%)',
    effects: ['gothic-shadows', 'candle-flicker', 'mystical-aura'],
    sounds: ['gothic-choir', 'dark-ambient', 'mystical-chimes'],
    animations: ['shadow-dance', 'candle-flicker', 'mystical-pulse'],
    storyPrompts: [
      'Ancient curses and forgotten magic',
      'Gothic castles shrouded in mystery',
      'The price of power in a dark world',
      'Heroes who walk the line between light and shadow',
      'Legends that refuse to die'
    ],
    archetype: {
      name: 'Occultist',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Clarity': 'Your ability to keep a clear mind in the face of madness.',
        // 'Prowess': 'Your physical quickness and coordination.',
        // 'Glimmer': 'Your intuition and ability to perceive hidden supernatural elements.',
        // 'Reserve': 'Your skill in observing without being noticed and keeping secrets.',
        // 'Conviction': 'Your unshakeable belief in your own path, no matter the cost.'
        
        'Clarity': 'Your ability to keep a clear mind and think logically in chaotic situations. Affected by: meditation, problem-solving, staying calm under pressure, and maintaining focus.',
        'Prowess': 'Your physical quickness, coordination, and athletic ability. Affected by: physical training, sports, dance, martial arts, gym workouts, and activities requiring body control.',
        'Glimmer': 'Your intuition and ability to perceive hidden patterns and supernatural elements. Affected by: creative activities, pattern recognition, artistic pursuits, and intuitive decision-making.',
        'Reserve': 'Your skill in observing without being noticed and keeping secrets. Affected by: stealth activities, privacy, keeping confidences, and avoiding attention.',
        'Conviction': 'Your unshakeable belief in your own path and determination. Affected by: standing up for beliefs, making difficult decisions, persistence, and moral courage.'
      }
    }
  },
  'starlit-horizon': {
    id: 'starlit-horizon',
    name: 'Starlit Horizon',
    emoji: '🌌',
    description: 'Sci-Fi Exploration',
    detailedDescription: 'Embark on cosmic adventures across the vast expanse of space. This theme transforms your experiences into epic space odysseys filled with alien encounters, distant worlds, and the infinite possibilities of the cosmos. Perfect for stories about exploration, first contact, and humanity\'s place among the stars.',
    colors: {
      primary: '#00BFFF',
      secondary: '#4169E1',
      accent: '#FFD700',
      background: '#000033',
      text: '#E6F3FF',
      border: '#00BFFF'
    },
    background: 'linear-gradient(135deg, #000033 0%, #000066 100%)',
    effects: ['star-field', 'nebula-glow', 'cosmic-dust'],
    sounds: ['space-ambient', 'sci-fi-synth', 'cosmic-echoes'],
    animations: ['star-twinkle', 'nebula-drift', 'cosmic-pulse'],
    storyPrompts: [
      'Journey to the edge of known space',
      'First contact with alien civilizations',
      'The vastness of the cosmos and our place in it',
      'Space odysseys that test the limits of humanity',
      'Discovering new worlds and new possibilities'
    ],
    archetype: {
      name: 'Cosmonaut',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Navigation': 'Your ability to chart a course and stay on it, both literally and in your daily tasks.',
        // 'Empathy': 'Your ability to connect with and understand new perspectives.',
        // 'Curiosity': 'Your thirst for knowledge and drive to seek out the unknown.',
        // 'Resolve': 'Your mental fortitude and resilience in the face of immense challenges.',
        // 'Observation': 'Your ability to take in the wonders of the universe and understand the data you are collecting.'
        
        'Navigation': 'Your ability to chart a course and stay on it, both literally and in your daily tasks. Affected by: planning, goal-setting, following through on commitments, and staying organized.',
        'Empathy': 'Your ability to connect with and understand new perspectives. Affected by: social interactions, listening to others, understanding different viewpoints, and emotional intelligence.',
        'Curiosity': 'Your thirst for knowledge and drive to seek out the unknown. Affected by: learning new things, asking questions, exploring new topics, and intellectual pursuits.',
        'Resolve': 'Your mental fortitude and resilience in the face of immense challenges. Affected by: overcoming obstacles, persistence, mental toughness, and handling stress.',
        'Observation': 'Your ability to take in the wonders of the universe and understand the data you are collecting. Affected by: paying attention to details, analysis, research, and careful observation.'
      }
    }
  },
  'ivory-quill': {
    id: 'ivory-quill',
    name: 'Ivory Quill',
    emoji: '📜',
    description: 'High Fantasy',
    detailedDescription: 'Step into a realm of wizards, kingdoms, and ancient prophecies. This theme transforms your experiences into epic fantasy adventures filled with magical academies, legendary artifacts, and the eternal struggle between good and evil. Perfect for stories about chosen heroes, magical quests, and the power of destiny.',
    colors: {
      primary: '#DAA520',
      secondary: '#CD853F',
      accent: '#DC143C',
      background: '#2F1B14',
      text: '#F5F5DC',
      border: '#DAA520'
    },
    background: 'linear-gradient(135deg, #2F1B14 0%, #1A0F0A 100%)',
    effects: ['parchment-texture', 'quill-ink', 'magical-glow'],
    sounds: ['medieval-music', 'magical-chimes', 'castle-ambient'],
    animations: ['parchment-unroll', 'ink-flow', 'magical-sparkle'],
    storyPrompts: [
      'Ancient prophecies and chosen heroes',
      'Wizards and warriors in a world of magic',
      'Kingdoms at war and the price of peace',
      'The quest for the legendary artifact',
      'Magic that flows through every living thing'
    ],
    archetype: {
      name: 'Arcane Scribe',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Lore': 'Your knowledge of the world and its secrets.',
        // 'Willpower': 'Your mental strength and determination.',
        // 'Presence': 'Your personal charisma and how you influence others.',
        // 'Aura': 'Your ability to perceive and manipulate magical energy.',
        // 'Sagacity': 'Your wisdom and ability to make sound judgments.'
        
        'Lore': 'Your knowledge of the world and its secrets. Affected by: studying, reading, learning new information, research, and accumulating knowledge.',
        'Willpower': 'Your mental strength and determination. Affected by: self-discipline, resisting temptation, mental toughness, and pushing through challenges.',
        'Presence': 'Your personal charisma and how you influence others. Affected by: public speaking, leadership, social interactions, and making an impression.',
        'Aura': 'Your ability to perceive and manipulate magical energy. Affected by: creative activities, artistic pursuits, meditation, and spiritual practices.',
        'Sagacity': 'Your wisdom and ability to make sound judgments. Affected by: making good decisions, giving advice, problem-solving, and thoughtful analysis.'
      }
    }
  },
  'wild-west': {
    id: 'wild-west',
    name: 'Wild West',
    emoji: '🤠',
    description: 'Frontier Justice',
    detailedDescription: 'Saddle up for adventures in the lawless frontier where justice is served by the barrel of a gun. This theme transforms your experiences into Wild West tales filled with mysterious strangers, gold rushes, and the eternal struggle between law and chaos. Perfect for stories about lone gunslingers, frontier justice, and the untamed spirit of the west.',
    colors: {
      primary: '#D2691E',
      secondary: '#CD853F',
      accent: '#F4A460',
      background: '#8B4513',
      text: '#F5DEB3',
      border: '#D2691E'
    },
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #D2691E 50%, #CD853F 75%, #8B4513 100%)',
    effects: ['dust-particles', 'tumbleweed-roll', 'sunset-glow'],
    sounds: ['acoustic-guitar', 'harmonica-melody', 'horse-hooves', 'saloon-piano'],
    animations: ['dust-swirl', 'sunset-fade', 'tumbleweed-bounce'],
    storyPrompts: [
      'A mysterious stranger rides into town with a secret that could change everything',
      'A sheriff must choose between justice and friendship when an old friend becomes an outlaw',
      'A gold rush brings fortune seekers and trouble to a peaceful frontier town',
      'A stagecoach robbery leads to an unexpected alliance between enemies',
      'A lone gunslinger seeks redemption for past mistakes in the lawless west'
    ],
    archetype: {
      name: 'Outlaw',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Aim': 'Your precision and focus in all endeavors.',
        // 'Grit': 'Your sheer mental and physical toughness.',
        // 'Presence': 'Your charisma and the impression you leave on others.',
        // 'Gait': 'Your manner of moving and navigating the world, both literally and figuratively.',
        // 'Guile': 'Your cleverness and resourcefulness in tricky situations.'
        
        'Aim': 'Your precision and focus in all endeavors. Affected by: detailed work, accuracy, concentration, and tasks requiring precision.',
        'Grit': 'Your sheer mental and physical toughness. Affected by: endurance activities, handling stress, persistence, and overcoming physical challenges.',
        'Presence': 'Your charisma and the impression you leave on others. Affected by: leadership, public speaking, social interactions, and making an impact.',
        'Gait': 'Your manner of moving and navigating the world, both literally and figuratively. Affected by: physical movement, travel, adaptability, and how you carry yourself.',
        'Guile': 'Your cleverness and resourcefulness in tricky situations. Affected by: problem-solving, creative thinking, strategy, and handling complex situations.'
      }
    }
  },
  'crimson-tides': {
    id: 'crimson-tides',
    name: 'Crimson Tides',
    emoji: '🏴‍☠️',
    description: 'High Seas Adventure',
    detailedDescription: 'Set sail for treacherous waters where legends are forged and treasures await the bold. This theme transforms your experiences into epic nautical adventures filled with pirate crews, sea monsters, and the endless horizon of possibility. Perfect for stories about treasure hunts, naval battles, and the freedom of the open sea.',
    colors: {
      primary: '#8B0000',
      secondary: '#4682B4',
      accent: '#FFD700',
      background: '#191970',
      text: '#F0F8FF',
      border: '#8B0000'
    },
    background: 'linear-gradient(135deg, #191970 0%, #000080 25%, #8B0000 50%, #4682B4 75%, #191970 100%)',
    effects: ['ocean-waves', 'storm-clouds', 'treasure-glow'],
    sounds: ['sea-shanty', 'ocean-waves', 'ship-creaking'],
    animations: ['wave-motion', 'storm-lightning', 'sail-billow'],
    storyPrompts: [
      'A treasure map leads to uncharted waters',
      'The captain faces mutiny on the high seas',
      'A sea monster rises from the depths',
      'The last port before the edge of the world',
      'A pirate crew seeks redemption',
      'The storm that tests every sailor\'s soul',
      'An island where legends come to life',
      'The compass that points to destiny'
    ],
    archetype: {
      name: 'Pirate',
      stats: {
        // Original descriptions (commented out for reference):
        // 'Swagger': 'Your confidence and ability to inspire or intimidate.',
        // 'Dexterity': 'Your nimbleness and physical quickness.',
        // 'Resolve': 'Your determination and perseverance in the face of adversity.',
        // 'Avarice': 'Your drive to acquire and your skill in finding what you seek.',
        // 'Cunning': 'Your intelligence and resourcefulness for deception and strategy.'
        
        'Swagger': 'Your confidence and ability to inspire or intimidate. Affected by: leadership, public speaking, taking charge, and projecting confidence.',
        'Dexterity': 'Your nimbleness and physical quickness. Affected by: physical activities, sports, dance, martial arts, and tasks requiring agility.',
        'Resolve': 'Your determination and perseverance in the face of adversity. Affected by: persistence, overcoming obstacles, mental toughness, and not giving up.',
        'Avarice': 'Your drive to acquire and your skill in finding what you seek. Affected by: goal-setting, ambition, resource gathering, and pursuing opportunities.',
        'Cunning': 'Your intelligence and resourcefulness for deception and strategy. Affected by: strategic thinking, problem-solving, planning, and handling complex situations.'
      }
    }
  }
};

export const defaultTheme = themes['blazeheart-saga'];
