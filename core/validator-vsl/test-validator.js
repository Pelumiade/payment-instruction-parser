const fs = require('fs');
const lexer = require('./lexer');

const sample = fs.readFileSync('./validator-test.spc', { encoding: 'utf-8' });
const astGenerator = require('./ast-generator');
const objectValidator = require('./validator');

const { nodes, rootNodes } = lexer(sample);
const AST = astGenerator({}, rootNodes, nodes);

const result = objectValidator(
  {
    id: '29as',
    ts: Date.now(),
    meta: {
      name: '222a',
      value: 'inactive',
      colors: [12, 12],
      dist: [{ chapter: '23aaa' }],
      chromes: ['3'],
    },
    tags: ['43'],
    places: [
      {
        bank: 'abido',
        amount: 43,
      },
      { bank: 'abad', amount: 32 },
      { bank: '23333', amount: 211 },
    ],
  },
  {},
  AST.root.children
);
fs.writeFileSync('./tval.json', JSON.stringify({ result, AST }, null, 2), {
  encoding: 'utf-8',
});
