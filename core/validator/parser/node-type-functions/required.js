/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes } = require('../../constants');
const { createNode } = require('../helpers');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('required rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  closureNode.addRule(NodeTypes.REQUIRED, true, RuleValidator[NodeTypes.REQUIRED]);

  if (regexInfo.expectChildren) {
    const node = createNode(regexInfo.nodeType, regexInfo.matchMap.identifierName);
    node.parent = closureNode;
    closureNode = node;
  }

  return closureNode;
};
