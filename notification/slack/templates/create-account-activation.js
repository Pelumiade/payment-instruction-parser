function createTemplate({ subject, payload } = {}) {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: subject || 'New Message',
          emoji: true,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hi ${payload.name},\n\nPlease use the OTP below to complete your registration.`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${String(payload.otp).replace(/\B/g, ' ')}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Sincerely,\n\n*The ${payload.app_name} Team*`,
        },
      },
      {
        type: 'divider',
      },
    ],
  };
}

module.exports = createTemplate;
