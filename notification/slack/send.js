const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
const httpRequest = require('@app-core/http-request');
const template = require('./templates');

const sendEmailSpec = `root {
  template is a required string
  webhookUrl is a required uri
  payload is a required object
  subject is a string
  logKey is a string
}`;
const parsedSpec = validator.parse(sendEmailSpec);

async function sendSlackMessage(serviceData) {
  try {
    const data = validator.validate(serviceData, parsedSpec);

    data.payload.app_name = process.env.APP_NAME.toUpperCase();
    const payload = template[data.template]?.(data);

    if (payload) {
      const response = await httpRequest.post(data.webhookUrl, payload);

      appLogger.info(response.data, `SEND-SLACK-MESSAGE-${data.logKey || 'DATA'}`);
    }
  } catch (err) {
    appLogger.errorX(err, `SEND-SLACK-MESSAGE-ERROR-${serviceData?.logKey || 'DATA'}`);
  }
}

module.exports = sendSlackMessage;
