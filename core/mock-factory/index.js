const createMockFactory = require('./create');
const findOneMockFactory = require('./find-one');
const findManyMockFactory = require('./find-many');
const updateOneMockFactory = require('./update-one');
const updateManyMockFactory = require('./update-many');
const deleteOneMockFactory = require('./delete-one');
const createManyMockFactory = require('./create-many');
const rawMockFactory = require('./raw-factory');

/**
 * MockModel - A mock object representing a MongoDB model.
 *
 * @typedef {Object} MockModel
 * @property {(dd: any) => { save: () => void }} constructor (dd) - A function that returns an object with a `save` method.
 * @property {(entries: object[], options: object) => object[]} insertMany - Inserts multiple documents into the collection.
 * @property {(query: object, projections: object, options: object) => object} findOne - Finds a single document in the collection.
 * @property {(query: object, projections: object, options: object) => object[]} find - Finds multiple documents in the collection.
 * @property {(query: object, updateValues: object) => object} updateOne - Updates a single document in the collection.
 * @property {(query: object, updateValues: object) => object} updateMany - Updates multiple documents in the collection.
 * @property {(query: object) => object} deleteOne - Deletes a single document from the collection.
 */

/**
 * Create a mock model
 * @param {object} dataKeys
 * @param {object} [mockDataStubs]
 * @param {object} [overrideMethods]
 * @returns {MockModel}
 */
function createMockingFactory(dataKeys, mockDataStubs = {}, overrideMethods = {}) {
  const { create, createMany, findOne, findMany, updateOne, updateMany, deleteOne, raw } =
    overrideMethods;

  const MockModel = function (dd) {
    return {
      save: create || createMockFactory(dataKeys.create, mockDataStubs.create, dd),
    };
  };

  /** @type {(entries:object[], options:object) => object[]} */
  MockModel.insertMany =
    createMany || createManyMockFactory(dataKeys.createMany, mockDataStubs.createMany);

  /** @type {(query:object, projections:object, options:object) => object} */
  MockModel.findOne = findOne || findOneMockFactory(dataKeys.findOne, mockDataStubs.findOne);

  /** @type {(query:object, projections:object, options:object) => object[]} */
  MockModel.find = findMany || findManyMockFactory(dataKeys.findMany, mockDataStubs.findMany);

  /** @type {(query: object, updateValues:object) => object} */
  MockModel.updateOne =
    updateOne || updateOneMockFactory(dataKeys.updateOne, mockDataStubs.updateOne);

  /** @type {(query:object, updateValues:object) => object} */
  MockModel.updateMany =
    updateMany || updateManyMockFactory(dataKeys.updateMany, mockDataStubs.updateMany);

  /** @type {(query:object) => object} */
  MockModel.deleteOne =
    deleteOne || deleteOneMockFactory(dataKeys.deleteOne, mockDataStubs.deleteOne);

  /** @type {(query:object) => object} */
  rawMockFactory(MockModel, dataKeys.raw, mockDataStubs.raw);

  return MockModel;
}

module.exports = createMockingFactory;
