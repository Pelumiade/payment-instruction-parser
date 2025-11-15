require('dotenv').config();
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Reads a single Secrets Manager secret (JSON or string) and injects into process.env
async function loadSecretsToEnv({
  secretId,
  prefix = '',
  optional = false,
  region = 'eu-central-1',
} = {}) {
  const client = new SecretsManagerClient({ region });

  try {
    const { SecretString, SecretBinary } = await client.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    let payload;
    if (SecretString) {
      // If JSON, merge each key; if plain string, set under SECRET
      try {
        const obj = JSON.parse(SecretString);
        payload = obj && typeof obj === 'object' ? obj : { SECRET: SecretString };
      } catch {
        payload = { SECRET: SecretString };
      }
    } else if (SecretBinary) {
      payload = { SECRET_BINARY: Buffer.from(SecretBinary, 'base64').toString('ascii') };
    } else {
      payload = {};
    }

    Object.entries(payload).forEach(([k, v]) => {
      const key = prefix ? `${prefix}${k}` : k;
      if (process.env[key] == null) process.env[key] = String(v);
    });
  } catch (err) {
    if (!optional) {
      console.error('Failed to load secrets:', err);
      process.exit(1);
    } else {
      console.warn('Secrets optional; continuing. Error:', err.message);
    }
  }
}

(async () => {
  if (process.env.USE_SECRETS_MANAGER) {
    await loadSecretsToEnv({
      prefix: '',
      optional: process.env.NODE_ENV !== 'production',
      region: process.env.AWS_REGION || 'eu-central-1',
      secretId: process.env.SECRETS_MANAGER_ID || 'myapp/staging',
    });

    process.env.__ALREADY_BOOTSTRAPPED_ENVS = true;
  }
  // eslint-disable-next-line global-require
  require('./app');
})();
