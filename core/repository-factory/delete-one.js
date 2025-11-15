/* eslint-disable no-param-reassign */
const getModel = require('./get-model');

function getUpdateValues(uniqueFields) {
  let updateValues = { deleted: Date.now() };

  if (Array.isArray(uniqueFields) && uniqueFields.length) {
    const setOp = { ...updateValues };
    // [{$set:{ fieldA: $concat: [`&deleted:${Date.now()}`,'$fieldA'] }}]

    uniqueFields.forEach((field) => {
      setOp[field] = { $concat: [`&del:${Date.now()}-`, { $toString: `$${field}` }] };
    });
    updateValues = [{ $set: setOp }];
  }

  return updateValues;
}

/**
 * @typedef {Object} functionData
 * @property {Object} query - Query values
 * @property {Object} [options] - Query options
 */

/**
 * Generates a Delete repository function for the given model name
 *
 * @template {keyof typeof import('@app/models')} K
 * @param {K | (typeof import('@app/models'))[K]} modelOrName - The name of the model or the model itself.
 * @returns {function(functionData): Promise<{deletedCount: number}>} - A model instance
 */
function deleteOneFactory(modelOrName) {
  const Model = getModel(modelOrName);

  return async function (data) {
    if (!data.query || typeof data.query !== 'object') {
      throw new Error('Cannot run model operation. Query is required');
    }

    const query = { ...data.query };
    const options = { ...data.options };

    let result;

    // should soft delete if paranoid is enabled on model and options.paranoid is not explicitly false
    if (
      Model.__appConfig?.paranoid &&
      (!Object.hasOwn(options, 'paranoid') ||
        (Object.hasOwn(options, 'paranoid') && options.paranoid))
    ) {
      const updateValues = getUpdateValues(Model.__appConfig.uniqueFields);

      result = await Model.updateOne(query, updateValues);
    } else {
      result = await Model.deleteOne(query);
    }

    return result;
  };
}
module.exports = deleteOneFactory;
