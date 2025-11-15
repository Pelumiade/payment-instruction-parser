const { NodeTypes } = require('../../constants');
const identifier = require('./identifier');
const errorMessage = require('./error-message');
const identifierType = require('./identifier-type');
const identifierAttribute = require('./identifier-attribute');
const between = require('./between');
const required = require('./required');

module.exports = {
  [NodeTypes.IDENTIFIER]: identifier,
  [NodeTypes.ERROR_MESSAGE]: errorMessage,
  [NodeTypes.IDENTIFIER_TYPE]: identifierType,
  [NodeTypes.BETWEEN]: between,
  [NodeTypes.REQUIRED]: required,
  [NodeTypes.IDENTIFIER_ATTRIBUTE]: identifierAttribute,
};
