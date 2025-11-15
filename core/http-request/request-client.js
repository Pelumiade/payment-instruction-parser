const axios = require('axios');

let requestClient;

if (parseInt(process.env.ALLOW_MOCKED_HTTP_PROXY, 10)) {
  // eslint-disable-next-line global-require
  requestClient = require('@app-core/mock-http-request-proxy/mocked-client');
} else {
  requestClient = axios;
}
/*
 * This file defines third party libraries/dependencies needed by the application
 * to make http requests
 */

/**
 * @typedef {"post"|"get"|"put"|"patch"|"delete"} HTTPRequestMethod
 */

/**
 * A request configuration object.
 * @typedef {Object} RequestConfiguration
 * @property {HTTPRequestMethod} method - The http request method.
 * @property {string} url - The full request url.
 * @property {object} data - The request payload.
 * @property {object} headers - The request headers to be sent.
 * @property {number} timeout - The number of milliseconds before the request times out.
 * @property {string} responseType - The type of data that the server will respond.
 * @property {number} maxContentLength - The max size of the http response content in bytes.
 */

/**
 * Make a http request using axios library.
 * @async
 * @param {RequestConfiguration} requestConfiguration
 * @returns {Promise<import('axios').AxiosResponse>}
 */
function makeAxiosRequest(requestConfiguration) {
  return requestClient(requestConfiguration);
}

module.exports = { makeAxiosRequest };
