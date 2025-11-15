/* eslint-disable no-param-reassign */

/**
 * @typedef {Object} MockedDBResponse
 */

/**
 * @typedef {Object} MockedDBQuery
 */

/**
 * @callback StubFunction
 * @param {Object} MockedDBQuery
 * @returns {MockedDBResponse}
 */

/**
 * @typedef {Object} StubConfigData
 * @property {String} method - A repository model method
 * @property {Boolean} mockNull - Mock missing record scenario
 * @property {Boolean} mockDuplicateRecord - Mock duplicate record scenario
 * @property {Object} docConfig - Define the data returned in a find query
 * @property {function(MockedDBQuery, StubFunction): MockedDBResponse | null} overrideFn - Override the default stub function for a given method
 */

/**
 * @typedef {Object} MockedDoc
 * @property {MockedDBQuery} queryData
 * @property {MockedDBResponse} queryResponse
 * @property {Boolean} wasInvoked
 */

/**
 * @typedef {Object} StubConfig
 * @property {MockedDoc} mockedDoc
 * @property {function():undefined} revert - remove the decorator from the stub function
 */

/**
 * @callback StubFactory
 * @param {StubConfigData} configuration
 * @returns {StubConfig}
 */

/**
 * Creates a decorator function that allows mocking different behaviours of database model stubs based on the query method
 * @param {Object} dataStubs - The dataStubs object of the mocked model.
 * @param {Object} [factoryConfig] - Additional configuration of the decorator.
 * @returns {StubFactory} - A model instance
 */
function createStubsDecorator(dataStubs, factoryConfig = {}) {
  return function (stubConfig = {}) {
    const mockedDoc = { wasInvoked: false };

    const stubMethodObj = dataStubs[stubConfig.method] || {};
    const existingFn = stubMethodObj.default;

    stubMethodObj.default = function (data) {
      if (stubConfig.mockNull) {
        return stubConfig.method.includes('Many') ? [] : null;
      }

      if (stubConfig.mockDuplicateRecord) {
        const error = new Error();
        error.code = '11000';
        error.keyPattern = factoryConfig.keyPattern || { user: 1, account: 1 };

        throw error;
      }

      const queryData = { ...data };

      // override what the find* method returns to the service
      if (stubConfig.method.includes('find')) {
        queryData.query = queryData.query || {};
        Object.assign(queryData.query, stubConfig.docConfig);
      }

      let response;
      if (stubConfig.overrideFn) {
        response = stubConfig.overrideFn(queryData, existingFn);
      } else if (existingFn) {
        response = existingFn(queryData);
      } else {
        throw new Error('No stub function found');
      }

      mockedDoc.wasInvoked = true;
      mockedDoc.queryData = queryData;
      mockedDoc.queryResponse = response;

      return response;
    };

    return {
      mockedDoc,
      // revert stub default function
      revert() {
        stubMethodObj.default = existingFn;
      },
    };
  };
}

module.exports = createStubsDecorator;
