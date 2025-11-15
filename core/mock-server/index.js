/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-restricted-syntax */
require('dotenv').config();
require('./types');
const fs = require('fs');
const path = require('path');
const { createServer } = require('@app-core/server');
const simulateRequest = require('./simulate-request');
const getProjectRoot = require('./get-project-root');

const projectRoot = getProjectRoot();

/**
 * Resolve the endpoint file paths and attach the handler information to the server instance
 * @param {AppServerInstance} server - The server instance.
 * @param {string[]} endpointFilePaths - A list of file paths, defined from the project's root directory, where the route handlers are defined.
 * @param {Object} [options] - Server configurations
 * @throws
 */
function addHandlers(server, filePaths = [], options = {}) {
  for (const filePath of filePaths) {
    const resolvedPath = path.resolve(projectRoot, filePath);

    const fileStats = fs.statSync(resolvedPath);

    if (fileStats.isDirectory()) {
      const dirFilePaths = fs.readdirSync(resolvedPath);

      addHandlers(
        server,
        dirFilePaths.map((file) => `${resolvedPath}/${file}`),
        options
      );
    } else if (fileStats.isFile()) {
      let handler = require(resolvedPath);

      if (options.pathPrefix) {
        handler = { ...handler, path: `${options.pathPrefix}${handler.path}` };
      }

      server.addHandler(handler);
    } else {
      throw new Error(`Invalid file path: ${resolvedPath}`);
    }
  }
}

/**
 * Create a mock server instance.
 * @param {string[]} endpointFilePaths - A list of file paths, defined from the project's root directory, where the route handlers are defined.
 * @param {Object} [options] - Server configurations
 * @returns {MockedServerInstance}
 */
function createMockServer(endpointFilePaths = [], options = {}) {
  const server = createServer();

  if (endpointFilePaths.length) {
    addHandlers(server, endpointFilePaths, options);
  }

  return {
    post: (endpoint, requestConfig) =>
      simulateRequest(server, { method: 'POST', path: endpoint, requestConfig }),
    get: (endpoint, requestConfig) =>
      simulateRequest(server, { method: 'GET', path: endpoint, requestConfig }),
    put: (endpoint, requestConfig) =>
      simulateRequest(server, { method: 'PUT', path: endpoint, requestConfig }),
    patch: (endpoint, requestConfig) =>
      simulateRequest(server, { method: 'PATCH', path: endpoint, requestConfig }),
    delete: (endpoint, requestConfig) =>
      simulateRequest(server, { method: 'DELETE', path: endpoint, requestConfig }),
  };
}

module.exports = createMockServer;
