const dataGetter = require('./data-getter');

function findOneMockFactory(dataKey = 'default', mockDataStubs = {}) {
  return async function (query, projections, options) {
    const data = dataGetter(dataKey, mockDataStubs);
    return typeof data === 'function' ? data({ query, projections, options }) : data;
  };
}
module.exports = findOneMockFactory;
