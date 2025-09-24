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
  'male/avatar.png', 'male/3.png', 'male/4.png', 'male/5.png', 'male/6.png',
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
    
    // Calculate cut points (adjust these ratios based on your avatar proportions)
    const headHeight = Math.floor(height * 0.3); // Top 30%
    const topHeight = Math.floor(height * 0.4);  // Middle 40%
    const bottomHeight = height - headHeight - topHeight; // Remaining bottom
    
    const baseName = fileName.replace('.png', '');
    
    // Cut head piece (top 30%)
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: width, height: headHeight })
      .resize(64, 20, { kernel: sharp.kernel.nearest }) // Resize to standard size
      .png()
      .toFile(`public/avatars/head/${gender}-${baseName}-head.png`);
    
    // Cut top piece (middle 40%)
    await sharp(inputPath)
      .extract({ left: 0, top: headHeight, width: width, height: topHeight })
      .resize(64, 24, { kernel: sharp.kernel.nearest })
      .png()
      .toFile(`public/avatars/top/${gender}-${baseName}-top.png`);
    
    // Cut bottom piece (bottom 30%)
    await sharp(inputPath)
      .extract({ left: 0, top: headHeight + topHeight, width: width, height: bottomHeight })
      .resize(64, 20, { kernel: sharp.kernel.nearest })
      .png()
      .toFile(`public/avatars/bottom/${gender}-${baseName}-bottom.png`);
    
    console.log(`✓ Cut ${gender}/${fileName} into pieces`);
    
  } catch (error) {
    console.error(`Error processing ${gender}/${fileName}:`, error.message);
  }
}

async function processAllAvatars() {
  console.log('Starting avatar cutting process...\n');
  
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
  console.log('Generated pieces:');
  console.log('- Head pieces: public/avatars/head/');
  console.log('- Top pieces: public/avatars/top/');
  console.log('- Bottom pieces: public/avatars/bottom/');
}

// Run the process
processAllAvatars().catch(console.error);
