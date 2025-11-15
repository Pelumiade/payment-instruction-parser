/* eslint-disable no-param-reassign */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../../rule-validators');
const { NodeTypes, DataTypeVariants } = require('../../constants');
const { checkSubTypeSpec, createNode } = require('../helpers');

module.exports = function (regexInfo, closureNode) {
  /* ensure that 'of' keyword is not used without
   *  specifying a subtype
   */
  checkSubTypeSpec(regexInfo);

  const node = createNode(regexInfo.nodeType, regexInfo.matchMap.identifierName);

  if (closureNode) {
    let actualParentNode = closureNode;

    /*
     * If the closureNode is not an identifier then it cannot be a parent
     * hence the actual parent node of the node under inspection will be the
     * parent of the closureNode.
     */
    if (closureNode.type !== NodeTypes.IDENTIFIER) {
      actualParentNode = closureNode.parent;

      /*
       * only identifiers are allowed to host other types
       * hence the parent of other node types must be an identifier
       */
      if (actualParentNode?.type !== NodeTypes.IDENTIFIER) {
        throwAppError('could not find enclosing identifier', ERROR_CODE.APPERR);
      }
    }

    /*
     * nodes with types other than array and objects cannot have children
     * if a node type is not defined, we assume object
     */
    const parentDatatype = actualParentNode.rules[NodeTypes.IDENTIFIER_TYPE]?.conditionValue;
    if (!parentDatatype) {
      actualParentNode.addRule(
        NodeTypes.IDENTIFIER_TYPE,
        'object',
        RuleValidator[NodeTypes.IDENTIFIER_TYPE]
      );
    } else if (!DataTypeVariants.NON_PRIMITIVES.includes(parentDatatype)) {
      throwAppError(
        `${actualParentNode.identifier} is a ${parentDatatype} and cannot have child nodes`,
        ERROR_CODE.APPERR
      );
    }

    /* if a subtype has been specified in the array definition line
     * then the array configure should not have identifiers because
     * that connotes array of objects.
     */
    const subtypeRule = actualParentNode.rules[NodeTypes.IDENTIFIER_SUBTYPE];
    if (subtypeRule) {
      throwAppError(
        `Cannot set ${regexInfo.matchMap.identifierName || 'node'} as child of ${
          actualParentNode.identifier
        }. The array already has a subtype of ${subtypeRule.value}.`,
        ERROR_CODE.APPERR
      );
    }

    actualParentNode.children.push(node);
  }

  /*
   *capture parent property only if current node expects children
   * so that on closure of the current node, we can access the encapsulating node
   */
  if (regexInfo.expectChildren) {
    node.children = [];
    node.parent = closureNode;
    closureNode = node;
  }

  if (regexInfo.isRequired) {
    node.addRule(NodeTypes.REQUIRED, true, RuleValidator[NodeTypes.REQUIRED]);
  }

  if (regexInfo.matchMap.identifierType) {
    node.addRule(
      NodeTypes.IDENTIFIER_TYPE,
      regexInfo.matchMap.identifierType,
      RuleValidator[NodeTypes.IDENTIFIER_TYPE]
    );
  }

  if (
    String(regexInfo.matchMap.identifierSubType) !== 'undefined' &&
    !DataTypeVariants.OBJECT.includes[regexInfo.matchMap.identifierSubType]
  ) {
    node.addRule(
      NodeTypes.IDENTIFIER_SUBTYPE,
      regexInfo.matchMap.identifierSubType,
      RuleValidator[NodeTypes.IDENTIFIER_SUBTYPE]
    );
  }

  return closureNode;
};
