/* eslint-disable no-param-reassign */
const dataGetter = require('./data-getter');

// Append raw functions to the model
function rawMockFactory(model, dataKey = 'default', mockDataStubs = {}) {
  const data = dataGetter(dataKey, mockDataStubs);

  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('The raw stub must be an object');
  }

  Object.entries(data).forEach(([key, impl]) => {
    model[key] = impl;
  });
}
module.exports = rawMockFactory;
