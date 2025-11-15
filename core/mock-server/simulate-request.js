const createHttpObjects = require('./create-http-objects');

/**
 * Simulate a http request using the server instance.
 * @param {AppServerInstance} server - The server instance.
 * @param {SimulateRequestConfiguration} requestConfiguration
 * @returns {Promise<MockedResponseData>}
 */
const simulateRequest = (server, { method, path, requestConfig = {} } = {}) =>
  new Promise((resolve, reject) => {
    try {
      const _requestConfig = { ...requestConfig };
      _requestConfig.url = path || '/';
      _requestConfig.method = method || 'GET';
      _requestConfig.headers = requestConfig.headers || {};
      _requestConfig.headers['x-client-ip'] = requestConfig.IP || '127.0.0.1';

      if (!_requestConfig.headers.authorization && process.env.MOCK_AUTHORIZATION_HEADER) {
        _requestConfig.headers.authorization = `Bearer ${process.env.MOCK_AUTHORIZATION_HEADER}`;
      }

      const { mockedRequest, mockedResponse } = createHttpObjects(
        _requestConfig,
        (err, response) => {
          if (err) {
            reject(err);
          } else {
            resolve(response);
          }
        }
      );

      server.executeRequest(mockedRequest, mockedResponse, () => {
        reject(new Error(`Cannot ${_requestConfig.method} ${_requestConfig.url}`));
      });
    } catch (err) {
      reject(err);
    }
  });

module.exports = simulateRequest;
