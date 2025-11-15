/* eslint-disable no-param-reassign */
const FormData = require('form-data');
const requestProxy = require('./request-proxy');

const REQUEST_TIMEOUT = parseInt(process.env.HTTP_REQUEST_TIMEOUT, 10) || 15000;

/**
 * @typedef {Object} RequestOptions
 * @property {any} data
 * @property {RouteConfiguration} routeConfiguration
 * @property {BaseOptions} baseOptions
 */

/**
 * Format request argument and invoke the http request proxy
 * @param {import('./request-client').HTTPRequestMethod} method
 * @param {string} path
 * @param {RequestOptions} requestOptions
 * @returns
 */
function makeRequest(method, path, { data, routeConfiguration, baseOptions } = {}) {
  const requestConfiguration = {
    method,
    url: path,
    headers: {},
    timeout: routeConfiguration?.timeout || baseOptions?.timeout || REQUEST_TIMEOUT,
  };

  if (baseOptions.baseUrl) {
    requestConfiguration.url = baseOptions.baseUrl + requestConfiguration.url;
  }

  if (data) {
    requestConfiguration.data = data;
  }

  if (routeConfiguration?.headers) {
    requestConfiguration.headers = { ...routeConfiguration.headers };
  }

  if (baseOptions?.headers) {
    requestConfiguration.headers = { ...baseOptions.headers, ...requestConfiguration.headers };
  }

  return requestProxy({ ...baseOptions, ...routeConfiguration, ...requestConfiguration });
}

/**
 * @typedef {Object} BaseOptions
 * @property {object} headers - The request headers to be sent.
 * @property {number} timeout - The number of milliseconds before the request times out.
 * @property {string} baseUrl - The server base url to be used for all request. This will be prepended to `path` parameter of the request method.
 * @property {string} logLabel - An identifier for logging errors.
 * @property {import('@app-core/logger/log').LogOptions} logOptions - Log configurations
 * @property {boolean} enableVerboseLogging - Specifies if extra information should be added to the logs.
 * @property {Object} responseShapeSpec - A parsed specification to validate the response data.
 */

/**
 * @typedef {Object} RouteConfiguration
 * @property {object} headers - The request headers to be sent.
 * @property {number} timeout - The number of milliseconds before the request times out.
 * @property {string} responseType - The type of data that the server will respond.
 * @property {number} maxContentLength - The max size of the http response content in bytes.
 * @property {string} logLabel - An identifier for logging errors.
 * @property {import('@app-core/logger/log').LogOptions} logOptions - Log configurations
 * @property {boolean} enableVerboseLogging - Specifies if extra information should be added to the logs.
 * @property {Object} responseShapeSpec - A parsed specification to validate the response data.
 */

/**
 * @callback DataHttpRequestMethods
 * @param {string} path - The absolute or relative server URL.
 * @param {Object} data
 * @param {RouteConfiguration} routeConfiguration
 * @returns {Promise<requestProxy.RequestProxyResponse>}
 */

/**
 * @callback NoDataHttpRequestMethods
 * @param {string} path - The absolute or relative server URL.
 * @param {RouteConfiguration} routeConfiguration
 * @returns {Promise<requestProxy.RequestProxyResponse>}
 */

/**
 * @typedef {Object} HttpRequestMethods
 * @property {DataHttpRequestMethods} post
 * @property {NoDataHttpRequestMethods} get
 * @property {DataHttpRequestMethods} put
 * @property {DataHttpRequestMethods} patch
 * @property {NoDataHttpRequestMethods} delete
 */

/**
 *
 * @param {BaseOptions} baseOptions
 * @returns {HttpRequestMethods}
 */
function httpRequest(baseOptions) {
  return {
    post: (path, data, routeConfiguration) =>
      makeRequest('post', path, { data, routeConfiguration, baseOptions }),
    get: (path, routeConfiguration) =>
      makeRequest('get', path, { routeConfiguration, baseOptions }),
    put: (path, data, routeConfiguration) =>
      makeRequest('put', path, { data, routeConfiguration, baseOptions }),
    patch: (path, data, routeConfiguration) =>
      makeRequest('patch', path, { data, routeConfiguration, baseOptions }),
    delete: (path, routeConfiguration) =>
      makeRequest('delete', path, { routeConfiguration, baseOptions }),
  };
}

/**
 * HttpRequest Instance
 * @param {_requestProxy.ProxyRequestConfiguration} requestConfiguration
 * @returns
 */
const HttpRequest = (requestConfiguration) => requestProxy(requestConfiguration);

const httpInstance = httpRequest({ timeout: REQUEST_TIMEOUT });

HttpRequest.initialize = httpRequest;
HttpRequest.post = httpInstance.post;
HttpRequest.get = httpInstance.get;
HttpRequest.patch = httpInstance.patch;
HttpRequest.put = httpInstance.put;
HttpRequest.delete = httpInstance.delete;
HttpRequest.utility = { FormData };

module.exports = HttpRequest;
