const mockedRouter = require('./mocked-router');

const HOST_REGEX = /\w+:\/\/.+\.\w{2,4}/;
const QUERY_REGEX = /\?.*$/;

/**
 * Make a http request using axios library.
 * @async
 * @param {import("@app-core/http-request/request-client").RequestConfiguration} requestConfig
 */
async function mockedClient(requestConfig) {
  const endpoint = requestConfig.url.replace(HOST_REGEX, '').replace(QUERY_REGEX, '');

  return mockedRouter.resolve({
    ...requestConfig,
    endpoint: endpoint.toLowerCase(),
    method: requestConfig.method.toLowerCase(),
  });
}

module.exports = mockedClient;
