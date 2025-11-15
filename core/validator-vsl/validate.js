const { throwAppError } = require('@app-core/errors');
const objectValidator = require('./validator');

function validateParsedSpec(data, parsedSpec, options = {}) {
  // console.log(parsedSpec, 'running');
  let result;
  const { dontThrowErrors } = options;
  const errors = {};
  const dontThrowSingleErrors = dontThrowErrors || process?.env?.NO_SINGLE_ERRORS;

  if (dontThrowSingleErrors) {
    // @todo: Refactor so the flag to not throw is not directly on the error tree.
    errors.__$app_no_throw = true;
    errors.__$app_first_message = false;
  }
  try {
    result = objectValidator(data, {}, parsedSpec.root.children, '', errors);
    // console.log(result);
  } catch (e) {
    // console.log(errors);
    throwAppError(e.message, 'SPCL_VALIDATION', { details: errors });
  }

  // eslint-disable-next-line camelcase
  const { __$app_no_throw, __$app_first_message, ...remainingErrors } = errors;
  // console.log(remainingErrors);
  if (Object.keys(remainingErrors).length > 0 && dontThrowSingleErrors) {
    const errorsArray = [];
    Object.keys(remainingErrors).forEach((key) => {
      errorsArray.push({
        field: key,
        message: remainingErrors[key],
      });
    });
    // eslint-disable-next-line camelcase
    const errorMessageToThrow = process?.env?.TOP_LEVEL_ERROR_MESSAGE || __$app_first_message;
    throwAppError(errorMessageToThrow, 'SPCL_VALIDATION', { details: errorsArray });
  }
  return result;
}

module.exports = validateParsedSpec;
