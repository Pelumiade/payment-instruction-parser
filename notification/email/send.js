const validator = require('@app-core/validator');
const notifier = require('@app-core/notifier');
const redactFactory = require('@app-core/security/redact');
const Notification = require('@app/repository/notification');
const getTemplate = require('./get-template');
const NotifConstants = require('../helpers/constants');
const sendSlackMessage = require('../slack/send');

const RESEND_DURATION_MILLIS = (Number(process.env.EMAIL_NOTIF_INTERVAL_MINS) || 5) * 60000;
const FALLBACK_SLACK_WEBHOOK = process.env.EMAIL_FALLBACK_SLACK_WEBHOOK;

const scrubber = redactFactory({ fieldsToRedact: ['confirmationlink'] });

const sendNotificationSpec = `root {
  template is a required string
  recipient is a required email
  payload is a required object
  userId is a string
  context is a string
  subject is a string
  resendDelayMillis is an integer
  meta is an object
  existingNotification is an object
  ignoreSlackFallback is a boolean
  logKey is a string
}`;
const parsedSpec = validator.parse(sendNotificationSpec);

async function sendNotification(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);
  data.context = data.context || 'generic';
  data.logKey = data.logKey || data.recipient;
  data.type = NotifConstants.NOTIFICATION_TYPE.EMAIL;

  const emailTemplate = getTemplate(data.template, data.payload);

  notifier.sendEmail({
    template: emailTemplate,
    recipient: data.recipient,
    subject: data.subject,
    logKey: data.logKey,
  });

  if (!data.ignoreSlackFallback && FALLBACK_SLACK_WEBHOOK) {
    sendSlackMessage({ ...data, webhookUrl: FALLBACK_SLACK_WEBHOOK });
  }

  let notification;
  data.resendDelayMillis = data.resendDelayMillis || RESEND_DURATION_MILLIS;
  data.nextResendTimestamp = Date.now() + data.resendDelayMillis;

  // prevents storage of sensitive data on the database
  data.payload = scrubber(data.payload);

  if (data.existingNotification) {
    data.existingNotification.resendDelayMillis = data.resendDelayMillis;
    data.existingNotification.nextResendTimestamp = data.nextResendTimestamp;
    notification = data.existingNotification;

    await Notification.updateOne({
      query: {
        _id: `${notification._id}`,
      },
      updateValues: {
        resendDelayMillis: data.resendDelayMillis,
        nextResendTimestamp: data.nextResendTimestamp,
        payload: data.payload,
      },
    });
  } else {
    notification = await Notification.create(data);
  }

  return notification;
}
module.exports = sendNotification;
