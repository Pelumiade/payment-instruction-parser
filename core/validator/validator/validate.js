/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const RuleValidator = require('../rule-validators');

function validate(data, rootNode, opts) {
  const validatedObject = {};

  try {
    for (const node of rootNode.children) {
      if (
        !node.rules?.required &&
        (data[node.identifier] === null || data[node.identifier] === undefined)
      ) {
        continue;
      }

      // Check rules
      Object.keys(node.rules).forEach((key) => {
        const rule = node.rules[key];
        try {
          const validationFn = rule.validationFn || RuleValidator[key];
          validationFn(data, node.identifier, rule.conditionValue);
        } catch (err) {
          if (err.isValidationError) {
            err.nodeMessage = rule.errorMessage || node.errorMessage;
            err.labelHierarchy.push(node.attributes?.label || node.identifier);
          }

          throw err;
        }
      });

      let nodeData = data[node.identifier];

      if (node.children?.length) {
        try {
          if (Array.isArray(nodeData)) {
            nodeData = nodeData.map((el) => validate(el, node));
          } else {
            nodeData = validate(nodeData, node);
          }
        } catch (err) {
          if (err.isValidationError) {
            err.labelHierarchy.push(node.attributes?.label || node.identifier);

            if (!err.nodeMessage) {
              err.nodeMessage = node.errorMessage;
            }
          }

          throw err;
        }
      }

      validatedObject[node.attributes?.alias || node.identifier] = nodeData;
    }

    return validatedObject;
  } catch (err) {
    if (err.isValidationError && rootNode.isRoot) {
      let label = err.labelHierarchy[0];

      if (!opts.disableLabelChain) {
        label = err.labelHierarchy.pop();

        while (err.labelHierarchy.length) {
          label += `.${err.labelHierarchy.pop()}`;
        }
      }

      throwAppError(
        String(err.nodeMessage || err.validationMessage).replace('$label', label),
        ERROR_CODE.VALIDATIONERR
      );
    }

    throw err;
  }
}

module.exports = validate;
