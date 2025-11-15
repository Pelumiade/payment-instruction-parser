const { parse, validate } = require('../validator');

const REDACT_FIELDS = {
  password: 1,
  authorization: 1,
  token: 1,
  apikey: 1,
  postmantoken: 1,
  otp: 1,
  xsignature: 1,
  verifhash: 1,
};

/**
 * @typedef {Object} RedactOptions
 * @property {string} replaceWithValue - The replacement string for values that are redacted.
 * @property {Object} fieldsToRedact - The properties to be redacted.
 * @property {boolean} removeRedactedFields - A flag to indicate if the redacted fields should be removed from the returned object.
 */

/**
 * @typedef {Object} RedactFactoryOptions
 * @property {string} replaceWithValue - The replacement string for values that are redacted.
 * @property {array} fieldsToRedact - A list of properties to be redacted.
 * @property {boolean} removeRedactedFields - A flag to indicate if the redacted fields should be removed from the returned object.
 */

const normKey = (key) => key.replace(/[\W_]+/g, '').toLowerCase();

/**
 * @callback Redact
 * @param {Object} data
 * @param {RedactOptions} opts
 * @returns {Object}
 */
function redact(data, opts) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const redactedData = {};

  Object.keys(data).forEach((key) => {
    if (opts.fieldsToRedact[normKey(key)]) {
      if (!opts.removeRedactedFields) {
        redactedData[key] = opts.replaceWithValue;
      }
    } else if (Array.isArray(data[key])) {
      redactedData[key] = data[key].map((el) =>
        el && typeof el === 'object' ? redact(el, opts) : el
      );
    } else if (data[key] && typeof data[key] === 'object') {
      redactedData[key] = redact(data[key], opts);
    } else {
      redactedData[key] = data[key];
    }
  });

  return redactedData;
}

const spec = `root{
  replaceWithValue is a string
  fieldsToRedact is an array of strings
  removeRedactedFields is a boolean
}`;

const parsedSpec = parse(spec);

/**
 * Create a redact function
 * @param {RedactFactoryOptions} opts
 * @returns
 */
function redactFactory(opts = {}) {
  const params = validate(opts, parsedSpec);

  const redactOptions = {
    replaceWithValue: '********',
    fieldsToRedact: {
      ...REDACT_FIELDS,
    },
  };

  if (params.fieldsToRedact) {
    params.fieldsToRedact.forEach((field) => {
      redactOptions.fieldsToRedact[field.toLowerCase()] = 1;
    });

    delete params.fieldsToRedact;
  }

  Object.assign(redactOptions, params);

  return (data) => {
    let normData = data;
    let wasNormalized = false;

    if (typeof normData !== 'object') {
      normData = { data };
      wasNormalized = true;
    }

    const redactedData = redact(normData, redactOptions);

    return wasNormalized ? redactedData.data : redactedData;
  };
}

module.exports = redactFactory;
