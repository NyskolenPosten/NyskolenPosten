const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Sørg for at scripts-mappen eksisterer
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Definer output-mappe
const outputDir = path.join(__dirname, '../public');

// Les SVG-filen
const svgBuffer = fs.readFileSync(path.join(outputDir, 'logo.svg'));

// Generer PNG-ikoner i ulike størrelser
async function generateIcons() {
  try {
    // Favicon (16x16)
    await sharp(svgBuffer)
      .resize(16, 16)
      .toFile(path.join(outputDir, 'favicon.ico'));
    
    // 192x192 icon
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'logo192.png'));
    
    // 512x512 icon
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'logo512.png'));
    
    console.log('Ikoner generert vellykket!');
  } catch (error) {
    console.error('Feil ved generering av ikoner:', error);
  }
}

// Kjør ikongenereringen
generateIcons(); 