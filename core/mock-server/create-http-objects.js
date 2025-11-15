const httpMocker = require('node-mocks-http');
const eventEmitter = require('events').EventEmitter;

/**
 *
 * @param {MockRequestConfiguration} requestConfig
 * @param {MockedResponseCallback} callback
 * @returns {MockedHTTPObjects}
 */
module.exports = (requestConfig, callback) => {
  const { req: mockedRequest, res: mockedResponse } = httpMocker.createMocks(requestConfig, {
    eventEmitter,
  });

  mockedResponse.on('end', () => {
    const responseData = { responseObject: mockedResponse, statusCode: mockedResponse.statusCode };

    try {
      responseData.data = mockedResponse._getJSONData();

      callback(null, responseData);
    } catch (error) {
      callback(error);
    }
  });

  mockedResponse.on('error', (error) => callback(error));

  return { mockedRequest, mockedResponse };
};
