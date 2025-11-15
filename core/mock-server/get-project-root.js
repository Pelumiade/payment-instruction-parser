const path = require('path');

/**
 * Get the directory path of the main project.
 * @returns {String} - the main project directory path
 */
function getProjectRoot() {
  return path.join(__dirname, '../../');
}

module.exports = getProjectRoot;
