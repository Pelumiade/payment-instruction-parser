const mongoose = require('mongoose');

/**
 * Creates and returns a Mongoose session.
 * @returns {Promise<import('mongoose').ClientSession>} A promise that resolves to a Mongoose session.
 */
async function createSession() {
  const session = await mongoose.startSession();
  return session;
}

module.exports = createSession;
