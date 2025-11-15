// @ts-check
const jwt = require('jsonwebtoken');

/**
 * JWTSignPayload
 * @typedef {Object} JWTSignPayload
 * @property {Object} data - The data to encode
 * @property {string} [expiration] - When the JWT Token should expire
 * @property {string} [secret] - The JWT Secret to use when signing the data. Defaults to the JWT_SECRET environment variable if availble or 'ABJWT12SECR04ET'
 */

/**
 *
 * @param {JWTSignPayload} jwtPayloadToSign
 * @returns
 */

function signPayload(jwtPayloadToSign) {
  const {
    data,
    expiration = process.env.JWT_DEFAULT_EXPIRY || '1H',
    secret = process.env.JWT_SECRET || 'ABJWT12SECR04ET',
  } = jwtPayloadToSign;
  return jwt.sign(data, secret, { expiresIn: expiration });
}

module.exports = signPayload;
