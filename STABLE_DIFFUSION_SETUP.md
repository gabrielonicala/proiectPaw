# Stable Diffusion Setup Guide

## Overview

The app now uses **Juggernaut XL** through the Replicate API, which offers:
- Better character consistency across generations
- Improved prompt following for complex scenes
- Optimized parameters for pixel art and themed scenes
- Fallback to DALL-E if Stable Diffusion fails

## Environment Variables

Add this to your `.env.local` file:

```bash
# Replicate API Token for Stable Diffusion
REPLICATE_API_TOKEN=your_replicate_token_here
```

## Getting a Replicate API Token

1. Go to [replicate.com](https://replicate.com)
2. Sign up for an account
3. Go to your account settings
4. Generate an API token
5. Copy the token and add it to your `.env.local` file

## Usage

The new Stable Diffusion routes are now available:

- `/api/generate-image-sd` - Basic Stable Diffusion XL
- `/api/generate-image-sd-advanced` - Advanced with reference image support

## Reference Images

To use your 2 perfect images as examples:

1. Upload the images to a public URL (or store them in your app)
2. Pass them as `referenceImages` array when calling `generateImageSD()`

Example:
```typescript
const referenceImages = [
  'https://your-domain.com/perfect-obsidian-veil-image.png',
  'https://your-domain.com/perfect-echoes-of-dawn-image.png'
];

const imageUrl = await generateImageSD(
  originalText, 
  themeConfig, 
  character, 
  referenceImages
);
```

## Benefits

- **Better consistency** than DALL-E
- **Reference image support** for maintaining style
- **Lower cost** (~$0.01-0.05 per image vs DALL-E's higher pricing)
- **More control** over generation parameters
- **Fallback to DALL-E** if Stable Diffusion fails

## Configuration

The app is now configured to use Stable Diffusion by default. You can switch between providers by editing `src/lib/image-generation-config.ts`:

```typescript
export const IMAGE_GENERATION_CONFIG = {
  // Set to 'dalle' or 'stable-diffusion'
  provider: 'stable-diffusion' as 'dalle' | 'stable-diffusion',
  
  // Reference images for Stable Diffusion consistency
  referenceImages: [
    '/reference-images/perfect-obsidian-veil.png',
    '/reference-images/perfect-echoes-of-dawn.png'
  ],
  
  // Fallback settings
  fallbackToDalle: true, // If Stable Diffusion fails, fallback to DALL-E
};
```

## How to Identify Which Service Was Used

### **Console Logs**
Check your browser's developer console for these indicators:
- **Stable Diffusion**: `🎨 Generating image with Stable Diffusion + Reference Images...`
- **DALL-E**: `🎨 Generating image with DALL-E...`

### **Loading Screen**
The loading message will show:
- **Stable Diffusion**: `🎨 Painting with Stable Diffusion + Reference Images...`
- **DALL-E**: `🎨 Painting with DALL-E...`

### **Modal Display**
In the generated image modal, look for the "Provider" field:
- **Stable Diffusion**: Shows in green text: `Stable Diffusion + Reference Images`
- **DALL-E**: Shows in blue text: `DALL-E`

### **Visual Status Indicator**
You can add the `ImageProviderStatus` component to your app to always see which provider is active.

## Testing

The app will now automatically use Stable Diffusion with your reference images. If Stable Diffusion fails, it will automatically fallback to DALL-E.

To test:
1. Make sure your reference images are uploaded to `public/reference-images/`
2. Add your Replicate API token to `.env.local`
3. Generate a Scene - it should use Stable Diffusion with your reference images
4. Check the console logs and modal to confirm which service was used
