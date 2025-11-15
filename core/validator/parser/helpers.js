const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { DataTypeVariants } = require('../constants');

function getNodeAttribute(regexObj, syntaxMatch, key) {
  let returnValue = false;

  if (typeof regexObj[key] === 'object' && syntaxMatch[regexObj[key].if?.matchIndex]) {
    returnValue = true;
  } else if (typeof regexObj[key] === 'boolean') {
    returnValue = regexObj[key];
  }

  return returnValue;
}

/**
 * Node Schema
 * type: The node type based on the regexes
 * identifier: The property identifier
 * rules: {[type]: Rule}
 * children: [Node]
 * errorMessage: ""
 */
exports.createNode = (type, identifier = 'unknown') => ({
  type,
  identifier,
  rules: {},
  attributes: {},
  addRule(ruleType, conditionValue, validationFn) {
    if (this.rules[ruleType]) {
      throwAppError(`${ruleType} rule already set for ${this.identifier}`, ERROR_CODE.APPERR);
    }

    this.rules[ruleType] = {
      conditionValue,
      validationFn,
    };
  },
  finalize() {
    Object.freeze(this.rules);
    Object.freeze(this);
  },
});

exports.isNodeRequired = (regexObj, syntaxMatch) =>
  getNodeAttribute(regexObj, syntaxMatch, 'isRequiredNode');

exports.isNodeAParent = (regexObj, syntaxMatch) =>
  getNodeAttribute(regexObj, syntaxMatch, 'expectChildren');

exports.checkTypeCompartibility = (ruleValue, dataTypeVariants, nodeType) => {
  if (!dataTypeVariants.includes(ruleValue)) {
    throwAppError(`${nodeType} can not be used for ${ruleValue}`, ERROR_CODE.APPERR);
  }
};

exports.checkSubTypeSpec = (regexInfo) => {
  if (
    regexInfo.matchMap.subTypeIndicator === 'of' &&
    DataTypeVariants.ARRAY.includes(regexInfo.matchMap.identifierType) &&
    !regexInfo.matchMap.identifierSubType &&
    !regexInfo.expectChildren
  ) {
    throwAppError('array identifier must have a subtype', ERROR_CODE.APPERR);
  }
};
