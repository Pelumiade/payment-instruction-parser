const { createHandler } = require('@app-core/server');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const AuthenticationMessages = require('@app/messages/authentication');

module.exports = createHandler({
  path: '*',
  method: '',
  async handler(rc) {
    const authHeader = rc.headers.authorization;

    if (!authHeader) {
      throwAppError(AuthenticationMessages.MISSING_AUTH_HEADER, ERROR_CODE.NOAUTHERR);
    }

    return {
      augments: { meta: { user: {} } },
    };
  },
});
