const { throwAppError } = require('@app-core/errors');

/**
 * @typedef {Object} MockedClientResponse
 * @property {Number} status
 * @property {Object} headers
 * @property {Object} data
 */

/**
 * Create mocked client response object
 * @callback CreateResponse
 * @param {MockedClientResponse} responseConfig
 * @returns {MockedClientResponse}
 */

/** @type {CreateResponse} */
const createResponse = ({ status = 200, headers = {}, data } = {}) => ({
  status,
  headers,
  data: { ...data },
});

const requestMethodsConfig = {
  post: {},
  get: {},
  put: {},
  patch: {},
  delete: {},
};

requestMethodsConfig.post.default = (requestConfig) => createResponse({ data: requestConfig.data });
requestMethodsConfig.get.default = () => createResponse();
requestMethodsConfig.patch.default = (requestConfig) =>
  createResponse({ data: requestConfig.data });
requestMethodsConfig.put.default = (requestConfig) => createResponse({ data: requestConfig.data });
requestMethodsConfig.delete.default = () => createResponse({ status: 204 });

/**
 * Check if path definition matches endpoint
 * @param {String} path
 * @param {String} endpoint
 * @returns {Boolean}
 */
function pathMatchesEndpoint(path, endpoint) {
  const paths = path.split('/');
  const endpoints = endpoint.split('/');

  return paths.every((el, idx) => el === endpoints[idx] || el.startsWith(':'));
}

/**
 * @typedef {import("@app-core/http-request/request-client").RequestConfiguration} RequestConfiguration
 * @property {String} endpoint
 */

/**
 * Resolve mocked request
 * @param {RequestConfiguration} requestConfig
 * @returns {MockedClientResponse}
 */
function resolveRequest(requestConfig) {
  const methodConfig = requestMethodsConfig[requestConfig.method];

  if (!methodConfig) {
    throwAppError(`No mocked HTTP method found for ${requestConfig.method}`);
  }

  let response;

  const resolverKey = Object.keys(methodConfig).find((key) =>
    pathMatchesEndpoint(key, requestConfig.endpoint)
  );

  if (resolverKey) {
    response =
      typeof methodConfig[resolverKey] === 'function'
        ? methodConfig[resolverKey](requestConfig, createResponse)
        : methodConfig[resolverKey];
  }

  if (!response) {
    response = methodConfig.default(requestConfig);
  }

  return response;
}

module.exports = {
  resolve: resolveRequest,
  requestMethodsConfig,
  createResponse,
};
