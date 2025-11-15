/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes, DataTypeVariants } = require('../../constants');
const { checkSubTypeSpec, createNode } = require('../helpers');

module.exports = function (regexInfo, closureNode) {
  if (closureNode?.type !== NodeTypes.IDENTIFIER) {
    throwAppError('identify type rule must belong to an identifier', ERROR_CODE.APPERR);
  }

  /* ensure that 'of' keyword is not used without
   *  specifying a subtype
   */
  checkSubTypeSpec(regexInfo);

  const existingDatatype = closureNode.rules[NodeTypes.IDENTIFIER_TYPE];

  if (existingDatatype) {
    throwAppError(
      `${closureNode.identifier} already has datatype (${existingDatatype.conditionValue}) defined`,
      ERROR_CODE.APPERR
    );
  }

  closureNode.addRule(
    NodeTypes.IDENTIFIER_TYPE,
    regexInfo.matchMap.identifierType,
    RuleValidator[NodeTypes.IDENTIFIER_TYPE]
  );

  if (regexInfo.isRequired) {
    closureNode.addRule(NodeTypes.REQUIRED, true, RuleValidator[NodeTypes.REQUIRED]);
  }

  /*
   * exempt setting object as an array subtype rule since the properties
   * will be added as children of the current node.
   */
  if (
    regexInfo.matchMap.identifierSubType &&
    !DataTypeVariants.OBJECT.includes[regexInfo.matchMap.identifierSubType]
  ) {
    closureNode.addRule(
      NodeTypes.IDENTIFIER_SUBTYPE,
      regexInfo.matchMap.identifierSubType,
      RuleValidator[NodeTypes.IDENTIFIER_SUBTYPE]
    );
  }

  if (regexInfo.expectChildren) {
    const node = createNode(regexInfo.nodeType, regexInfo.matchMap.identifierName);
    node.parent = closureNode;
    closureNode = node;
  }

  return closureNode;
};
