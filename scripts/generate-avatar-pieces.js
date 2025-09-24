const fs = require('fs');
const path = require('path');

// Create simple colored rectangles as placeholder images
const createPlaceholderImage = (color, name) => {
  // Simple 64x64 colored rectangle as base64 PNG
  const canvas = `
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#000000"/>
      <rect x="8" y="8" width="48" height="48" fill="${color}"/>
      <rect x="12" y="12" width="40" height="40" fill="${color}80"/>
      <text x="32" y="36" text-anchor="middle" fill="white" font-family="monospace" font-size="8">${name}</text>
    </svg>
  `;
  return Buffer.from(canvas).toString('base64');
};

// Head pieces
const headPieces = [
  { name: 'warrior-helm', color: '#666666' },
  { name: 'wizard-hat', color: '#8B4513' },
  { name: 'rogue-hood', color: '#2F4F4F' },
  { name: 'cleric-crown', color: '#FFD700' },
  { name: 'barbarian-hair', color: '#8B4513' }
];

// Top pieces
const topPieces = [
  { name: 'leather-armor', color: '#8B4513' },
  { name: 'chain-mail', color: '#C0C0C0' },
  { name: 'wizard-robe', color: '#4B0082' },
  { name: 'cleric-vestments', color: '#FFFFFF' },
  { name: 'rogue-tunic', color: '#2F4F4F' }
];

// Bottom pieces
const bottomPieces = [
  { name: 'leather-pants', color: '#8B4513' },
  { name: 'chain-leggings', color: '#C0C0C0' },
  { name: 'wizard-skirt', color: '#4B0082' },
  { name: 'cleric-robes', color: '#FFFFFF' },
  { name: 'rogue-leggings', color: '#2F4F4F' }
];

// Create directories
const dirs = ['public/avatars/head', 'public/avatars/top', 'public/avatars/bottom'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate head pieces
headPieces.forEach(piece => {
  const svg = createPlaceholderImage(piece.color, piece.name.split('-')[0]);
  const filePath = path.join('public/avatars/head', `${piece.name}.svg`);
  fs.writeFileSync(filePath, Buffer.from(svg, 'base64').toString());
});

// Generate top pieces
topPieces.forEach(piece => {
  const svg = createPlaceholderImage(piece.color, piece.name.split('-')[0]);
  const filePath = path.join('public/avatars/top', `${piece.name}.svg`);
  fs.writeFileSync(filePath, Buffer.from(svg, 'base64').toString());
});

// Generate bottom pieces
bottomPieces.forEach(piece => {
  const svg = createPlaceholderImage(piece.color, piece.name.split('-')[0]);
  const filePath = path.join('public/avatars/bottom', `${piece.name}.svg`);
  fs.writeFileSync(filePath, Buffer.from(svg, 'base64').toString());
});

console.log('Avatar pieces generated successfully!');
