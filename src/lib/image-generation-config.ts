// Image Generation Configuration
// Primary provider: Google Gemini (Nano Banana)
// Fallback options: DALL-E and Stable Diffusion

export const IMAGE_GENERATION_CONFIG = {
  // Set to 'dalle', 'stable-diffusion', or 'gemini'
  provider: 'gemini' as 'dalle' | 'stable-diffusion' | 'gemini',
  
  // Reference images for Stable Diffusion consistency
  referenceImages: [
    '/reference-images/perfect-obsidian-veil.png',
    '/reference-images/perfect-echoes-of-dawn.png'
  ],
  
  // Fallback settings
  fallbackToDalle: true, // If Stable Diffusion fails, fallback to DALL-E
};

// Helper function to get the current provider
export function getImageProvider(): 'dalle' | 'stable-diffusion' | 'gemini' {
  return IMAGE_GENERATION_CONFIG.provider;
}

// Helper function to get reference images
export function getReferenceImages(): string[] {
  return IMAGE_GENERATION_CONFIG.referenceImages;
}
