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
    detailedDescription: 'Step into a near-future city where every screen hums with secrets and rain carries the static of a thousand networks. This theme transforms ordinary moments into high-stakes cyberpunk tales about people navigating surveillance, corporate power, and the thin line between identity and data. Expect grounded, human stories of quiet resistance, clever subterfuge, and finding connection in a place built to keep everyone apart.',
    colors: {
      primary: '#00FF88',
      secondary: '#00FFFF',
      accent: '#FF8C00',
      background: '#0A0A0A',
      text: '#FFFFFF',
      border: '#00FF88'
    },
    background: `
      linear-gradient(90deg, #0A0A0A, #00FF88, #00FFFF, #FF8C00),
      linear-gradient(180deg, #00FFFF, #0A0A0A, #00FF88, #FF8C00)
    `,
    effects: ['neon-glow', 'rain-streaks', 'hologram-flicker'],
    sounds: ['dark-synthwave', 'glitch-pulses', 'cyber-ambient'],
    animations: ['neon-pulse', 'rain-fall', 'glitch-effect'],
    storyPrompts: [
      'A courier smuggling a harmless-looking datachip past passive scanners',
      'A routine ID check that reveals a quiet mismatch with dangerous implications',
      'Fixing a broken terminal and uncovering a ghost process that shouldn\'t exist',
      'A public transit outage that forces strangers to cooperate off-grid',
      'Negotiating with a street vendor who sells clean power in blackout zones',
      'A corporate memo leak that spreads by word of mouth to avoid detection',
      'Debugging a household bot that keeps remembering things it wasn\'t taught',
      'Trading favors for access to a maintenance shaft no cameras can see',
      'A citywide update that bricks older devices, except one that refuses',
      'Finding an obsolete payphone that still rings, and only for you',
      'A rooftop garden community shielding refugees from biometric sweeps',
      'Leaving a subtle message in a billboard rotation only one person will notice'
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
    detailedDescription: 'Step into the shadowy world of mystery and intrigue where every detail matters and nothing is as it seems. This theme transforms your daily experiences into compelling detective stories filled with hidden clues, unexpected twists, and the satisfaction of solving puzzles. Whether you\'re investigating a simple case or uncovering a complex conspiracy, every story becomes a thrilling journey through the art of deduction, where keen observation and sharp intuition lead to the truth.',
    colors: {
      primary: '#B8860B',
      secondary: '#8B0000',
      accent: '#FFD700',
      background: '#000000',
      text: '#F5F5DC',
      border: '#B8860B'
    },
    background: `
      linear-gradient(135deg, #000000, #B8860B, #8B0000, #FFD700),
      linear-gradient(225deg, #8B0000, #000000, #B8860B, #FFD700)
    `,
    effects: ['cigarette-smoke', 'desk-lamp-glow', 'fog-wisps'],
    sounds: ['saxophone-noir', 'suspenseful-piano', 'city-ambient'],
    animations: ['smoke-rise', 'lamp-flicker', 'fog-drift'],
    storyPrompts: [
      'A missing person case that leads to unexpected places',
      'Late night stakeouts and the patience of surveillance',
      'The detective who never gives up, no matter the cost',
      'A crime syndicate with connections in high places',
      'Psychological tension in the interrogation room',
      'Following a trail of evidence through the city streets',
      'The moment when all the pieces finally click together',
      'A witness who holds the key to solving the case',
      'The weight of justice and the burden of truth',
      'A case that tests the detective\'s moral compass',
      'The satisfaction of bringing closure to victims\' families',
      'A mystery that spans decades and multiple generations'
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
    name: 'Steel Spirit',
    emoji: '⚔️',
    description: 'Samurai Warrior',
    detailedDescription: 'Step into a world where every moment is a lesson in bushido. This theme transforms your daily experiences into immersive tales of samurai life, from quiet moments of meditation to intense training sessions, honing both mind and body. Experience the weight of honor, the discipline of daily practice, and the profound wisdom of masters who guide your path. Whether you\'re studying ancient texts, perfecting your sword technique, or facing moral dilemmas that test your resolve, every story becomes a chapter in your journey toward becoming a true warrior.',
    colors: {
      primary: '#8B0000',
      secondary: '#FFFFFF',
      accent: '#FFD700',
      background: '#000000',
      text: '#F5F5F5',
      border: '#8B0000'
    },
    background: `
      linear-gradient(60deg, #000000, #8B0000, #FFFFFF, #FFD700, #2F4F4F),
      linear-gradient(120deg, #FFD700, #000000, #8B0000, #FFFFFF, #2F4F4F)
    `,
    effects: ['sword-gleam', 'cherry-blossoms', 'honor-aura'],
    sounds: ['steel-spirit', 'traditional-japanese', 'taiko-drums', 'zen-ambient'],
    animations: ['sword-strike', 'cherry-fall', 'honor-pulse'],
    storyPrompts: [
      'Meditation, forging both mind and body',
      'Training under the watchful eye of a sensei',
      'The weight of a katana at your side, a symbol of both power and responsibility',
      'The tea ceremony, finding peace in ritual and tradition',
      'A challenge from a rival warrior that tests your skill and honor',
      'Protecting the innocent from evildoers',
      'The sound of cherry blossoms falling as you contemplate your duty',
      'A master\'s lesson about the true meaning of bushido',
      'The honor of serving your lord, even when it conflicts with personal desires',
      'The discipline of daily practice, even when no one is watching',
      'Reading ancient scrolls by candlelight, seeking wisdom from the past',
      'The moment of stillness before drawing your blade in defense of others'
    ],
    archetype: {
      name: 'Samurai',
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
    detailedDescription: 'Descend into velvet black where prayers taste of iron and names carry debt. This theme turns ordinary moments into intimate dark fantasy, with chapels that listen, relics that hunger, and mirrors that remember. Expect quiet dread, patient temptation, and power that arrives politely and asks for something in return, tales about secrecy, cost, and the thin line between protection and possession.',
    colors: {
      primary: '#8B008B',
      secondary: '#4B0082',
      accent: '#DAA520',
      background: '#000000',
      text: '#E6E6FA',
      border: '#8B008B'
    },
    background: `
      linear-gradient(75deg, #000000, #8B008B, #4B0082, #DAA520),
      linear-gradient(255deg, #4B0082, #000000, #8B008B, #DAA520)
    `,
    effects: ['gothic-shadows', 'candle-flicker', 'mystical-aura'],
    sounds: ['gothic-choir', 'dark-ambient', 'mystical-chimes'],
    animations: ['shadow-dance', 'candle-flicker', 'mystical-pulse'],
    storyPrompts: [
      'A sign that something hears you when no one else does, and remembers what you ask',
      'Power that helps cleanly in daylight, then waits at night to collect its price',
      'A place that keeps promises longer than people do, and dislikes when they are broken',
      'A family heirloom that warms in your hand when a lie is spoken',
      'A locked room that can be opened only after a promise is broken',
      'Candlelight that refuses to go out near a particular wall',
      'A prayer whispered in private that someone else answers',
      'Stairs that count differently on the way down',
      'A mirror that shows the room as it was years ago',
      'A harmless phrase that older residents never say aloud',
      'An invitation written in ink that will not dry',
      'A door knocker that taps by itself when rain begins',
      'A book that adds a line each time you finish a task',
      'A mended wound that leaves a symbol instead of a scar',
      'A bargain that improves your day, then returns for interest at night'
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
        'Precision': 'Your exactness, steadiness, and ability to execute delicate work. Affected by: careful handling of objects, precise procedures, steady hands, attention to small details, and completing multi-step rites without error.',
        'Glimmer': 'Your intuition and ability to perceive hidden patterns and supernatural elements. Affected by: creative activities, pattern recognition, artistic pursuits, and intuitive decision-making.',
        'Reserve': 'Your skill in observing without being noticed and keeping secrets. Affected by: stealth activities, privacy, keeping confidences, and avoiding attention.',
        'Oathbinding': 'Your capacity to keep, bend, or sever binding promises without breaking yourself. Affected by: honoring commitments, managing costs, resisting temptations, accepting consequences, and deliberate vow-making.'
      }
    }
  },
  'starlit-horizon': {
    id: 'starlit-horizon',
    name: 'Starlit Horizon',
    emoji: '🌌',
    description: 'Sci-Fi Exploration',
    detailedDescription: 'Step into quiet starships, lonely outposts, and skies that never end. This theme turns ordinary moments into grounded science fiction about navigation, adaptation, and wonder—charting courses through the unknown, listening for signals in the static, and making small choices that matter on a cosmic scale. Expect discovery over spectacle, human ingenuity over destiny, and the steady work of exploration.',
    colors: {
      primary: '#4169E1',
      secondary: '#1E90FF',
      accent: '#FFD700',
      background: '#000000',
      text: '#E6F3FF',
      border: '#4169E1'
    },
    background: `
      linear-gradient(0deg, #000000, #4169E1, #1E90FF, #FFD700),
      linear-gradient(90deg, #1E90FF, #000000, #4169E1, #FFD700)
    `,
    effects: ['star-field', 'nebula-glow', 'cosmic-dust'],
    sounds: ['space-ambient', 'sci-fi-synth', 'cosmic-echoes'],
    animations: ['star-twinkle', 'nebula-drift', 'cosmic-pulse'],
    storyPrompts: [
      'Charting a route around a faint hazard that sensors barely register',
      'Answering a routine beacon that returns a slightly different timestamp',
      'Repairing a damaged panel with improvised parts during a supply delay',
      'A navigation error that places you a few degrees off an expected starfield',
      'A signal in a familiar frequency that carries an unfamiliar cadence',
      'Calibrating an old telescope that suddenly resolves something moving slowly',
      'A pilot drill that becomes real when the lights flicker and stay dim',
      'Mapping a corridor of debris that shifts a little with each pass',
      'A station garden that thrives despite inconsistent gravity cycles',
      'Negotiating docking priority with a crew short on air but long on pride',
      'A survey drone returning with dust on surfaces it shouldn\'t reach',
      'Choosing to log an oddity rather than ignore it, and what follows'
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
    detailedDescription: 'Enter a world where magic flows through ancient tomes and every word holds power. This theme transforms your daily experiences into epic high fantasy adventures where you become a scholar-mage, wielding knowledge as your greatest weapon. Whether you\'re studying in a mystical library, negotiating with noble houses, or uncovering lost spells, every moment becomes part of a grand tapestry of destiny. Perfect for stories about magical academies, ancient wisdom, and the eternal dance between knowledge and power.',
    colors: {
      primary: '#DAA520',
      secondary: '#FF6B35',
      accent: '#00FF88',
      background: '#000000',
      text: '#F5F5DC',
      border: '#DAA520'
    },
    background: `
      linear-gradient(45deg, #000000, #DAA520, #FF6B35, #00FF88),
      linear-gradient(135deg, #FF6B35, #000000, #DAA520, #00FF88)
    `,
    effects: ['parchment-texture', 'quill-ink', 'magical-glow'],
    sounds: ['medieval-music', 'magical-chimes', 'castle-ambient'],
    animations: ['parchment-unroll', 'ink-flow', 'magical-sparkle'],
    storyPrompts: [
      'Ancient prophecies and chosen heroes',
      'Wizards and warriors in a world of magic',
      'Kingdoms at war and the price of peace',
      'The quest for the legendary artifact',
      'Magic that flows through every living thing',
      'Mystical libraries where knowledge comes alive',
      'Noble courts filled with political intrigue and magical diplomacy',
      'Ancient ruins hiding forgotten spells and lost civilizations',
      'Magical academies where students learn to harness their inner power',
      'Legendary artifacts that choose their own masters',
      'The eternal struggle between arcane knowledge and forbidden magic',
      'Scholars who discover that the greatest magic lies in understanding'
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
    detailedDescription: 'Dust on your boots, sun at your back, and a town that remembers names. This theme turns everyday moments into frontier stories about grit, barter, and reputation—quiet favors at the livery, cards that don\'t shuffle right, and letters that arrive months late. Expect lean stakes and steady hands: deals over drinks, iron under coats, and the long road between what\'s legal and what\'s right.',
    colors: {
      primary: '#D2691E',
      secondary: '#FFD700',
      accent: '#FF0000',
      background: '#000000',
      text: '#F5DEB3',
      border: '#D2691E'
    },
    background: `
      linear-gradient(15deg, #000000, #D2691E, #FFD700, #FF0000),
      linear-gradient(195deg, #FFD700, #000000, #D2691E, #FF0000)
    `,
    effects: ['dust-particles', 'tumbleweed-roll', 'sunset-glow'],
    sounds: ['acoustic-guitar', 'harmonica-melody', 'horse-hooves', 'saloon-piano'],
    animations: ['dust-swirl', 'sunset-fade', 'tumbleweed-bounce'],
    storyPrompts: [
      'A mysterious stranger rides into town with a secret that could change everything',
      'A sheriff must choose between justice and friendship when an old friend becomes an outlaw',
      'A gold rush brings fortune seekers and trouble to a peaceful frontier town',
      'A stagecoach robbery leads to an unexpected alliance between enemies',
      'A lone gunslinger seeks redemption for past mistakes in the lawless west',
      'A duel at high noon over a debt that can only be settled with lead',
      'A posse forms to hunt down a notorious outlaw who\'s been terrorizing the territory',
      'A saloon brawl erupts when a card game turns deadly and accusations fly',
      'A frontier town must choose between law and order when the sheriff goes missing',
      'A bounty hunter arrives with a price on someone\'s head, but the target claims innocence',
      'A cattle rustling operation threatens to destroy a rancher\'s livelihood and reputation',
      'Frontier justice is served when a corrupt land baron faces the consequences of his actions'
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
    name: 'Treasure Tides',
    emoji: '🏴‍☠️',
    description: 'High Seas Adventure',
    detailedDescription: 'Hoist canvas and read the waters. This theme turns ordinary moments into salt‑worn tales of seamanship, luck, and quiet daring—maps that don\'t agree, storms that bargain, and crews bound by rope, coin, and song. Expect clever work over brute force: codes in logbooks, hidden coves at low tide, and treasure that asks what you\'ll trade to keep it. It\'s about patience with the wind, trust earned on the line, and choices that echo across tides—where every knot, chart mark, and whispered verse can mean the difference between safe harbor and vanishing beyond the horizon.',
    colors: {
      primary: '#8B0000',
      secondary: '#4682B4',
      accent: '#FFD700',
      background: '#191970',
      text: '#F0F8FF',
      border: '#8B0000'
    },
    background: `
      linear-gradient(120deg, #191970, #000080, #8B0000, #4682B4),
      linear-gradient(240deg, #000080, #191970, #8B0000, #4682B4)
    `,
    effects: ['ocean-waves', 'storm-clouds', 'treasure-glow'],
    sounds: ['sea-shanty', 'ocean-waves', 'ship-creaking'],
    animations: ['wave-motion', 'storm-lightning', 'sail-billow'],
    storyPrompts: [
      'Two charts that disagree by a single reef, and which truth to trust',
      'A compass that drifts near iron nails someone added to the rail',
      'Ledger pages cut short, the rest written in numbers like a code',
      'A lantern that flickers in a pattern the lookout swears is a signal',
      'Ropes that fray faster than they should until you change the knot',
      'A harbor fee dispute that hides a quiet smuggler\'s route',
      'A storm seam you stitch mid‑squall, and what you find sewn in',
      'Tide tables that are off by minutes at a single hidden cove',
      'A bottle with sand too fine for any nearby beach',
      'Barnacles on the hull that grow in a deliberate spiral',
      'A shanty with an extra verse only old hands know',
      'A chart stain that reveals faint lines when warmed by a lamp'
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
