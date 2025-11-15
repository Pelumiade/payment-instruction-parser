const redactFactory = require('@app-core/security/redact');
const logClient = require('./log-client');
const { LOG_TYPE } = require('./constants');

const defaultRedactor = redactFactory();

/**
 *
 * @param {Object} data
 * @param {import('@app-core/security/redact').RedactFactoryOptions} options
 * @returns {Object} - An object with redacted fields.
 */
function redact(data, options) {
  let redactedData;

  if (!options) {
    redactedData = defaultRedactor(data);
  } else {
    const redactOptions = {};

    if (Array.isArray(options)) {
      redactOptions.fieldsToRedact = options;
    } else {
      Object.assign(redactOptions, options);
    }

    redactedData = redactFactory(redactOptions)(data);
  }

  return redactedData;
}

/**
 * @typedef {Object} LogOptions
 * @property {string[] | import('@app-core/security/redact').RedactFactoryOptions} redact
 */

/**
 * @param {LOG_TYPE} type - The log type/level
 * @param {Object} data - The data to be logged
 * @param {string} optionalKey - An optional label to identify the log
 * @param {LogOptions} options - Log configurations
 * @returns {void}
 */
function _log(type, data, optionalKey = 'APP-LOG', options = {}) {
  const redactedData = redact(data, options.redact);

  logClient[type](redactedData, String(optionalKey));
}

/**
 * @callback LogMethod
 * @param {Object} data - The data to be logged
 * @param {string} optionalKey - An optional label to identify the log
 * @param {LogOptions} options - Log configurations
 * @returns
 */

/** @typedef {LogMethod} */
const logger = (data, optionalKey, options) => _log(LOG_TYPE.LOG, data, optionalKey, options);

/** @type {LogMethod} */
logger.info = (data, optionalKey, options) => _log(LOG_TYPE.INFO, data, optionalKey, options);

/** @type {LogMethod} */
logger.warn = (data, optionalKey, options) => _log(LOG_TYPE.WARN, data, optionalKey, options);

/** @type {LogMethod} */
logger.error = (data, optionalKey, options) => _log(LOG_TYPE.ERROR, data, optionalKey, options);

/** @type {LogMethod} */
logger.errorX = (data, optionalKey, options) =>
  _log(
    LOG_TYPE.ERROR,
    { errorMessage: data.message, errorStack: data.stack, _raw: data },
    optionalKey,
    options
  );

module.exports = logger;
