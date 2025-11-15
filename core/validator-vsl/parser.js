const lexer = require('./lexer');
const astGenerator = require('./ast-generator');

function parse(spec) {
  const { nodes, rootNodes } = lexer(spec);
  const AST = astGenerator({}, rootNodes, nodes);
  return AST;
}
module.exports = parse;
