const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { ulid } = require('@app-core/randomness');
const getModel = require('./get-model');

function extractRecord(recordDocument) {
  return recordDocument._doc || recordDocument;
}

/**
 * @typedef {Object} functionData
 */

/**
 * Generates a Create repository function for the given model name
 *
 * @template {keyof typeof import('@app/models')} K
 * @param {K | (typeof import('@app/models'))[K]} modelOrName - The name of the model or the model itself.
 * @returns {function(functionData): Promise<import('@app/models')[K]>} - A model instance
 */
function createFactory(modelOrName) {
  const Model = getModel(modelOrName);

  return async function (data, options = {}) {
    try {
      const cloneData = { ...data };
      cloneData.created = Date.now();
      cloneData.updated = cloneData.created;

      if (Model.__appConfig?.supportULIDID) {
        cloneData._id = ulid();
      }

      const createdData = await new Model(cloneData).save(options);

      // ensure we get back a simple Javascript Object.
      return extractRecord(createdData);
    } catch (e) {
      const errorCode = parseInt(e.code, 10);

      if (errorCode === 11000) {
        const existingFields = Object.keys(e.keyPattern || {}).join(',');
        throwAppError(`An existing ${existingFields} record exists.`, ERROR_CODE.DUPLRCRD);
      } else {
        throw e;
      }
    }
  };
}
module.exports = createFactory;
