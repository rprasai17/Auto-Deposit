const fs = require('fs');
const path = require('path');

// Function to get all files in a directory with specific extension
function getFilesInDirectory(directory, extension) {
    const files = fs.readdirSync(directory);
    return files.filter(file => file.endsWith(extension));
}

// Function to copy file and update manifest
function copyAndUpdateFiles() {
    const buildDir = path.join(__dirname, '../build');
    const jsDir = path.join(buildDir, 'static/js');
    const cssDir = path.join(buildDir, 'static/css');

    // Get JS and CSS files
    const jsFiles = getFilesInDirectory(jsDir, '.js').filter(f => !f.endsWith('.map'));
    const cssFiles = getFilesInDirectory(cssDir, '.css').filter(f => !f.endsWith('.map'));

    // Read manifest file
    const manifestPath = path.join(__dirname, '../public/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Update web_accessible_resources to include exact filenames
    manifest.web_accessible_resources = [{
        "resources": [
            ...jsFiles.map(file => `static/js/${file}`),
            ...cssFiles.map(file => `static/css/${file}`),
            "static/media/*",
            "*.png"
        ],
        "matches": ["<all_urls>"]
    }];

    // Write updated manifest to build directory
    fs.writeFileSync(
        path.join(buildDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    // Copy background.js
    fs.copyFileSync(
        path.join(__dirname, '../public/background.js'),
        path.join(buildDir, 'background.js')
    );

    console.log('Build post-processing completed successfully!');
    console.log('JS files:', jsFiles);
    console.log('CSS files:', cssFiles);
}

try {
    copyAndUpdateFiles();
} catch (error) {
    console.error('Error during build post-processing:', error);
    process.exit(1);
}


