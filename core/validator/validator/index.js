/* eslint-disable default-param-last */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const extractValuesAndValidate = require('./validate');

function validateParsedSpec(data = {}, parsedSpec, opts = {}) {
  if (!parsedSpec.isRoot) {
    throwAppError('Invalid specification schema', ERROR_CODE.VALIDATIONERR);
  }

  return extractValuesAndValidate(data, parsedSpec, opts);
}

module.exports = validateParsedSpec;
