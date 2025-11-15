const { NodeTypes } = require('../constants');
const typeValidator = require('./type-validation');

const createErrorData = (message) => ({
  labelHierarchy: [],
  validationMessage: message,
  // nodeMessage,
  type: `ValidationError`,
  isValidationError: true,
});

module.exports = {
  [NodeTypes.REQUIRED]: (data, prop) => {
    if (!Object.hasOwn(data, prop) || typeof data[prop] === 'undefined' || data[prop] === null) {
      throw createErrorData('$label is required');
    }
  },
  [NodeTypes.BETWEEN]: (data, prop, conditionValue) => {
    const isBetweenRange = data[prop] >= conditionValue.min && data[prop] <= conditionValue.max;

    if (!isBetweenRange) {
      throw createErrorData(
        `$label must be between ${conditionValue.min} and ${conditionValue.max}`
      );
    }
  },
  [NodeTypes.IDENTIFIER_TYPE]: (data, prop, conditionValue) => {
    const validationResult = typeValidator(data[prop], conditionValue);

    if (validationResult.error) {
      throw createErrorData(`$label must be a valid ${conditionValue}`);
    }
    // eslint-disable-next-line no-param-reassign
    data[prop] = validationResult.value;
  },
  [NodeTypes.IDENTIFIER_SUBTYPE]: (data, prop, conditionValue) => {
    const arrayHasValidSubtypes =
      Array.isArray(data[prop]) &&
      data[prop].every((el) => !typeValidator(el, conditionValue).error);

    if (!arrayHasValidSubtypes) {
      throw createErrorData(`Elements of $label must be a valid ${conditionValue}`);
    }
  },
};
