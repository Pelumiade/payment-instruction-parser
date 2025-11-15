const syntaxRegexes = [];

const identifierRegex = /^(\w+)\s*{$/;
syntaxRegexes.push({
  nodeType: 'identifier',
  expectChildren: true,
  regex: identifierRegex,
  matchMap: [
    {
      name: 'identifierName',
      matchIndex: 1,
    },
  ],
});

const ifNotFailWithRegex = /^if\s+not\s+fail\s+with\s*:\s*(.+)$/;
syntaxRegexes.push({
  nodeType: 'error-message',
  regex: ifNotFailWithRegex,
  matchMap: [
    {
      name: 'message',
      matchIndex: 1,
    },
  ],
});

const isDisplayedInErrorMessageRegex = /^is\s+displayed\s+in\s+error\s+messages\s+as\s*:\s*(.+)$/;
syntaxRegexes.push({
  nodeType: 'identifier-attribute',
  regex: isDisplayedInErrorMessageRegex,
  attributeKey: 'label',
  matchMap: [
    {
      name: 'attributeValue',
      matchIndex: 1,
    },
  ],
});

const setInFinalObjectRegex = /^set\s+in\s+final\s+object\s+as\s*:\s*(.+)$/;
syntaxRegexes.push({
  nodeType: 'identifier-attribute',
  regex: setInFinalObjectRegex,
  attributeKey: 'alias',
  matchMap: [
    {
      name: 'attributeValue',
      matchIndex: 1,
    },
  ],
});

const identifierWithType = /^(\w+)\s+is\s+(a|an)\s+(required\s+)?([a-zA-Z]+)\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'identifier',
  expectChildren: {
    if: {
      matchIndex: 5,
    },
  },
  isRequiredNode: {
    if: {
      matchIndex: 3,
    },
  },
  regex: identifierWithType,
  matchMap: [
    {
      name: 'identifierName',
      matchIndex: 1,
    },
    {
      name: 'identifierType',
      matchIndex: 4,
    },
  ],
});

const anythingIdentifierWithType = /^(\w+)\s+is\s+(anything)\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'identifier',
  expectChildren: {
    if: {
      matchIndex: 3,
    },
  },
  regex: anythingIdentifierWithType,
  matchMap: [
    {
      name: 'identifierName',
      matchIndex: 1,
    },
    {
      name: 'identifierType',
      matchIndex: 2,
    },
  ],
});

const anythingIdentifier = /^is\s+(anything)\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'identifier-type',
  expectChildren: {
    if: {
      matchIndex: 2,
    },
  },
  regex: anythingIdentifier,
  matchMap: [
    {
      name: 'identifierType',
      matchIndex: 1,
    },
  ],
});

const typeRegex = /^is\s+(a|an)\s+([a-zA-Z]+)\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'identifier-type',
  expectChildren: {
    if: {
      matchIndex: 3,
    },
  },
  regex: typeRegex,
  matchMap: [
    {
      name: 'identifierType',
      matchIndex: 2,
    },
  ],
});

const betweenRegex = /^is\s+between\s+([0-9]+)\s+and\s+([0-9]+)\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'between',
  expectChildren: {
    if: {
      matchIndex: 3,
    },
  },
  regex: betweenRegex,
  matchMap: [
    {
      name: 'betweenMin',
      matchIndex: 1,
    },
    {
      name: 'betweenMax',
      matchIndex: 2,
    },
  ],
});

const requiredRegex = /^is\s+required\s*({)?$/;
syntaxRegexes.push({
  nodeType: 'required',
  expectChildren: {
    if: {
      matchIndex: 1,
    },
  },
  regex: requiredRegex,
  matchMap: [],
});

const arrayRegex = /^is\s+(a|an)\s+(required\s+)?(array)(\s+of(\s+[a-zA-Z0-9_]+)?)?(\s*{)?$/;
syntaxRegexes.push({
  nodeType: 'identifier-type',
  expectChildren: {
    if: {
      matchIndex: 6,
    },
  },
  isRequiredNode: {
    if: {
      matchIndex: 2,
    },
  },
  regex: arrayRegex,
  matchMap: [
    {
      name: 'identifierType',
      matchIndex: 3,
    },
    {
      name: 'subTypeIndicator',
      matchIndex: 4,
    },
    {
      name: 'identifierSubType',
      matchIndex: 5,
    },
  ],
});

const arrayRegexWithIdentifier =
  /^(\w+)\s+is\s+(a|an)\s+(required\s+)?(array)(\s+of(\s+[a-zA-Z0-9_]+)?)?(\s*{)?$/;
syntaxRegexes.push({
  nodeType: 'identifier',
  expectChildren: {
    if: {
      matchIndex: 7,
    },
  },
  isRequiredNode: {
    if: {
      matchIndex: 3,
    },
  },
  regex: arrayRegexWithIdentifier,
  matchMap: [
    {
      name: 'identifierName',
      matchIndex: 1,
    },
    {
      name: 'identifierType',
      matchIndex: 4,
    },
    {
      name: 'subTypeIndicator',
      matchIndex: 5,
    },
    {
      name: 'identifierSubType',
      matchIndex: 6,
    },
  ],
});

const closeOpenedScopeRegex = `^}$`;
syntaxRegexes.push({
  nodeType: 'close-scope',
  regex: closeOpenedScopeRegex,
  matchMap: [],
});

const NodeTypes = syntaxRegexes.reduce((acc, el) => {
  acc[el.nodeType.toUpperCase().replace('-', '_')] = el.nodeType;
  return acc;
}, {});
NodeTypes.IDENTIFIER_SUBTYPE = 'identifier-subtype';

const DataTypeVariants = {
  STRING: ['string', 'strings'],
  NUMBER: ['integer', 'integers', 'number', 'numbers'],
  BOOLEAN: ['bool', 'bools', 'booleans', 'boolean'],
  ARRAY: ['array'],
  OBJECT: ['object'],
};

DataTypeVariants.NON_PRIMITIVES = [...DataTypeVariants.OBJECT, ...DataTypeVariants.ARRAY];

module.exports = { syntaxRegexes, NodeTypes, DataTypeVariants };
