const hb = require('handlebars');

function parseString(templateString) {
  return hb.compile(templateString);
}

module.exports = parseString;
