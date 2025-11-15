const validator = require('@app-core/validator');
const sendViaProvider = require('./email-provider');

const sendEmailSpec = `root {
  template is a required string
  recipient is a required email
  subject is a string
  attachments is an array of{
    fileUrl is a required string{
      set in final object as: path
    }
    filename is a required string
  }
  logKey is a string
}`;
const parsedSpec = validator.parse(sendEmailSpec);

/**
 * @typedef {Object} ServiceData
 * @property {String} template
 * @property {String} recipient
 * @property {String} [subject]
 * @property {{path:String, filename:String}[]} [attachments]
 */
/**
 * Send an email
 * @param {ServiceData} serviceData
 */
function sendEmail(serviceData) {
  /** @type {ServiceData} */
  const data = validator.validate(serviceData, parsedSpec);

  sendViaProvider({
    recipient: data.recipient,
    subject: data.subject || 'EMAIL',
    emailContent: data.template,
    attachments: data.attachments,
    logKey: data.logKey,
  });
}

module.exports = sendEmail;
