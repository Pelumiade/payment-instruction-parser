const { h, buildRegexFromComplexString } = require('../utils/regex-builder');
const { processQualifiers, processPossibleValues } = require('../utils/helpers');

const typeRegexString = h`
^
(?<PROPERTY_NAME>[a-zA-Z$_]+[a-zA-Z$_0-9]*)
(?<ARRAY_MARKER>\[\])?
(?<OPTIONAL_QUESTIONMARK>\?)?
 \s+
 (
   ?<PROPERTY_TYPE>
   ((?<REFERENCE>(#|ref:))|(?<REFERENCE_ALIAS>\$))?
   [a-zA-Z_$-]+[a-zA-Z$_0-9-]*
   (\.[a-zA-Z_$]+)?
 )?
 (?:
   (?:
    (?:\s*\((?<POSSIBLE_VALUES>[a-zA-Z-$_0-9\/\.,:|]+)\))?
    (?:\s*<(?<CONSTRAINTS>[a-zA-Z-$_0-9,!:@\.|\/\s+]+)>)?
   ) |
   (?:
    (?:\s*<(?<CONSTRAINTS_ALT>[a-zA-Z-$_0-9,!:@\.|\/\s+]+)>)?
    (?:\s*\((?<POSSIBLE_VALUES_ALT>[a-zA-Z-$_0-9\/\.,:|]+)\))?
   )
 )?
 (?:
  \s+as\s+(?<PROPERTY_ALIAS>[a-zA-Z$_]+[a-zA-Z$_0-9]*)
 )?
 (?:
   \s*(?<OPENING_PAREN>{)\s*
 )?
 (?:
   \s*\/\/\s*(?<COMMENT_TEXT>.+)?
 )?
 $
`;
const typeRegex = buildRegexFromComplexString(typeRegexString);
// console.log(typeRegex.source);
function typeLineProcessor(line = '') {
  let nodeInfo = {};
  const lineMatches = line.match(typeRegex);
  const lineGroups = lineMatches?.groups;
  // console.log(line, lineGroups);
  const {
    PROPERTY_NAME,
    PROPERTY_TYPE,
    PROPERTY_ALIAS,
    OPENING_PAREN,
    CONSTRAINTS,
    CONSTRAINTS_ALT,
    POSSIBLE_VALUES,
    POSSIBLE_VALUES_ALT,
    OPTIONAL_QUESTIONMARK,
    REFERENCE,
    REFERENCE_ALIAS,
    COMMENT_TEXT,
    ARRAY_MARKER,
  } = lineGroups || {};
  nodeInfo = {
    lineMatched: !!PROPERTY_NAME,
    name: PROPERTY_NAME,
    alias: PROPERTY_ALIAS,
    type: PROPERTY_TYPE?.replace('ref:', '#'),
    constraints: processQualifiers(CONSTRAINTS || CONSTRAINTS_ALT),
    possibleValues: processPossibleValues(POSSIBLE_VALUES || POSSIBLE_VALUES_ALT),
    isOpened: !!OPENING_PAREN,
    isOptional: !!OPTIONAL_QUESTIONMARK,
    isAReference: !!REFERENCE,
    isAReferenceAlias: !!REFERENCE_ALIAS,
    commentText: COMMENT_TEXT,
  };
  const isArray = !!ARRAY_MARKER;
  if (isArray) {
    nodeInfo.type = 'array';
    nodeInfo.arrayChildrenType = PROPERTY_TYPE?.replace('ref:', '#');
  }
  return nodeInfo;
}
module.exports = typeLineProcessor;
