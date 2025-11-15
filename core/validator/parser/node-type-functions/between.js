/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes, DataTypeVariants } = require('../../constants');
const { createNode, checkTypeCompartibility } = require('../helpers');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('between rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  const dataTypeRule = closureNode.rules[NodeTypes.IDENTIFIER_TYPE];

  checkTypeCompartibility(
    dataTypeRule?.conditionValue?.toLowerCase(),
    DataTypeVariants.NUMBER,
    NodeTypes.BETWEEN
  );

  const range = {
    min: parseInt(regexInfo.matchMap.betweenMin, 10),
    max: parseInt(regexInfo.matchMap.betweenMax, 10),
  };

  if (!Number.isInteger(range.min) || !Number.isInteger(range.max)) {
    throwAppError('between rule must have a valid minimum and maximum value', ERROR_CODE.APPERR);
  }

  closureNode.addRule(NodeTypes.BETWEEN, range, RuleValidator[NodeTypes.BETWEEN]);

  if (regexInfo.expectChildren) {
    const node = createNode(regexInfo.nodeType, regexInfo.matchMap.identifierName);
    node.parent = closureNode;
    closureNode = node;
  }

  return closureNode;
};
