const getModel = require('./get-model');

/**
 * @typedef {import('mongoose').Model} NativeModel
 */

/**
 * Generates a Raw repository function for the given model name
 *
 * @template {keyof typeof import('@app/models')} K
 * @param {K | (typeof import('@app/models'))[K]} modelOrName - The name of the model or the model itself.
 * @returns {NativeModel} - The native model instance
 */
function rawFactory(modelOrName) {
  const Model = getModel(modelOrName);

  return function () {
    return Model;
  };
}
module.exports = rawFactory;
