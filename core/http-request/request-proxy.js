const appValidator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { TimeLogger, appLogger } = require('@app-core/logger');
const { LOG_TYPE } = require('@app-core/logger/constants');
const { makeAxiosRequest } = require('./request-client');

const spec = `root {
 method string
 url string
 data? object
 headers? object
 timeout? number
 responseType? string
 maxContentLength? number
}`;

const parsedSpec = appValidator.parse(spec);

/**
 * @typedef {Object} RequestProxyResponse
 * @property {number} statusCode - The HTTP status code from the server response.
 * @property {object} headers - The HTTP headers that the server responded with.
 * @property {any} data - The response that was provided by the server.
 */

/**
 * A request configuration object.
 * @typedef {Object} ProxyRequestConfiguration
 * @property {HTTPRequestMethod} method - The http request method.
 * @property {string} url - The full request url.
 * @property {object} data - The request payload.
 * @property {object} headers - The request headers to be sent.
 * @property {number} timeout - The number of milliseconds before the request times out.
 * @property {string} responseType - The type of data that the server will respond.
 * @property {number} maxContentLength - The max size of the http response content in bytes.
 * @property {string} logLabel - An identifier for logging errors.
 * @property {import('@app-core/logger/log').LogOptions} logOptions - Log configurations.
 * @property {boolean} enableVerboseLogging - Specifies if extra information should be added to the logs.
 * @property {Object} responseShapeSpec - A parsed specification to validate the response data.
 */

/**
 * A proxy to third-party libraries for making HTTP requests
 * @callback RequestProxy
 * @async
 * @param {ProxyRequestConfiguration} requestConfiguration
 * @returns {Promise<RequestProxyResponse>}
 * @throws
 */

async function requestProxy(requestConfiguration = {}) {
  const params = appValidator.validate(requestConfiguration, parsedSpec);

  const logLabel = requestConfiguration.logLabel || 'REQ-PROXY';
  const timeLogger = TimeLogger(`${logLabel}-DURATION`);

  const logData = {};

  if (requestConfiguration.enableVerboseLogging) {
    logData.request = {
      requestUrl: params.url,
      requestMethod: params.method,
      requestPayload: params.data,
      requestHeaders: params.headers,
    };
  }

  try {
    const clientResponse = await makeAxiosRequest(params);

    const response = {
      statusCode: clientResponse.status,
      headers: clientResponse.headers || {},
      data: clientResponse.data,
    };

    /* since the log should contain the actual http response,
     * the spread operator is used here to ensure
     * spec validation does not change the data object
     */
    logData.response = { ...response };

    if (requestConfiguration.responseShapeSpec) {
      response.data = appValidator.validate(response.data, requestConfiguration.responseShapeSpec);
    }

    return response;
  } catch (error) {
    // log the actual error.
    const errorLog = {
      errorMessage: error.message,
      errorCode: error.code || error.errorCode,
      errorStack: error.stack,
      errorType: error.name,
      requestStatus: error.status,
    };

    if (error.response) {
      errorLog.response = {
        statusCode: error.response.status,
        data: error.response.data,
      };
    }

    logData.error = errorLog;

    throwAppError(error.message, ERROR_CODE.HTTPREQERR, { context: errorLog });
  } finally {
    const logType = logData.error ? LOG_TYPE.ERROR : LOG_TYPE.INFO;
    appLogger[logType](logData, logLabel, requestConfiguration.logOptions);

    timeLogger.log();
  }
}

module.exports = requestProxy;
