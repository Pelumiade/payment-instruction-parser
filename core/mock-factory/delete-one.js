const dataGetter = require('./data-getter');

function deleteOneMockFactory(dataKey = 'default', mockDataStubs = {}) {
  return async function (query) {
    const data = dataGetter(dataKey, mockDataStubs);
    return typeof data === 'function' ? data({ query }) : data;
  };
}
module.exports = deleteOneMockFactory;
