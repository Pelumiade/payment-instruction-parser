const mongoose = require('mongoose');
/**
 * Mongoose Connection Config
 * @typedef {Object} MongooseConnectionConfig
 * @property {string} uri - The mongodb connection string
 * @property {boolean} isNotDefault=false - Whether or not to create the connection as the default mongoose one or not. Defaults to false
 */

/**
 * Mongoose Connection Result
 * @typedef {Object} MongooseConnectionResult
 * @property {import("mongoose").Connection} connection
 */

/**
 *
 * @param {MongooseConnectionConfig} connectionConfig
 * @returns {Promise<MongooseConnectionResult>}
 */
async function createConnection(connectionConfig) {
  const connectionResult = {};
  const { uri = process.env.MONGODB_URI, isNotDefault } = connectionConfig;
  if (uri) {
    const connectionOptions = {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };
    try {
      let connection;
      if (isNotDefault) {
        connection = await mongoose.createConnection(uri, connectionOptions);
      } else {
        ({ connection } = await mongoose.connect(uri, connectionOptions));
      }
      connectionResult.connection = connection;
    } catch (e) {
      // Todo: Proper handler?
      throw new Error(e.message);
    }
  }
  return connectionResult;
}
module.exports = createConnection;
