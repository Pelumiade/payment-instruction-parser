const { parse } = require('@app-core/handlebars');
const { TEMPLATES } = require('../../helpers/constants');
const accountActivationTemplate = parse(require('./account-activation'));

module.exports = {
  [TEMPLATES.ACCOUNT_ACTIVATION]: accountActivationTemplate,
};
