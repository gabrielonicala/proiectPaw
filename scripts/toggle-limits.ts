import fs from 'fs';
import path from 'path';

const SUBSCRIPTION_LIMITS_FILE = path.join(__dirname, '../src/lib/subscription-limits.ts');

function toggleLimits() {
  try {
    // Read the current file
    let content = fs.readFileSync(SUBSCRIPTION_LIMITS_FILE, 'utf8');
    
    // Find the current USE_SHARED_LIMITS value
    const currentMatch = content.match(/export const USE_SHARED_LIMITS = (true|false);/);
    
    if (!currentMatch) {
      console.error('❌ Could not find USE_SHARED_LIMITS constant');
      return;
    }
    
    const currentValue = currentMatch[1] === 'true';
    const newValue = !currentValue;
    
    // Replace the value
    content = content.replace(
      /export const USE_SHARED_LIMITS = (true|false);/,
      `export const USE_SHARED_LIMITS = ${newValue};`
    );
    
    // Write back to file
    fs.writeFileSync(SUBSCRIPTION_LIMITS_FILE, content);
    
    console.log(`✅ Switched to ${newValue ? 'SHARED' : 'PER-CHARACTER'} limits`);
    console.log('');
    console.log('📊 Current Limits:');
    
    if (newValue) {
      console.log('  🎯 Tribute Users: 30 chapters + 3 scenes (shared across all characters)');
      console.log('  🆓 Free Users: 5 chapters + 0 scenes (shared across all characters)');
    } else {
      console.log('  🎯 Tribute Users: 10 chapters + 1 scene per character');
      console.log('  🆓 Free Users: 5 chapters + 0 scenes (shared across all characters)');
    }
    
    console.log('');
    console.log('🔄 Restart your development server to apply changes');
    
  } catch (error) {
    console.error('❌ Error toggling limits:', error);
  }
}

toggleLimits();
