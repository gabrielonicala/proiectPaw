const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create output directories
const outputDirs = ['public/avatars/head', 'public/avatars/top', 'public/avatars/bottom'];
outputDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// List of avatar images to process
const maleAvatars = [
  'male/3.png', 'male/4.png', 'male/5.png', 'male/6.png',
  'male/7.png', 'male/8.png', 'male/9.png', 'male/10.png', 'male/11.png',
  'male/12.png', 'male/13.png', 'male/14.png', 'male/15.png', 'male/16.png',
  'male/17.png', 'male/18.png', 'male/19.png', 'male/20.png'
];

const femaleAvatars = [
  'female/avatar.png', 'female/2.png', 'female/3.png', 'female/4.png', 'female/5.png',
  'female/6.png', 'female/7.png', 'female/8.png', 'female/9.png', 'female/10.png',
  'female/11.png', 'female/12.png', 'female/13.png', 'female/14.png', 'female/15.png',
  'female/16.png', 'female/17.png', 'female/18.png', 'female/19.png', 'female/20.png'
];

async function cutAvatarIntoPieces(inputPath, gender, fileName) {
  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    
    console.log(`Processing ${gender}/${fileName}: ${width}x${height}`);
    
    // Based on the avatar structure, cut at these proportions:
    // Head: top 30% (0 to 30%)
    // Torso: middle 40% (30% to 70%) 
    // Legs: bottom 30% (70% to 100%)
    
    const headHeight = Math.floor(height * 0.30); // Top 30%
    const torsoHeight = Math.floor(height * 0.40); // Middle 40%
    const legsHeight = height - headHeight - torsoHeight; // Bottom 30%
    
    const baseName = fileName.replace('.png', '');
    
    // Cut head piece (top 30%)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: width, height: headHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for head
      .png()
      .toFile(`public/avatars/head/${gender}-${baseName}-head.png`);
    
    // Cut torso piece (middle 40%)
    await sharp(inputPath)
      .extract({ left: 0, top: headHeight, width: width, height: torsoHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for torso
      .png()
      .toFile(`public/avatars/top/${gender}-${baseName}-torso.png`);
    
    // Cut legs piece (bottom 30%)
    await sharp(inputPath)
      .extract({ left: 0, top: headHeight + torsoHeight, width: width, height: legsHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for legs
      .png()
      .toFile(`public/avatars/bottom/${gender}-${baseName}-legs.png`);
    
    console.log(`✓ Cut ${gender}/${fileName} into pieces`);
    
  } catch (error) {
    console.error(`Error processing ${gender}/${fileName}:`, error.message);
  }
}

async function processAllAvatars() {
  console.log('Starting avatar cutting process with correct proportions...\n');
  
  // Process male avatars
  for (const avatar of maleAvatars) {
    const inputPath = `public/avatars/${avatar}`;
    const fileName = path.basename(avatar);
    
    if (fs.existsSync(inputPath)) {
      await cutAvatarIntoPieces(inputPath, 'male', fileName);
    } else {
      console.log(`⚠️  File not found: ${inputPath}`);
    }
  }
  
  // Process female avatars
  for (const avatar of femaleAvatars) {
    const inputPath = `public/avatars/${avatar}`;
    const fileName = path.basename(avatar);
    
    if (fs.existsSync(inputPath)) {
      await cutAvatarIntoPieces(inputPath, 'female', fileName);
    } else {
      console.log(`⚠️  File not found: ${inputPath}`);
    }
  }
  
  console.log('\n✅ Avatar cutting process completed!');
  console.log('Generated pieces with correct proportions:');
  console.log('- Head pieces (30%): public/avatars/head/');
  console.log('- Torso pieces (40%): public/avatars/top/');
  console.log('- Legs pieces (30%): public/avatars/bottom/');
}

// Run the process
processAllAvatars().catch(console.error);
