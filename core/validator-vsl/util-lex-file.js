const prelexer = require('./pre-lex');
const lexer = require('./lexer');
const fs = require('fs');

function lexFile(filePath) {
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const lexedFile = lexer(prelexer(fileContent));
  return lexedFile;
}

module.exports = lexFile;
