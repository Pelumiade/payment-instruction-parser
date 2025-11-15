const dataGetter = require('./data-getter');

function updateOneMockFactory(dataKey = 'default', mockDataStubs = {}) {
  return async function (query, updateValues) {
    const data = dataGetter(dataKey, mockDataStubs);
    return typeof data === 'function' ? data({ query, updateValues }) : data;
  };
}
module.exports = updateOneMockFactory;
