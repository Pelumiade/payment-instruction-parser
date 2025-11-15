// @ts-check
const mongoose = require('mongoose');
const { MongooseTypes } = require('./enums');

const { Schema } = mongoose;
/**
 * @typedef {Object} MongooseModelConfigObject
 * @property {import('./enums').MongooseAllowedTypes} type - The data type of the property.
 * @property {boolean} [index=false] - Indicates whether the property should be indexed.
 * @property {boolean} [unique=false] - Indicates whether the property should be unique.
 * @property {boolean} [sparse=false] - Indicates whether the property should be sparse.
 * @property {any} [default] - The default value for the property.
 */

/**
 * @typedef {Object.<string, MongooseModelConfigObject|import('./enums').MongooseAllowedTypes>} MongooseModelConfig
 */

/**
 * Function to handle requests in an Express handler.
 * @callback ModelSchemaInitiator
 * @param {import('./enums').MongooseTypeStrings} mongooseTypes - Mongoose Types
 * @returns {MongooseModelConfig}
 */

/**
 *
 * @param {String} modelName
 * @param {ModelSchemaInitiator} modelSchemaInitiator
 * @returns {mongoose.Model}
 */
function createMongooseModel(modelName, modelSchemaInitiator) {
  const modelSchema = modelSchemaInitiator(MongooseTypes);
  return mongoose.model(modelName, new Schema(modelSchema));
}
module.exports = createMongooseModel;
// person.index({ firstName: 1, lastName: 1}, { unique: true }); Todo: Support for this kind of indexing
// createMongooseModel("borane", function ddCallback(mtypes) {
//   return {
//     game: Boolean,
//     meta: mtypes.Mixed,
//     bada: {
//       index: true,
//       unique: true,
//       type: String,
//       a:33,
//     },
//     abc: {
//       type: String,
//       unique: true,
//       sparse: true,
//       default: Date.now(),
//     },
//   };
// });
