// @ts-check
/**
 * Object containing information about the request
 * @typedef {Object} RequestProperties
 * @property {string} IP - IP address of the client making a request to the server.
 * @property {string} baseURL - Base URL of the request endpoint.
 * @property {string} method - Request method.
 * @property {string} requestURL - Endpoint URL called (including the query string).
 * @property {string} requestURLWithoutQueryStrings - Endpoint URL called without the query string.
 * @property {string} hostname - The hostname of the request.
 * @property {string} useragent - The useragent of the request
 * @property {string} handlerPath - The endpoint path as defined in the constructor of the handler.
 */

/**
 * Object representing the components of a request.
 * @typedef {Object} RequestComponents
 * @property {Object} body - Object representing the body of the request.
 * @property {Object} query - Object representing the parsed query string of the request.
 * @property {Object} headers - Object representing the request header.
 * @property {Object} params - Object representing any parsed params in the request URL.
 * @property {Object} meta - Object that can be used by the handler to add extra data about the request or to pass them on through the middleware chain.
 * @property {Object} props - Object containing custom properties from the handler.
 * @property {RequestProperties} properties - Object containing information about the request.
 */

/**
 * Object representing the components of a response.
 * @typedef {Object} ResponseBody
 * @property {String} status - Status of the response
 * @property {String} message - Response message
 * @property {Object} data - The response data
 * @property {Object} errors[] - An array of array response fields
 */

/**
 * Object representing the components of a response.
 * @typedef {Object} ResponseComponents
 * @property {ResponseBody} body - Object representing the body of the response.
 * @property {String} statusCode - HTTP Status code returned for the response.
 */

/**
 * Object containing helper functions for handlers.
 * @typedef {Object} HandlerHelpers
 * @property {import('./enums').HTTPStatusCodes} http_statuses - Object representing a map of possible HTTP status codes to return.
 */

/**
 * Object representing the result of a handler function.
 * @typedef {Object} HandlerExecutionContext
 * @property {boolean} [endHandlerChain=false] - Boolean value that defaults to false. If set to true and there are still items in the handler chain, the execution will not proceed to execute other handlers.
 * @property {boolean} [shouldSkipNextMiddleware=false] - Boolean value that defaults to false and indicates whether or not the next middleware handler in the handler chain should be executed or not.
 * @property {boolean} [shouldSkipOtherMiddlewares=false] - Boolean value that defaults to false and is similar in function to the endHandlerChain property in that if set to true, it ensures no other middlewarehandler in the handler chain is executed.
 * @property {RequestAuguments} [augments] - Object that contains sub objects defining how certain request components can be augmented or modified with new data as execution progresses down the handler chain.
 * @property {HandlerResult} [result] -  Object representing the result of a handler function.
 */

/**
 * Object that contains sub objects defining how certain request components can be augmented or modified with new data as execution progresses down the handler chain.
 * @typedef {Object} RequestAuguments
 * @property {Object} [query] - Object containing data that can be used to augment the content of the actual request query.
 * @property {Object} [body] - Object containing data that can be used to augment the content of the actual request body.
 * @property {Object} [headers] - Object containing data that can be used to augment the content of the actual request headers.
 * @property {Object} [params] - Object containing data that can be used to augment the content of the actual request params.
 * @property {Object} [meta] - Object containing data that can be used to augment the content of the actual request meta.
 */

/**
 * Object representing the result of a handler function.
 * @typedef {Object} HandlerResult
 * @property {import('./enums').HTTPStatusCode} status - HTTP Status code.
 * @property {*} [data] - Actual data to be returned as the response to the endpoint request.
 * @property {boolean} [endHandlerChain=false] - Boolean value that defaults to false. If set to true and there are still items in the handler chain, the execution will not proceed to execute other handlers.
 * @property {boolean} [skipNextMiddlewareHandler=false] - Boolean value that defaults to false and indicates whether or not the next middleware handler in the handler chain should be executed or not.
 * @property {boolean} [skipOtherMiddlewareHandlers=false] - Boolean value that defaults to false and is similar in function to the endHandlerChain property in that if set to true, it ensures no other middlewarehandler in the handler chain is executed.
 * @property {RequestAuguments} [augments] - Object that contains sub objects defining how certain request components can be augmented or modified with new data as execution progresses down the handler chain.
 */

/**
 * Function to handle requests in an Express handler.
 * @callback HandlerFunction
 * @param {RequestComponents} requestComponents - Components of the request.
 * @param {HandlerHelpers} helpers - Helper functions for handlers.
 * @returns {Promise<HandlerResult>} - Result of the handler function.
 */

/**
 * Function to handle the end of a response in an Express handler. It is called after the response has been sent..
 * @callback ResponseEndEventFunction
 * @param {RequestComponents} requestComponents - Components of the request.
 * @param {ResponseComponents} responseComponents - Components of the response.
 */

/**
 * Configuration object for an Express handler.
 * @typedef {Object} HandlerConfiguration
 * @property {import('./enums').ExpressHandlerMethod} [method="get"] - Optional method of the request. Defaults to get and can be one of get|put|delete|patch|post|update|middleware.
 * @property {string} [path="/"] - The request or endpoint path. It's optional and defaults to the root
 * @property {HandlerConfiguration[]} [middlewares] - Optional array of middlewares where each middleware is itself a handleConfiguration.
 * @property {Object} [props] - Optional custom properties of a handler.
 * @property {HandlerFunction} handler - Required function that defines the handler logic with two arguments requestComponents and helpers.
 * @property {ResponseEndEventFunction} [onResponseEnd] - Optional event callback for post-processing ops required when there's a need to capture the request and response sent.
 */

/**
 * Function to create an Express handler.
 * @param {HandlerConfiguration} handlerConfiguration={} - Configuration for the handler.
 * @returns {HandlerConfiguration} - ExpressHandlerConfig type.
 */
function createExpressHandler(handlerConfiguration) {
  return {
    path: handlerConfiguration.path,
    method: handlerConfiguration.method,
    middlewares: handlerConfiguration.middlewares,
    props: handlerConfiguration.props,
    handler: handlerConfiguration.handler,
    onResponseEnd: handlerConfiguration.onResponseEnd,
  };
}
module.exports = createExpressHandler;
