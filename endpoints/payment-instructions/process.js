const { createHandler } = require('@app-core/server');
const parseInstruction = require('@app/services/payment-processor/parse-instruction');

module.exports = createHandler({
  path: '/payment-instructions',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = rc.body;

    const response = await parseInstruction(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
