const fs = require('fs').promises;
const path = require('path');

function toKebabCase(str) {
  return str
    .replace(/([a-z]+)([A-Z])/g, '$1-$2') // added + for lowercase
    .replace(/([A-Z])([A-Z][a-z]+)/g, '$1-$2') // added + for lowercase after uppercase
    .toLowerCase();
}

async function writeFileWithDirs(filePath, content) {
  try {
    // Create all necessary directories
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    // Check if file exists
    try {
      await fs.access(filePath);
      // console.log(`File ${filePath} already exists, skipping creation`);
      throw 2;
    } catch {
      // File doesn't exist, create it
      await fs.writeFile(filePath, content);
      // console.log(`Created file ${filePath}`);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = {
  toKebabCase,
  writeFileWithDirs,
};
