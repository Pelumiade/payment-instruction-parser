const dataGetter = require('./data-getter');

function createManyMockFactory(dataKey = 'default', mockDataStubs = {}) {
  return async function (entries, options) {
    const data = dataGetter(dataKey, mockDataStubs);
    return typeof data === 'function' ? data({ entries, options }) : data;
  };
}
module.exports = createManyMockFactory;
