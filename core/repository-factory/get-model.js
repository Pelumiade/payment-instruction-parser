/* eslint-disable node/no-unpublished-require */
const models = require('@app/models');
const { MockModels } = require('@app/mock-models');

let modelReference;
const useMockModel = parseInt(process.env.USE_MOCK_MODEL, 10);

if (!useMockModel) {
  modelReference = models;
} else {
  modelReference = MockModels;
}

/**
 * Retrieves a model based on the provided model name.
 * @template {keyof typeof models} T
 * @param {T | (typeof models)[T]>} modelOrName - The name of the model to retrieve or the model itself.
 * @returns {typeof models[T]} The requested model.
 * @throws {Error} If no model name is provided.
 */
function getModel(modelOrName) {
  if (typeof modelOrName === 'string') {
    const model = modelReference[modelOrName];
    if (!model) {
      throw new Error(`Model not found for name: ${modelOrName}`);
    }
    return model;
  }
  return modelOrName;
}

module.exports = getModel;
