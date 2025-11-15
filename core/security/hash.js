const { createHash, createHmac } = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.HASH_SALT_ROUNDS, 10) || 10;

/**
 * @typedef {Object} HashOptions
 * @property {string} [algo] - The hashing algorithm. Defaults to md5
 * @property {string} [encoding] - The encoding of the hashed string. Defaults to hex
 * @property {string} [secret] - The encoding key
 */

/**
 * Create a standard hash
 * @param {string} value - the string to be hashed
 * @param {HashOptions} [options]
 * @returns {string}
 */
function create(value, { algo = 'md5', encoding = 'hex', secret } = {}) {
  let hashFn;

  if (secret) {
    hashFn = createHmac;
  } else {
    hashFn = createHash;
  }
  return hashFn(algo, secret).update(value).digest(encoding);
}

/**
 * Validate a string against a hash string
 * @param {string} value - the plain string
 * @param {string} hashedValue - the hash string
 * @param {HashOptions} [options]
 * @returns {boolean}
 */
function validate(value, hashedValue, options = {}) {
  const valueHash = create(value, options);

  return valueHash === hashedValue;
}

/**
 * Create a bcrypt hash
 * @async
 * @param {string} value - the data to be hashed
 * @returns {Promise<string>}
 */
function createBHash(value) {
  return bcrypt.hash(value, SALT_ROUNDS);
}

/**
 * Validate a string against a bcrypt hash string
 * @async
 * @param {string} - the plain string
 * @param {string} hashedValue - the bcrypt hash string
 * @returns {Promise<boolean>}
 */
function validateBHash(value, hashedValue) {
  return bcrypt.compare(value, hashedValue);
}

module.exports = { create, validate, createBHash, validateBHash };
