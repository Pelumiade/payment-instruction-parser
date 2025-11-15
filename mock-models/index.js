const { Types } = require('mongoose');
const { SchemaTypes } = require('@app-core/mongoose');
const mockingFactory = require('@app-core/mock-factory');
const models = require('@app/models');
const createStub = require('./create-stub');

const USE_MOCK_MODEL = parseInt(process.env.USE_MOCK_MODEL, 10);

const TS_REGEX = /created|updated|deleted|\w+(millis|ms|timestamp)/;
function getDefaultValue(pathName, pathConfig) {
  const normPathName = pathName.toLowerCase();

  let defaultValue;

  if (Object.hasOwn(pathConfig, 'defaultValue')) {
    defaultValue = pathConfig.defaultValue;
  } else if (TS_REGEX.test(normPathName)) {
    defaultValue = Date.now();
  } else if (normPathName.includes('email')) {
    defaultValue = 'user@example.com';
  } else if (pathConfig.options.type === SchemaTypes.Number) {
    defaultValue = 1;
  } else if (pathConfig.options.type === SchemaTypes.Boolean) {
    defaultValue = true;
  } else if (pathConfig.options.type === SchemaTypes.Date) {
    defaultValue = new Date();
  } else if (pathConfig.options.type === SchemaTypes.Mixed) {
    defaultValue = {};
  } else if (pathConfig.options.type === SchemaTypes.ObjectId) {
    defaultValue = new Types.ObjectId();
  } else if (pathConfig.options.type === SchemaTypes.Map) {
    defaultValue = new Map();
  } else if (pathConfig.options.type === SchemaTypes.Array) {
    defaultValue = [];
  } else {
    defaultValue = `sample-${normPathName}`;
  }

  return defaultValue;
}

function generateMockedData(model) {
  const schemaPaths = model.schema?.paths;

  const mockedData = {};

  if (schemaPaths) {
    Object.entries(schemaPaths).forEach(([pathName, pathConfig]) => {
      if (pathConfig.isRequired === true || Object.hasOwn(pathConfig, 'defaultValue')) {
        mockedData[pathName] = getDefaultValue(pathName, pathConfig);
      }
    });
  }

  return mockedData;
}

/**
 * @typedef {Object} ModelMocks
 * @property {Object<string, import('@app-core/mock-factory').MockModel>} MockModels
 * @property {Object<string,import('./create-stub').ModelStub>} MockModelStubs
 */

/**
 * Create model mocks
 * @returns {ModelMocks}
 */
function createMockModels() {
  const MockModels = {};
  const MockModelStubs = {};

  if (USE_MOCK_MODEL) {
    Object.entries(models).forEach(([modelName, model]) => {
      const mockedData = generateMockedData(model);
      const modelStubs = createStub(mockedData);

      MockModelStubs[modelName] = modelStubs;
      MockModels[modelName] = mockingFactory(
        {
          create: process.env.MODEL_MOCK_SESSION,
          createMany: process.env.MODEL_MOCK_SESSION,
          findOne: process.env.MODEL_MOCK_SESSION,
          findMany: process.env.MODEL_MOCK_SESSION,
          updateOne: process.env.MODEL_MOCK_SESSION,
          updateMany: process.env.MODEL_MOCK_SESSION,
          deleteOne: process.env.MODEL_MOCK_SESSION,
          raw: process.env.MODEL_MOCK_SESSION,
        },
        modelStubs
      );
    });
  }

  return { MockModels, MockModelStubs };
}

module.exports = createMockModels();
