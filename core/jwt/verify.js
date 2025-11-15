// @ts-check
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const jwt = require('jsonwebtoken');

/**
 * JWTVerifyPayload
 * @typedef {Object} JWTVerifyPayload
 * @property {string} token - The token to verify
 * @property {string} [secret] - The JWT Secret to use when verifying the data. Defaults to the JWT_SECRET environment variable if availble or 'ABJWT12SECR04ET'
 */

/**
 *
 * @param {JWTVerifyPayload} jwtPayloadToVerify
 * @returns
 */

function verifyToken(jwtPayloadToVerify) {
  const { token, secret = process.env.JWT_SECRET || 'ABJWT12SECR04ET' } = jwtPayloadToVerify;
  let verifiedData;
  const errorInfo = {
    code: ERROR_CODE.INVLDAUTHTOKEN,
    message: 'Invalid token.',
  };
  try {
    verifiedData = jwt.verify(token, secret);
  } catch (e) {
    if (e.message === 'jwt expired') {
      errorInfo.message = 'Your authentication token has expired.';
      errorInfo.code = ERROR_CODE.EXPIREDTOKEN;
    }
  }
  if (!verifiedData) throwAppError(errorInfo.message, errorInfo.code);
  return verifiedData;
}

module.exports = verifyToken;
