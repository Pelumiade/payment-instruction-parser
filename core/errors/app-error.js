/**
 * Throw an app error
 * @param {String} errorMessage
 * @param {String} [errorCode]
 * @param {{context:any, details:any}} [options]
 */
function appError(errorMessage, errorCode = 'ERR', options = {}) {
  const error = new Error(errorMessage);
  error.isApplicationError = true;
  error.errorCode = errorCode;

  if (options.context) {
    error.context = options.context;
  }

  if (options.details) {
    error.details = options.details;
  }

  throw error;
}

module.exports = appError;
