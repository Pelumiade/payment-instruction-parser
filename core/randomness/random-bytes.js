const randomByteGenerator = require('crypto').randomBytes;

function generateRandomValues(length = 10) {
  return randomByteGenerator(Math.ceil(length / 2))
    .toString('hex')
    .substring(0, length);
}
module.exports = generateRandomValues;
