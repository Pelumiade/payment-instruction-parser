/* eslint-disable default-param-last */
const dataGetter = require('./data-getter');

function createMockFactory(dataKey = 'default', mockDataStubs = {}, dataToCreate) {
  return function () {
    const data = dataGetter(dataKey, mockDataStubs);
    return typeof data === 'function' ? data(dataToCreate) : data;
  };
}
module.exports = createMockFactory;
