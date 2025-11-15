const validator = require('@app-core/validator');
const { echoLoginValidation } = require('@app/workers');
// const { throwAppError } = require('@app-core/errors');

// Spec for login service
const loginSpec = `root {
  username any
}`;

// Parse the spec outside the service function
const parsedLoginSpec = validator.parse(loginSpec);

async function login(serviceData) {
  echoLoginValidation.scheduleJob(
    { data: serviceData, spec: parsedLoginSpec },
    { delay: 1000, repeat: { every: 5000, limit: 3 } }
  );
  // Validate incoming data
  const validatedData = validator.validate(serviceData, parsedLoginSpec);

  return validatedData;
}

module.exports = login;
