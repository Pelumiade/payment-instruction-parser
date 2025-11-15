const ulid = require('ulid');

function generateULID() {
  return ulid.ulid();
}
module.exports = generateULID;
