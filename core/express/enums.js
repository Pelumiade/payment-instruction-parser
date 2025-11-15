// @ts-check

/**
 * @typedef {200|201|204|400|401|403|500} HttpStatusCodeNumber
 */

/**
 * @typedef {Object} HTTPStatusCodes
 * @property {HttpStatusCodeNumber} HTTP_200_OK - HTTP 200 OK
 * @property {HttpStatusCodeNumber} HTTP_201_CREATED - HTTP 201 CREATED
 * @property {HttpStatusCodeNumber} HTTP_204_NO_CONTENT - HTTP 204 No Content
 * @property {HttpStatusCodeNumber} HTTP_400_BAD_REQUEST - HTTP 400 Bad request
 * @property {HttpStatusCodeNumber} HTTP_401_UNAUTHORIZED - HTTP 401 Unauthorized
 * @property {HttpStatusCodeNumber} HTTP_403_FORBIDDEN - HTTP 403 Forbidden
 */

/**
 * Enum representing HTTP status codes.
 * @readonly
 * @enum {HttpStatusCodeNumber} HTTPStatusCode
 */
const HTTPStatusCode = {
  /** HTTP 200 OK */
  /** @type HttpStatusCodeNumber */
  HTTP_200_OK: 200,
  /** HTTP 201 Created */
  /** @type HttpStatusCodeNumber */
  HTTP_201_CREATED: 201,
  /** HTTP 204 No Content */
  /** @type HttpStatusCodeNumber */
  HTTP_204_NO_CONTENT: 204,
  /** HTTP 400 Bad Request */
  /** @type HttpStatusCodeNumber */
  HTTP_400_BAD_REQUEST: 400,
  /** HTTP 401 Unauthorized */
  /** @type HttpStatusCodeNumber */
  HTTP_401_UNAUTHORIZED: 401,
  /** HTTP 403 Forbidden */
  /** @type HttpStatusCodeNumber */
  HTTP_403_FORBIDDEN: 403,
  /** HTTP 500 Server Error */
  /** @type HttpStatusCodeNumber */
  HTTP_500_SERVER_ERROR: 500,
};

/**
 * @typedef {"all"|"post"|"get"|"patch"|"put"|"delete"|"use"} ExpressHandlerMethodString
 */

/**
 * @typedef {Object} ExpressHandlerMethods
 * @property {ExpressHandlerMethodString} METHOD_ALL - Allow all HTTP request methods
 * @property {ExpressHandlerMethodString} METHOD_POST - HTTP Post requests
 * @property {ExpressHandlerMethodString} METHOD_GET - HTTP Get requests
 * @property {ExpressHandlerMethodString} METHOD_PATCH - HTTP Patch requests
 * @property {ExpressHandlerMethodString} METHOD_PUT - HTTP Put requests
 * @property {ExpressHandlerMethodString} METHOD_DELETE - HTTP Delete requests
 * @property {ExpressHandlerMethodString} METHOD_USE - Express specific app.use method
 */

/**
 * Enum representing HTTP status codes.
 * @readonly
 * @enum {ExpressHandlerMethodString} ExpressHandlerMethod
 */
const ExpressHandlerMethod = {
  /** Allow all HTTP request methods */
  /** @type ExpressHandlerMethodString */
  METHOD_ALL: 'all',
  /** HTTP Post requests */
  /** @type ExpressHandlerMethodString */
  METHOD_POST: 'post',
  /** HTTP Get requests */
  /** @type ExpressHandlerMethodString */
  METHOD_GET: 'get',
  /** HTTP Patch requests */
  /** @type ExpressHandlerMethodString */
  METHOD_PATCH: 'patch',
  /** HTTP Put requests */
  /** @type ExpressHandlerMethodString */
  METHOD_PUT: 'put',
  /** HTTP Delete requests */
  /** @type ExpressHandlerMethodString */
  METHOD_DELETE: 'delete',
  /** Express specific app.use method */
  /** @type ExpressHandlerMethodString */
  METHOD_USE: 'use',
};

module.exports = {
  HTTPStatusCode,
  ExpressHandlerMethod,
};
