const { requestMethodsConfig, createResponse } = require('./mocked-router');
/**
 * @typedef {import("@app-core/http-request/request-client").HTTPRequestMethod} HTTPMethods
 */

/**
 * @typedef {import("@app-core/mock-http-request-proxy/mocked-router").MockedClientResponse} MockedClientResponse
 */

/**
 * @callback MockHTTPResolver
 * @param {import("@app-core/http-request/request-client").RequestConfiguration} RequestConfiguration
 * @param {import("@app-core/mock-http-request-proxy/mocked-router").CreateResponse} createResponse
 * @returns {MockedClientResponse}
 */

/**
 * @typedef {Object} MockedClientStub
 * @property {function():undefined} revert
 */

/**
 * Setup a mocked response for a given path
 * @param {{method: HTTPMethods, path: String, paths: String[], response:MockedClientResponse, overrideFn: MockHTTPResolver}} MockConfigurations
 * @returns {MockedClientStub}
 */
function configureMockedHttpClient({ method, path, paths, response, overrideFn }) {
  const normMethod = method.toLowerCase();
  const mPaths = paths || [path];

  if (!requestMethodsConfig[normMethod]) {
    requestMethodsConfig[normMethod] = {};
  }

  mPaths.forEach((el) => {
    const normPath = el.toLowerCase();

    if (overrideFn) {
      requestMethodsConfig[normMethod][normPath] = overrideFn;
    } else if (response) {
      requestMethodsConfig[normMethod][normPath] = createResponse(response);
    } else {
      requestMethodsConfig[normMethod][normPath] = requestMethodsConfig[normMethod].default;
    }
  });

  return {
    revert: () => {
      mPaths.forEach((el) => {
        delete requestMethodsConfig[normMethod][el.toLowerCase()];
      });
    },
  };
}

module.exports = configureMockedHttpClient;
