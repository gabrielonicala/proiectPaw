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
    
    // Exact pixel coordinates as specified by user:
    // Head: 0 to 134 pixels (134px height)
    // Torso: 134 to 190 pixels (56px height)
    // Legs: 190 to 250 pixels (60px height)
    
    const headHeight = 134; // 0 to 134
    const torsoHeight = 56; // 134 to 190 (190 - 134 = 56)
    const legsHeight = 60;  // 190 to 250 (250 - 190 = 60)
    
    const baseName = fileName.replace('.png', '');
    
    // Cut head piece (0 to 134 pixels)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: width, height: headHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for head
      .png()
      .toFile(`public/avatars/head/${gender}-${baseName}-head.png`);
    
    // Cut torso piece (134 to 190 pixels)
    await sharp(inputPath)
      .extract({ left: 0, top: 134, width: width, height: torsoHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for torso
      .png()
      .toFile(`public/avatars/top/${gender}-${baseName}-torso.png`);
    
    // Cut legs piece (190 to 250 pixels)
    await sharp(inputPath)
      .extract({ left: 0, top: 190, width: width, height: legsHeight })
      .resize(64, 64, { kernel: sharp.kernel.nearest }) // Square for legs
      .png()
      .toFile(`public/avatars/bottom/${gender}-${baseName}-legs.png`);
    
    console.log(`✓ Cut ${gender}/${fileName} into pieces with correct proportions`);
    
  } catch (error) {
    console.error(`Error processing ${gender}/${fileName}:`, error.message);
  }
}

async function processAllAvatars() {
  console.log('Starting avatar cutting process with CORRECT proportions...\n');
  console.log('Head: 0-134px (134px height)');
  console.log('Torso: 134-190px (56px height)');
  console.log('Legs: 190-250px (60px height)\n');
  
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
  
  console.log('\n✅ Avatar cutting process completed with CORRECT proportions!');
  console.log('Generated pieces:');
  console.log('- Head pieces (0-134px): public/avatars/head/');
  console.log('- Torso pieces (134-190px): public/avatars/top/');
  console.log('- Legs pieces (190-250px): public/avatars/bottom/');
}

// Run the process
processAllAvatars().catch(console.error);
