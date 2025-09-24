// Fantasy Avatar Pixel Art Data
// Each character is represented as a 16x16 pixel grid with detailed sprites

export const createPixelArt = (pixels: string[][], size: number = 16): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${pixels.map((row, y) => 
    row.map((color, x) => color !== 'transparent' ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>` : '').join('')
  ).join('')}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Human Warrior - Sir Aldric (Brown hair, armor, sword)
export const humanWarrior = createPixelArt([
  ['transparent', 'transparent', '#8B4513', '#8B4513', '#8B4513', '#8B4513', 'transparent', 'transparent'],
  ['transparent', '#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513', 'transparent'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Elf Mage - Lyralei Moonwhisper (Blonde hair, robes, staff)
export const elfMage = createPixelArt([
  ['transparent', 'transparent', '#FFD700', '#FFD700', '#FFD700', '#FFD700', 'transparent', 'transparent'],
  ['transparent', '#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700', 'transparent'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFD700'],
  ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Dwarf Ranger - Thorin Ironbeard (Red beard, armor, bow)
export const dwarfRanger = createPixelArt([
  ['transparent', 'transparent', '#8B4513', '#8B4513', '#8B4513', '#8B4513', 'transparent', 'transparent'],
  ['transparent', '#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513', 'transparent'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Halfling Rogue - Pip Quickfingers (Brown hair, leather, daggers)
export const halflingRogue = createPixelArt([
  ['transparent', 'transparent', '#8B4513', '#8B4513', '#8B4513', '#8B4513', 'transparent', 'transparent'],
  ['transparent', '#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513', 'transparent'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8B4513'],
  ['#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Tiefling Paladin - Zariel Lightbringer (Dark skin, horns, armor)
export const tieflingPaladin = createPixelArt([
  ['transparent', 'transparent', '#8D5524', '#8D5524', '#8D5524', '#8D5524', 'transparent', 'transparent'],
  ['transparent', '#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524', 'transparent'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#8D5524'],
  ['#8D5524', '#8D5524', '#8D5524', '#8D5524', '#8D5524', '#8D5524', '#8D5524', '#8D5524'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Gnome Bard - Fizzbang Sparkletoes (White hair, colorful clothes, lute)
export const gnomeBard = createPixelArt([
  ['transparent', 'transparent', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', 'transparent', 'transparent'],
  ['transparent', '#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF', 'transparent'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Orc Barbarian - Gruk the Destroyer (Green skin, spiky hair, axe)
export const orcBarbarian = createPixelArt([
  ['transparent', 'transparent', '#228B22', '#228B22', '#228B22', '#228B22', 'transparent', 'transparent'],
  ['transparent', '#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22', 'transparent'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#228B22'],
  ['#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22', '#228B22'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);

// Dragonborn Sorcerer - Vexxar Flameheart (Red scales, horns, robes)
export const dragonbornSorcerer = createPixelArt([
  ['transparent', 'transparent', '#DC143C', '#DC143C', '#DC143C', '#DC143C', 'transparent', 'transparent'],
  ['transparent', '#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C', 'transparent'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#FFDBAC', '#DC143C'],
  ['#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C', '#DC143C'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent'],
  ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent', 'transparent']
]);