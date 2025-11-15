/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { syntaxRegexes, NodeTypes } = require('../constants');
const { isNodeAParent, isNodeRequired } = require('./helpers');
const nodeTypeFunction = require('./node-type-functions');

function parseSpec(specString) {
  let currentClosureNode;
  const specLines = specString.split(`\n`).map((a) => a.trim());

  specLines.forEach((specLine) => {
    try {
      if (!currentClosureNode && !specLine.startsWith('root')) {
        throwAppError('specification must start with root.', ERROR_CODE.APPERR);
      }

      if (currentClosureNode?.isRoot) {
        throwAppError('extra specification lines after closure of root', ERROR_CODE.APPERR);
      }

      let syntaxMatch;

      // match the current line against all supported regex to find a match
      for (const regexObj of syntaxRegexes) {
        syntaxMatch = specLine.match(regexObj.regex);

        if (!syntaxMatch) continue;

        if (regexObj.nodeType === NodeTypes.CLOSE_SCOPE) {
          if (!currentClosureNode) {
            throwAppError(
              'curly braces mismatch: there is a closure without an opening',
              ERROR_CODE.APPERR
            );
          }

          if (currentClosureNode.parent) {
            const temp = currentClosureNode.parent;
            delete currentClosureNode.parent;

            currentClosureNode.finalize();
            currentClosureNode = temp;
          } else {
            currentClosureNode.isRoot = true;
          }
        } else {
          const regexInfo = {};
          regexInfo.nodeType = regexObj.nodeType;
          regexInfo.attributeKey = regexObj.attributeKey;
          regexInfo.expectChildren = isNodeAParent(regexObj, syntaxMatch);
          regexInfo.isRequired = isNodeRequired(regexObj, syntaxMatch);
          regexInfo.matchMap =
            regexObj.matchMap?.reduce((acc, el) => {
              acc[el.name] = String(syntaxMatch[el.matchIndex]).trim();
              return acc;
            }, {}) || {};

          currentClosureNode = nodeTypeFunction[regexObj.nodeType](regexInfo, currentClosureNode);
        }

        break;
      }

      // if line doesn't match a regex throw an error.
      if (!syntaxMatch) {
        throwAppError('Unrecognized specification', ERROR_CODE.APPERR);
      }
    } catch (err) {
      err.message += `\r\nSpecification: "> ${specLine}"`;

      throw err;
    }
  });

  // the root node but always be returned.
  if (!currentClosureNode.isRoot) {
    throwAppError(`${currentClosureNode.identifier} has no closure`, ERROR_CODE.APPERR);
  }
  return currentClosureNode;
}
module.exports = parseSpec;
