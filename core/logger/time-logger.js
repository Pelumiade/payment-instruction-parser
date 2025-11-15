const logger = require('./log');
/**
 *
 * @param {string} logLabel - An identifier for the log.
 * @returns {TimeLogger}
 */
function TimeLogger(logLabel) {
  const logData = { [logLabel]: { startTime: Date.now() } };

  /**
   * Calculate the duration of the operation.
   * @param {string} key A label for the operation to be measured
   */
  function calculateOpDuration(key) {
    logData[key].endTime = Date.now();
    logData[key].duration = logData[key].endTime - logData[key].startTime;
  }

  /**
   * @typedef {Object} LogConfig
   * @property {Object} additionalData
   */

  /**
   * @param {LogConfig} logConfig
   */
  function _log(additionalData = {}) {
    calculateOpDuration(logLabel);

    logger({ duration: logData, ...additionalData }, logLabel);
  }

  /**
   * Indicate the start time of an operation
   * @param {string} key A label for the operation to be measured
   */
  this.start = (key) => {
    logData[key] = { startTime: Date.now() };
  };

  /**
   * Indicate the end time of an operation and calculate its duration.
   * @param {string} key A label for the operation to be measured
   */
  this.end = (key) => {
    if (!logData[key]) {
      throw new Error(`No logData found for ${key}`);
    }

    calculateOpDuration(key);
  };

  /**
   * Get the time log
   * @returns {Object}
   */

  this.getLogData = () => {
    calculateOpDuration(logLabel);
    return logData;
  };

  /**
   * Log duration
   * @param {Object} additionalData - Any additional information to be added to the time log
   * @returns {void}
   */
  this.log = (additionalData) => _log(additionalData);

  return this;
}

module.exports = TimeLogger;
