import { getAvatarDescription } from './avatar-descriptions';

export function generateAvatarDescription(character: { avatar?: string | object; appearance?: string }): string {
  try {
    // Parse the avatar data if it's a JSON string
    const avatarData = typeof character.avatar === 'string' 
      ? JSON.parse(character.avatar) 
      : character.avatar;


    if (!avatarData || !avatarData.options?.layeredAvatar) {
      return `A ${character.appearance || 'androgynous'} character with basic appearance`;
    }

    const { head, torso, legs } = avatarData.options.layeredAvatar;
    const appearance = character.appearance || 'androgynous';
    
    
    // Build detailed visual description
    const parts = [];
    
    // Head description with visual details
    if (head) {
      const headDesc = generatePieceDescription(head, 'head');
      parts.push(headDesc);
    }
    
    // Torso description with visual details
    if (torso) {
      const torsoDesc = generatePieceDescription(torso, 'torso');
      parts.push(torsoDesc);
    }
    
    // Legs description with visual details
    if (legs) {
      const legsDesc = generatePieceDescription(legs, 'legs');
      parts.push(legsDesc);
    }
    
    // Combine into a coherent description
    if (parts.length === 0) {
      return `A ${appearance} character with basic appearance`;
    }
    
    const description = `A ${appearance} character with ${parts.join(', ')}`;
    return description;
    
  } catch (error) {
    // Fallback if avatar parsing fails
    return `A ${character.appearance || 'androgynous'} character with custom appearance`;
  }
}

export function generatePieceDescription(piece: { id: string; name: string; gender?: string }, category: string): string {
  // Get descriptive name from mapping or use fallback
  const descriptiveName = getAvatarDescription(piece.id, piece.name);
  
  const gender = piece.gender || 'unisex';
  
  // Create description based on the descriptive name
  if (category === 'head') {
    return `a ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral'} styled head with ${descriptiveName}`;
  } else if (category === 'torso') {
    return `a ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral'} styled torso with ${descriptiveName}`;
  } else if (category === 'legs') {
    return `a ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral'} styled legs with ${descriptiveName}`;
  }
  
  return descriptiveName;
}
