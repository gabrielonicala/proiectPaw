export interface AvatarPiece {
  id: string;
  name: string;
  imagePath: string;
  category: 'head' | 'torso' | 'legs';
  gender: 'male' | 'female' | 'unisex';
  description: string;
}

export interface LayeredAvatar {
  head: AvatarPiece;
  torso: AvatarPiece;
  legs: AvatarPiece;
  id: string;
  name: string;
}

// Generate pieces from the cut avatar images
const generatePieces = () => {
  const pieces: AvatarPiece[] = [];
  
  // Male head pieces
  for (let i = 3; i <= 20; i++) {
    pieces.push({
      id: `male-head-${i}`,
      name: `Male Head ${i}`,
      imagePath: `/avatars/head/male-${i}-head.png`,
      category: 'head',
      gender: 'male',
      description: `Male head piece from avatar ${i}`
    });
  }
  
  // Female head pieces
  pieces.push({
    id: 'female-head-avatar',
    name: 'Female Head Avatar',
    imagePath: '/avatars/head/female-avatar-head.png',
    category: 'head',
    gender: 'female',
    description: 'Female head piece from base avatar'
  });
  
  for (let i = 2; i <= 20; i++) {
    pieces.push({
      id: `female-head-${i}`,
      name: `Female Head ${i}`,
      imagePath: `/avatars/head/female-${i}-head.png`,
      category: 'head',
      gender: 'female',
      description: `Female head piece from avatar ${i}`
    });
  }
  
  // Male torso pieces
  for (let i = 3; i <= 20; i++) {
    pieces.push({
      id: `male-torso-${i}`,
      name: `Male Torso ${i}`,
      imagePath: `/avatars/top/male-${i}-torso.png`,
      category: 'torso',
      gender: 'male',
      description: `Male torso piece from avatar ${i}`
    });
  }
  
  // Female torso pieces
  pieces.push({
    id: 'female-torso-avatar',
    name: 'Female Torso Avatar',
    imagePath: '/avatars/top/female-avatar-torso.png',
    category: 'torso',
    gender: 'female',
    description: 'Female torso piece from base avatar'
  });
  
  for (let i = 2; i <= 20; i++) {
    pieces.push({
      id: `female-torso-${i}`,
      name: `Female Torso ${i}`,
      imagePath: `/avatars/top/female-${i}-torso.png`,
      category: 'torso',
      gender: 'female',
      description: `Female torso piece from avatar ${i}`
    });
  }
  
  // Male legs pieces
  for (let i = 3; i <= 20; i++) {
    pieces.push({
      id: `male-legs-${i}`,
      name: `Male Legs ${i}`,
      imagePath: `/avatars/bottom/male-${i}-legs.png`,
      category: 'legs',
      gender: 'male',
      description: `Male legs piece from avatar ${i}`
    });
  }
  
  // Female legs pieces
  pieces.push({
    id: 'female-legs-avatar',
    name: 'Female Legs Avatar',
    imagePath: '/avatars/bottom/female-avatar-legs.png',
    category: 'legs',
    gender: 'female',
    description: 'Female legs piece from base avatar'
  });
  
  for (let i = 2; i <= 20; i++) {
    pieces.push({
      id: `female-legs-${i}`,
      name: `Female Legs ${i}`,
      imagePath: `/avatars/bottom/female-${i}-legs.png`,
      category: 'legs',
      gender: 'female',
      description: `Female legs piece from avatar ${i}`
    });
  }
  
  return pieces;
};

export const allPieces = generatePieces();

export const headPieces = allPieces.filter(piece => piece.category === 'head');
export const torsoPieces = allPieces.filter(piece => piece.category === 'torso');
export const legsPieces = allPieces.filter(piece => piece.category === 'legs');

export function getPiecesByCategory(category: 'head' | 'torso' | 'legs'): AvatarPiece[] {
  return allPieces.filter(piece => piece.category === category);
}

export function getPiecesByGender(gender: 'male' | 'female'): AvatarPiece[] {
  return allPieces.filter(piece => piece.gender === gender || piece.gender === 'unisex');
}

export function createLayeredAvatar(head: AvatarPiece, torso: AvatarPiece, legs: AvatarPiece): LayeredAvatar {
  return {
    head,
    torso,
    legs,
    id: `${head.id}-${torso.id}-${legs.id}`,
    name: `${head.name} ${torso.name} ${legs.name}`
  };
}

export function getDefaultLayeredAvatar(): LayeredAvatar {
  // Get the first available pieces for each category
  const defaultHead = headPieces[0];
  const defaultTorso = torsoPieces[0];
  const defaultLegs = legsPieces[0];
  
  return createLayeredAvatar(defaultHead, defaultTorso, defaultLegs);
}