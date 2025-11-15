const os = require('os');
const { appLogger } = require('@app-core/logger');
const config = require('./config');
const createQueue = require('./create-queue');

/**
 * @typedef {Object} WorkerConfig
 * @property {Function} processor - The processor function
 * @property {string} processor_name - The name of the processor
 * @property {number} [concurrency] - The number of concurrent jobs to process
 * @property {import('bull').JobOptions} [defaultSchedulerOpts] - Default options for the scheduler
 * @property {import('pino').Logger} [logger] - The logger instance
 */

/**
 * Creates a new worker
 * @param {WorkerConfig} workerConfig
 */
function createWorker(workerConfig) {
  const {
    processor,
    processor_name: processorName = 'default',
    concurrency = Math.max(1, os.cpus().length),
    queue_options: queueOptions = {},
    scheduler_options: defaultSchedulerOpts = config.defaultSchedulerOpts,
  } = workerConfig;
  const queue = createQueue({ ...(config.defaultQueueOpts || {}), ...queueOptions });

  if (!queue) return { scheduleJob: () => {} };

  if (typeof processor !== 'function') {
    throw new Error('Processor must be a function');
  }

  queue.on('completed', (job) => {
    appLogger.info({ label: 'JOB COMPLETED', jobId: job.id }, 'JOB COMPLETED');
  });

  queue.on('failed', (job, err) => {
    appLogger.error(
      { label: 'JOB FAILED', jobId: job.id, errStack: err?.stack, errMessage: err?.message },
      'JOB FAILED'
    );
  });

  queue.on('stalled', (job) => {
    appLogger.warn({ label: 'JOB STALLED', jobId: job.id }, 'JOB STALLED');
  });

  queue.process(processorName, concurrency, async (job) => {
    appLogger.info({ label: 'JOB PROCESSING', jobId: job.id, processorName }, 'JOB PROCESSING');
    try {
      const result = await processor(job);
      return result;
    } catch (err) {
      appLogger.error(
        {
          processorName,
          jobId: job.id,
          errStack: err?.stack,
          label: 'PROCESSOR ERROR',
          errMessage: err?.message,
        },
        'PROCESSOR ERROR'
      );
      throw err;
    }
  });

  /**
   * Schedules a job
   * @param {Object} jobData
   * @param {import('bull').JobOptions} opts
   */
  function scheduleJob(jobData, opts = {}) {
    return queue.add(processorName, jobData, {
      ...(defaultSchedulerOpts || {}),
      ...opts,
    });
  }

  return { scheduleJob };
}

module.exports = createWorker;
