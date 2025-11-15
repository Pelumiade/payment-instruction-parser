const createStubsDecorator = require('./create-stubs-decorator');

function createStubObject(defaultData) {
  const createDocument = (overwrites) => ({
    ...defaultData,
    ...overwrites,
  });

  const dataStubs = {
    create: {},
    createMany: {},
    findOne: {},
    findMany: {},
    updateOne: {},
    updateMany: {},
    deleteOne: {},
    raw: {},
    createDocument,
  };

  // The stubs that return data should ideally map to the same model schema (and maybe some validations too): TODO
  dataStubs.create.default = function (data) {
    return createDocument(data);
  };

  dataStubs.createMany.default = function (data) {
    return data.entries.map(createDocument);
  };

  dataStubs.findOne.default = function (configuration) {
    return createDocument(configuration.query);
  };

  dataStubs.findMany.default = function (configuration) {
    const many = [];

    for (let x = 1; x <= 10; x++) {
      many.push(createDocument(configuration.query));
    }
    return many;
  };

  dataStubs.updateOne.default = function () {
    return { updated: true };
  };

  dataStubs.updateMany.default = function () {
    return { updated: true };
  };

  dataStubs.deleteOne.default = function () {
    return { deletedCount: 1 };
  };

  dataStubs.raw.default = {
    countDocuments: () => 0,
  };

  return dataStubs;
}

/**
 * @typedef {Object} ModelStub
 * @property {{default:(data:object) => object}} create
 * @property {{default:(data: {entries: object[]}) => object}} createMany
 * @property {{default:(configuration:{query:object}) => object}} findOne
 * @property {{default:(configuration:{query:object}) => object}} findMany
 * @property {{default:() => {updated:boolean}}} updateOne
 * @property {{default:() => {updated:boolean}}} updateMany
 * @property {{default:() => {deletedCount: number}}} deleteOne
 * @property {{default:{ countDocuments: () => 0}}} raw
 * @property {(overwrites:object)=> object} createDocument
 * @property {import('./create-stubs-decorator').StubFactory} configureStubs
 */

/**
 * Create a model stub
 * @param {object} defaultData
 * @returns {ModelStub}
 */
module.exports = (defaultData) => {
  const dataStubs = createStubObject(defaultData);

  return {
    ...dataStubs,
    // Mocks and provides access to the mocked object for data changes assertions.
    configureStubs: createStubsDecorator(dataStubs, {
      keyPattern: { fieldA: 1, fieldB: 1 },
    }),
  };
};
