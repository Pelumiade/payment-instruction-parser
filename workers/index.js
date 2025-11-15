const { createWorker } = require('../core/queue');
const echoLoginValidation = require('./echo-login-validation');

module.exports = {
  echoLoginValidation: createWorker(echoLoginValidation),
};
