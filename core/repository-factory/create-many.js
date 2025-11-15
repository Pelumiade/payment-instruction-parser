/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { ulid } = require('@app-core/randomness');
const getModel = require('./get-model');

function extractRecord(recordDocument) {
  return recordDocument._doc || recordDocument;
}

/**
 * @typedef {Object} functionData
 * @property {Object[]} entries - Entries
 * @property {Object} [options] - Options
 */

/**
 * Generates a CreateMany repository function for the given model name.
 *
 * @template {keyof typeof import('@app/models')} K
 * @param {K | (typeof import('@app/models'))[K]} modelOrName - The name of the model or the model itself.
 * @returns {function(functionData): Promise<import('@app/models')[K][]>} - An array of model instances
 */
function createManyFactory(modelOrName) {
  const Model = getModel(modelOrName);

  return async function (data) {
    try {
      if (!Array.isArray(data?.entries)) {
        throw new Error('Cannot run model operation. Entries array is required');
      }

      const entries = data.entries.map((entry) => {
        const normEntry = { ...entry };

        if (Model.__appConfig?.supportULIDID) {
          normEntry._id = ulid();
        }

        normEntry.created = Date.now();
        normEntry.updated = normEntry.created;

        return normEntry;
      });

      const createdData = await Model.insertMany(entries, {
        ordered: false, // ensure we only report errors for the ones that fail
        throwOnValidationError: true,
        ...data.options,
      });

      // ensure we get back a simple Javascript Object.
      return createdData.map(extractRecord);
    } catch (e) {
      const errorCode = parseInt(e.code, 10);

      if (errorCode === 11000) {
        const duplicateValues = e.writeErrors?.reduce((acc, writeError) => {
          acc += `${writeError.err?.errmsg?.match(/dup\s*key:\s*(\{.+\})/i)?.[1]},` || '';

          return acc;
        }, '');

        const errMessage = `An existing record was found for: ${duplicateValues}`;
        const errCode = ERROR_CODE.DUPLRCRD;

        // some records may be inserted into the database before the operation throws
        // this ensures that the callee has context to the created records
        if (e.insertedDocs?.length) {
          const response = { createError: { message: errMessage, errorCode: errCode } };

          response.createdRecords = e.insertedDocs.map(extractRecord);

          return response;
        }

        throwAppError(errMessage, errCode);
      } else {
        throw e;
      }
    }
  };
}
module.exports = createManyFactory;
