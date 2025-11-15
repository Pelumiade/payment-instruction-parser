/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { NodeTypes } = require('../../constants');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError(
      `identifier ${regexInfo.matchMap.attributeKey || 'attribute'} must belong to an identifier`,
      ERROR_CODE.APPERR
    );
  }

  if (closureNode.attributes[regexInfo.attributeKey]) {
    throwAppError('identifier label is already defined', ERROR_CODE.APPERR);
  }

  closureNode.attributes[regexInfo.attributeKey] = regexInfo.matchMap.attributeValue;

  return closureNode;
};
