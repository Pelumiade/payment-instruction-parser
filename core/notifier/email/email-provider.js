const { Resend } = require('resend');
const { appLogger } = require('@app-core/logger');

const resend = process.env.RESEND_TOKEN ? new Resend(process.env.RESEND_TOKEN) : null;

function emailProvider({ recipient, subject, emailContent, attachments, logKey } = {}) {
  if (!resend || (!process.env.ALLOW_ALL_EMAILS && !`${recipient}`.includes('@resilience17.com'))) {
    return true;
  }

  resend.emails
    .send({
      from: process.env.RESEND_SENDER_ADDRESS || 'noreply@finbuildr.com',
      to: recipient,
      subject,
      html: emailContent,
      attachments,
    })
    .then((response) => {
      if (response?.error) throw response.error;

      appLogger.info(response, `EMAIL-PROVIDER-${logKey}`);
    })
    .catch((err) => {
      appLogger.errorX(err, `EMAIL-PROVIDER-${logKey}`);
    });
}

module.exports = emailProvider;
