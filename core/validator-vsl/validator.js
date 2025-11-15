const validatorConstraints = require('./validator-contraints');

// @todo: Make this pure, such that we are not relying on a by-ref errorTree to report messages.
// Should be composable end to end. Each call to validation error should return its own errorTree without dependence on an argument.
function validationError(message, prop, errorTree_ = {}) {
  const errorTree = errorTree_;
  errorTree[prop] = message;
  if (!errorTree.__$app_first_message) {
    errorTree.__$app_first_message = message;
  }
  if (!errorTree.__$app_no_throw) {
    throw new Error(message);
  }
}

function evaluateValueWithType(value, type) {
  let valueIsValidType = false;
  // console.log(`🐲🐲 ${value} ${type} 🐲🐲`);
  let valueType = typeof value;
  if (Array.isArray(value)) {
    valueType = 'array';
  }
  if (type === 'string' && valueType === 'string') {
    valueIsValidType = true;
  } else if (type === 'number' && valueType === 'number') {
    valueIsValidType = true;
  } else if (type === 'object' && valueType === 'object' && !Array.isArray(value)) {
    valueIsValidType = true;
  } else if (type === 'array' && Array.isArray(value)) {
    valueIsValidType = true;
  } else if (type === 'boolean' && valueType === 'boolean') {
    valueIsValidType = true;
  } else if (type === 'any') {
    valueIsValidType = true;
  }
  return {
    valueType,
    isValid: valueIsValidType,
  };
}

function processArray(func, value, possibleValues, prop, errors) {
  const result = {
    isValid: true,
    errorMessage: '',
  };
  value.forEach((v, i) => {
    func(v, possibleValues, `${prop}[${i}]`, errors);
  });
  return result;
}

function evaluatePossibleValues(value, possibleValues, prop, errors) {
  if (Array.isArray(value)) {
    return processArray(evaluatePossibleValues, value, possibleValues, prop, errors);
  }
  let isValid = true;
  let errorMessage = '';
  if (possibleValues && possibleValues.length) {
    // Todo: Maybe make possibleValues dictionary by default so owe don't have to use sets
    const pvSet = new Set(possibleValues);
    isValid = pvSet.has(value);
    if (!isValid) {
      errorMessage = `Expected ${prop}'s value: ${value} to be one of ${possibleValues.join(', ')}`;
    }
  }
  if (errorMessage) {
    validationError(errorMessage, prop, errors);
  }
  return {
    isValid,
    errorMessage,
  };
}

function evaluateConstraints(value, constraints, prop, errors) {
  const isValid = true;
  // const errorMessage = '';
  // Todo: Work in better error messaging.
  let transformedValue = value;
  const constraintKeys = Object.keys(constraints || {});
  if (constraintKeys.length) {
    let constraintValue = value;
    constraintKeys.forEach((ck) => {
      const cklc = ck.toLowerCase();
      const ckObj = constraints[ck];
      const ckFunc = validatorConstraints[cklc];
      if (ckFunc) {
        const res = ckFunc(constraintValue, ckObj.value, ckObj.isNot, prop);
        // console.log('res check function call', res, '====');
        let resultingValue = res;
        if (res.errorMessage) {
          const { isSatisfied, errorMessage, evaluatedValue } = res;
          if (!isSatisfied) validationError(errorMessage, prop, errors); // throw new Error(errorMessage);
          resultingValue = evaluatedValue;
        } else if (!res) {
          validationError(`${prop} (${value}) failed the ${ck} constraint.`, prop, errors);
        }
        transformedValue = resultingValue;
        constraintValue = resultingValue;
      }
    });
  }
  return {
    isValid,
    transformedValue,
  };
}

function enforceTypeCheck(value, dataType, propPath, config) {
  const { constraints, possibleValues, prop, errors } = config;
  const isValidValueType = evaluateValueWithType(value, dataType);
  if (!isValidValueType.isValid) {
    // throw new Error(
    //   `Invalid Type Passed for ${propPath}: Expected ${dataType} got ${isValidValueType.valueType}`
    // );
    validationError(
      `Invalid Type Passed for ${propPath}: Expected ${dataType} got ${isValidValueType.valueType}`,
      propPath,
      errors
    );
  }
  const { transformedValue } = evaluateConstraints(value, constraints, prop, errors);
  evaluatePossibleValues(transformedValue, possibleValues, prop, errors);
  return typeof transformedValue !== 'undefined' ? transformedValue : value;
}

function validateWithAST(object, tree_, AST, parentChain = '', errors = {}) {
  const tree = tree_;
  // console.log(object, tree, AST);
  const astKeys = Object.keys(AST);
  astKeys.forEach((astKey) => {
    const node = AST[astKey];
    const value = object[astKey];
    let valueToAssign = value;
    const { alias, isOptional, dataType, constraints, possibleValues, arrayChildrenType } = node; // console.log(constraints, possibleValues);
    // let valueDoesNotExist = !value;
    // if (dataType === 'boolean') {
    //   valueDoesNotExist = typeof value === 'undefined';
    // }
    const valueDoesNotExist = typeof value === 'undefined';
    // console.log('💎💎💎💎💎', isOptional, dataType, value, valueDoesNotExist, `💎💎💎💎💎`);
    if (!isOptional && valueDoesNotExist) {
      // console.log('💣 Errored out here', isOptional, valueDoesNotExist, astKey);
      // throw new Error(`${parentChain}${astKey} is required!`);
      validationError(`${parentChain}${astKey} is required!`, `${parentChain}${astKey}`, errors);
      return;
    }
    if (isOptional && typeof value === 'undefined') return;
    const treeKey = alias || astKey;
    const nodeHasChildren = Object.keys(node.children).length;
    if (dataType) {
      valueToAssign = enforceTypeCheck(value, dataType, `${parentChain}${astKey}`, {
        errors,
        constraints,
        possibleValues,
        prop: `${parentChain}${astKey}`,
      });
    }

    if (dataType === 'array') {
      tree[treeKey] = [];
      if (!isOptional && !value.length) {
        // throw new Error(`${parentChain}${astKey} is required!`);
        validationError(`${parentChain}${astKey} is required!`, `${parentChain}${astKey}`, errors);
        return;
      }
      if (!nodeHasChildren) {
        value.forEach((v, i) => {
          const tv = enforceTypeCheck(v, arrayChildrenType, `${parentChain}${astKey}[${i}]`, {
            errors,
            constraints,
            possibleValues,
            prop: `${parentChain}${astKey}[${i}]`,
          });
          tree[treeKey].push(tv);
        });
      } else {
        value.forEach((v, i) => {
          // console.log()
          tree[treeKey].push(
            validateWithAST(v, {}, node.children, `${parentChain}${astKey}[${i}].`, errors)
          );
        });
      }
    } else if (!nodeHasChildren) {
      tree[treeKey] = valueToAssign;
    } else {
      tree[treeKey] = {};
      tree[treeKey] = validateWithAST(
        value,
        tree[treeKey],
        node.children,
        `${parentChain}${astKey}.`,
        errors
      );
    }
  });
  return tree;
}
module.exports = validateWithAST;
