const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const loginService = require('@app/services/onboarding/login');

module.exports = createHandler({
  path: '/login',
  method: 'post',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'login-request-completed');
  },
  async handler(rc, helpers) {
    const payload = rc.body;

    const response = await loginService(payload);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
