// const { processQualifiers, processPossibleValues } = require('./utils');

function processQualifiers(qualifiers) {
  let processedQualifiers;
  if (qualifiers) {
    processedQualifiers = {};
    const qualifierTokens = qualifiers.split('|');
    qualifierTokens.forEach((qt) => {
      const splitTokens = qt.split(':');
      const gtKey = splitTokens[0];
      const gtValue = splitTokens.slice(1).join(':');
      // console.log('🎉🎉🎉🎉', gtKey, gtValue);
      // const [gtKey, gtValue] =
      const isNot = gtKey.startsWith('!');
      let key = gtKey;
      if (isNot) {
        key = key.replace('!', '');
      }
      processedQualifiers[key] = {
        isNot,
        value: gtValue,
      };
    });
  }
  return processedQualifiers;
}

function processPossibleValues(values = '') {
  let processedValues;
  if (values) {
    processedValues = values.split('|');
  }
  return processedValues;
}

module.exports = {
  processQualifiers,
  processPossibleValues,
};
