const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the saved HTML file
const htmlPath = path.join(__dirname, '../c:/Users/gabit/Desktop/Privacy Policy of 4319802 _ quillia.app.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Remove unwanted elements
const removeSelectors = [
  'header.main-header',
  'aside',
  '.table-of-content-btn-wrapper',
  '.pre-footer',
  'footer',
  'script',
  'style',
  '.iub-manage-preferences-btn',
  '.iub-manage-preferences-container'
];

removeSelectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => el.remove());
});

// Get the main content
const main = document.querySelector('main');
if (!main) {
  console.error('Could not find main element');
  process.exit(1);
}

// Extract HTML from main
let content = main.innerHTML;

// Clean up the HTML - remove iubenda-specific classes and add our classes
content = content
  // Replace section classes
  .replace(/class="main__section[^"]*"/g, 'class="mb-8 p-6 bg-gray-800/30 rounded-lg border-l-4 border-orange-400"')
  // Replace h2 classes
  .replace(/<h2([^>]*)>/g, '<h2$1 class="text-xl font-semibold mb-4 text-orange-400 font-serif">')
  // Replace h3 classes
  .replace(/<h3([^>]*)>/g, '<h3$1 class="text-lg font-medium mb-3 text-orange-300 font-serif">')
  // Replace h4 classes (for accordion headers)
  .replace(/<h4([^>]*)>/g, '<h4$1 class="text-base font-medium mb-2 text-orange-300 font-serif">')
  // Replace h5 classes
  .replace(/<h5([^>]*)>/g, '<h5$1 class="text-sm font-medium mb-2 text-orange-300 font-serif">')
  // Replace p tags
  .replace(/<p([^>]*)>/g, '<p$1 class="mb-4 text-gray-300 font-serif leading-relaxed">')
  // Replace ul tags
  .replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc pl-6 mb-4 text-gray-300 font-serif leading-relaxed space-y-2">')
  // Replace li tags
  .replace(/<li([^>]*)>/g, '<li$1 class="mb-2">')
  // Replace links
  .replace(/<a([^>]*href="[^"]*")([^>]*)>/g, '<a$1$2 class="text-orange-400 hover:text-orange-300 underline">')
  // Remove details/summary accordion styling and make them simple sections
  .replace(/<details[^>]*>/g, '<div class="mb-4">')
  .replace(/<\/details>/g, '</div>')
  .replace(/<summary[^>]*>/g, '<div class="mb-2">')
  .replace(/<\/summary>/g, '</div>')
  // Remove accordion body classes
  .replace(/class="accordion__body[^"]*"/g, 'class="mt-2"')
  // Remove pills and other iubenda-specific UI elements
  .replace(/<ul class="pills-list[^"]*">.*?<\/ul>/gs, '')
  .replace(/<div class="summary__card[^"]*">.*?<\/article>/gs, '')
  // Remove images/icons
  .replace(/<figure[^"]*>.*?<\/figure>/gs, '')
  .replace(/<img[^>]*>/g, '');

// Save the processed content
const outputPath = path.join(__dirname, '../public/legal/privacy-policy-content.html');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
fs.writeFileSync(outputPath, content, 'utf-8');

console.log('✅ Processed HTML saved to:', outputPath);
console.log('📄 Content length:', content.length, 'characters');


