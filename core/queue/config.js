module.exports = {
  defaultQueueOpts: {
    url: process.env.REDIS_URL,
    queueName: process.env.QUEUE_NAME || 'default_queue',
  },
  defaultSchedulerOpts: {
    attempts: 10,
    removeOnComplete: true,
    backoff: { type: 'exponential', delay: 60_000 },
  },
};
