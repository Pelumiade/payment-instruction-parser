const joi = require('joi');

function validateType(value, type, log) {
  let result = {};
  if (log) {
    console.log(type === 'string' || type === 'strings', value, type, typeof value);
  }
  if (type === 'string' || type === 'strings') {
    result = joi.string().validate(value);
  }
  if (type === 'email' || type === 'emails') {
    result = joi.string().email().lowercase().validate(value);
  }
  if (type === 'integer' || type === 'integers') {
    result = joi.number().validate(value, {
      convert: false,
    });
  }
  if (type === 'number' || type === 'numbers') {
    result = joi.number().validate(value, { convert: false });
  }
  if (type === 'array') {
    result = joi.array().validate(value);
  }
  if (type === 'object') {
    result = joi.object().validate(value);
  }
  if (type === 'boolean' || type === 'booleans') {
    result = joi.boolean().validate(value, { convert: false });
  }
  if (type === 'domain' || type === 'domains') {
    result = joi.string().domain().validate(value);
  }
  if (type === 'ip' || type === 'ips') {
    result = joi.string().ip().validate(value);
  }
  if (type === 'uri' || type === 'uris') {
    result = joi.string().uri().validate(value);
  }
  return result;
}

module.exports = validateType;
