const { appLogger } = require('@app-core/logger');
const validator = require('@app-core/validator');

module.exports = {
  concurrency: 1,
  queue_options: {},
  scheduler_options: {},
  processor_name: 'echo-login-validation',
  async processor(job) {
    try {
      const validatedData = validator.validate(job.data?.data, job.data?.spec);
      appLogger.info(
        { label: 'VALIDATION SUCCESS', jobId: job.id, validatedData },
        'Validation successful'
      );
    } catch (error) {
      appLogger.error({ label: 'VALIDATION ERROR', jobId: job.id, error }, 'Validation failed');
    }
  },
};
