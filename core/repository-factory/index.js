const createFactory = require('./create');
const createManyFactory = require('./create-many');
const findOneFactory = require('./find-one');
const findManyFactory = require('./find-many');
const updateOneFactory = require('./update-one');
const updateManyFactory = require('./update-many');
const deleteOneFactory = require('./delete-one');
const rawFactory = require('./raw');

/**
 * @typedef {Object} queryFunctionData
 * @property {Object} query - Query values
 * @property {Object} [projections] - Projections
 * @property {Object} [options] - Options
 */

/**
 * @typedef {Object} updateFunctionData
 * @property {Object} query - Query values
 * @property {Object} updateValues - Projections
 */

/**
 * @typedef {Object} createFunctionData
 */

/**
 * @typedef {Object} createManyFunctionData
 * @property {Object[]} entries - Entries
 * @property {Object} [options] - Options
 */

/**
 * @typedef {Object} deleteFunctionData
 * @property {Object} query - Query values
 * @property {Object} options - Query options
 */

/**
 * @template {keyof typeof import('@app/models')} K
 * @param {K | (typeof import('@app/models'))[K]} modelOrName
 * @param {*} overrideMethods
 * @returns {{create: function(createFunctionData): Promise<import('@app/models')[K]>, createMany: function(createManyFunctionData): Promise<import('@app/models')[K][]>, findOne: function(queryFunctionData): Promise<import('@app/models')[K]>, findMany:function(queryFunctionData): Promise<import('@app/models')[K][]>, updateOne: function(updateFunctionData): Promise<{acknowledged: Boolean, modifiedCount: Number}>, updateMany: function(updateFunctionData): Promise<{acknowledged: Boolean, modifiedCount: Number}>, deleteOne: function(deleteFunctionData): Promise<{deletedCount: number}>,raw: function(): import('./raw').NativeModel}}
 */
function createRepositoryFactory(modelOrName) {
  return {
    create: createFactory(modelOrName),
    createMany: createManyFactory(modelOrName),
    findOne: findOneFactory(modelOrName),
    findMany: findManyFactory(modelOrName),
    updateOne: updateOneFactory(modelOrName),
    updateMany: updateManyFactory(modelOrName),
    deleteOne: deleteOneFactory(modelOrName),
    raw: rawFactory(modelOrName),
  };
}

module.exports = createRepositoryFactory;
