const pino = require('pino');

const customLevels = {
  debug: 10,
  log: 20,
  info: 30,
  warn: 40,
  error: 50,
};

const pinoConfig = {
  level: process.env.PINO_LOG_LEVEL || 'log',
  customLevels,
  useOnlyCustomLevels: true,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  messageKey: 'label',
  nestedKey: 'data',
};

if (process.env.ENABLE_BASELIME) {
  delete pinoConfig.nestedKey;

  pinoConfig.transport = {
    target: '@baselime/pino-transport',
    options: {
      baselimeApiKey: process.env.BASELIME_KEY,
      service: process.env.BASELIME_SERVICENAME,
      namespace: process.env.BASELIME_NAMESPACE,
    },
  };
}

module.exports = pino(pinoConfig);
