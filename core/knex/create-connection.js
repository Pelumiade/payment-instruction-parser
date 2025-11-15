// @ts-check
const Knex = require('knex');
require('dotenv').config();

/**
 * @typedef {Object} mad
 */
/**
 * Knex Models
 * @typedef {Record<string, import('knex').Knex>} KnexModels
 */

/**
 * Knex connection object
 * @typedef {Object} KnexConnection
 * @property {import('knex').Knex} knex - The knex connection instance
 * @property {boolean} isConnected - Indicates succesfull connection
 * @property {KnexModels} models - Models
 */

/**
 * Knex Connection Config (MySQL)
 * @typedef {Object} KnexConnectionConfig
 * @property {string} [host] - The DB host - defaults to the env variable DBHOST or localhost
 * @property {number} [port] - The DB Port - Defaults to the env variable DBPORT or 3306
 * @property {string} [user] - The DB user - Defaults to the env variable DBUSER or root
 * @property {string} [password] - The DB password - Defaults to the env variable DBPW or abcd12345
 * @property {string} [database] - The Database to connect to - Defaults to the env variable DBNAME or appdb
 * @property {string[]} [tablenames] - Names of tables to create a knex proxy for
 */

/**
 *
 * @param {KnexConnectionConfig} knexConnectionConfig
 * @returns {Promise<KnexConnection>}
 */
function createKnexConnection(knexConnectionConfig) {
  const { DBHOST, DBPORT, DBUSER, DBPW, DBNAME } = process.env;

  const knexInstance = new Promise((resolve, _reject) => {
    const {
      host = DBHOST || '127.0.0.1',
      port = (DBPORT && parseInt(DBPORT, 10)) || 330612,
      user = DBUSER || 'root',
      password = DBPW || 'abcd12345',
      database = DBNAME || 'appdb',
      tablenames = [],
    } = knexConnectionConfig;
    console.log(host, port, user, password, database);
    try {
      const knexConnection = Knex({
        client: 'mysql2',
        connection: {
          host,
          port,
          user,
          password,
          database,
        },
        useNullAsDefault: true,
        pool: {},
      });

      knexConnection
        .raw('SELECT 1+1 as connectionTestResult')
        .then(() => {
          const resolveObject = {
            knex: knexConnection,
            isConnected: true,
            models: {},
          };
          if (tablenames.length) {
            resolveObject.models = {};
            tablenames.forEach((tablename) => {
              resolveObject.models[tablename] = knexConnection(tablename);
            });
          }
          resolve(resolveObject);
        })
        .catch((connectionTestError) => {
          _reject(connectionTestError);
        });
    } catch (e) {
      _reject(e);
    }
  });
  return knexInstance;
}

module.exports = createKnexConnection;
