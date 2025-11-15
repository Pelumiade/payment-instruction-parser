const h = String.raw; // so we can write raw regex strings without any escaping i.e \s doesn't become s and \$ as an example also doesn't become $
function buildRegexFromComplexString(str) {
  const sanitizedStrings = str.replace(/[\t\s\n]/g, '');
  // console.log(sanitizedStrings);
  // eslint-disable-next-line no-eval
  return eval(`/${sanitizedStrings}/`);
}

module.exports = {
  h,
  buildRegexFromComplexString,
};
