/**
 * @typedef {Object} MockedResponseData
 * @property {import('node-mocks-http').MockResponse} responseObject - The mocked response object.
 * @property {Number} statusCode - The response status code.
 * @property {Object} data - The response payload.
 */

/**
 * This callback is invoked after the request is processed and a response sent.
 * @callback MockedResponseCallback
 * @param {Error} error - The error object if an error occurred.
 * @param {MockedResponseData} response - The response data.
 */

/**
 * @typedef {Object} MockedHTTPObjects
 * @property {import('node-mocks-http').MockRequest} mockedRequest - The mocked request object.
 * @property {import('node-mocks-http').MockResponse} mockedResponse - The mocked response object.
 */

/**
 * Object representing the components of a request configuration.
 * @typedef {Object} MockRequestConfiguration
 * @property {Object} body - Object representing the body of the request.
 * @property {Object} query - Object representing the parsed query string of the request.
 * @property {Object} headers - Object representing the request header.
 * @property {Object} params - Object representing any parsed params in the request URL.
 */

/**
 * Http Request Methods
 * @typedef {"post"|"get"|"patch"|"put"|"delete"} HTTPMethods
 */

/**
 * Configuration object to create a mocked request object.
 * @typedef {Object} SimulateRequestConfiguration
 * @property {HTTPMethods} method - The HTTP request method.
 * @property {string} path - The request endpoint. The endlpoint should be prefixed with '/'.
 * @property {MockRequestConfiguration} requestConfig
 */

/**
 * @callback ExecuteRequest
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 * @param {import("express").NextFunction} nextFunction
 * @returns {void}
 */

/**
 * @callback AddHandler
 * @param {import('@app-core/server/create-handler').HandlerConfiguration} handlerConfiguration
 * @returns {void}
 */

/**
 * The app server instance.
 * @typedef {Object} AppServerInstance
 * @property {AddHandler} addHandler
 * @property {ExecuteRequest} executeRequest
 */

/**
 * @callback MockedHttpMethodFunction
 * @param {string} path - The request endpoint. The endlpoint should be prefixed with '/'.
 * @param {MockRequestConfiguration} requestConfig
 * @returns {Promise<MockedResponseData>}
 */

/**
 * The wrapped server instance used to mock http requests
 * @typedef MockedServerInstance
 * @property {MockedHttpMethodFunction} post
 * @property {MockedHttpMethodFunction} get
 * @property {MockedHttpMethodFunction} put
 * @property {MockedHttpMethodFunction} patch
 * @property {MockedHttpMethodFunction} delete
 */
