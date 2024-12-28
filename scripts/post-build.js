const fs = require('fs');
const path = require('path');

// Copy manifest.json to build directory
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifestDestPath = path.join(__dirname, '../build/manifest.json');
fs.copyFileSync(manifestPath, manifestDestPath);

// Copy background.js to build directory
const backgroundPath = path.join(__dirname, '../public/background.js');
const backgroundDestPath = path.join(__dirname, '../build/background.js');
fs.copyFileSync(backgroundPath, backgroundDestPath);

console.log('Post-build copy completed successfully!');