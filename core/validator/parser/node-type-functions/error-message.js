/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { NodeTypes, DataTypeVariants } = require('../../constants');

module.exports = function (regexInfo, closureNode) {
  if (!closureNode) {
    throwAppError('error messages must belong to an identifier or rule', ERROR_CODE.APPERR);
  }

  if (closureNode.type === NodeTypes.IDENTIFIER) {
    if (closureNode.errorMessage) {
      throwAppError(
        `${closureNode.identifier} already has an error message defined`,
        ERROR_CODE.APPERR
      );
    }
    closureNode.errorMessage = regexInfo.matchMap.message;
  } else {
    const rule = closureNode.parent.rules[closureNode.type];

    if (!rule) throwAppError('enclosing rule node not found in parent identifier');

    if (rule.errorMessage) {
      throwAppError(
        `${closureNode.parent.identifier} already has an error message defined for the ${closureNode.type} rule`,
        ERROR_CODE.APPERR
      );
    }

    rule.errorMessage = regexInfo.matchMap.message;

    if (
      closureNode.type === NodeTypes.IDENTIFIER_TYPE &&
      DataTypeVariants.ARRAY.includes(rule.conditionValue)
    ) {
      const subTypeRule = closureNode.parent.rules[NodeTypes.IDENTIFIER_SUBTYPE];

      if (subTypeRule) {
        subTypeRule.errorMessage = regexInfo.matchMap.message;
      }
    }
  }

  return closureNode;
};
