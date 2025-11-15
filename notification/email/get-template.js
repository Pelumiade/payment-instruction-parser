const { throwAppError } = require('@app-core/errors');
const { render } = require('@app-core/handlebars');
const templates = require('./templates');

function getTemplate(templateName, payloadData) {
  const _payloadData = { ...payloadData };

  _payloadData.year = new Date().getFullYear();
  _payloadData.app_name = process.env.app_name.toUpperCase();
  _payloadData.customer_support_link = process.env.CUSTOMER_SUPPORT_LINK;

  const templateToUse = templates[templateName];

  if (!templateToUse) {
    throwAppError(`Invalid template name passed`, 'INVLTMPL');
  }

  return render(templateToUse, _payloadData);
}

module.exports = getTemplate;
