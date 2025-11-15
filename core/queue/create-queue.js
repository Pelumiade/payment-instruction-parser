const Bull = require('bull');
const config = require('./config');

/**
 * Bull Connection Config
 * @typedef {Object} BullConnectionConfig
 * @property {string} [queueName] - The name of the queue
 * @property {string} [redisUrl] - The redis connection string
 */

/**
 * Bull Connection Result
 * @typedef {Object} BullConnectionResult
 * @property {import("bull").Queue} queue
 */

/**
 *
 * @param {BullConnectionConfig} connectionConfig
 * @returns {Promise<BullConnectionResult>}
 */
const createdQueues = new Map();
function createQueue(connectionConfig = config) {
  const { queueName, url } = connectionConfig;
  if (createdQueues.has(queueName)) {
    return createdQueues.get(queueName);
  }
  if (queueName && url) {
    const newQueue = new Bull(queueName, url);
    createdQueues.set(queueName, newQueue);
    return newQueue;
  }
}

module.exports = createQueue;
