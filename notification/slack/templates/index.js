const { TEMPLATES } = require('../../helpers/constants');

const createAccountActivationTemplate = require('./create-account-activation');

module.exports = {
  [TEMPLATES.ACCOUNT_ACTIVATION]: createAccountActivationTemplate,
};
