/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const { throwAppError } = require('@app-core/errors');

class DatabaseModel {
  /**
   * Modify the model schema to support soft-deletion
   * @param {mongoose.Schema} schema
   * @return {{updatedSchema: mongoose.Schema, uniqueFields: String[]}}
   */
  static #handleParanoidSchema(schema) {
    const delSchema = schema.path('deleted');

    if (!delSchema || delSchema.instance !== 'Number') {
      schema.add({ deleted: { type: Number, default: 0, index: true } });
    } else {
      if (delSchema.defaultValue !== 0) {
        delSchema.defaultValue = 0;
      }

      if (!delSchema.options?.index) {
        schema.index({ deleted: 1 });
      }
    }

    const fieldIndexDefinition = {};

    schema.indexes().forEach(([def, opts]) => {
      if (opts?.unique) {
        Object.assign(fieldIndexDefinition, def);
      }
    });

    return { updatedSchema: schema, uniqueFields: Object.keys(fieldIndexDefinition) };
  }

  /**
   * Create a database model
   * @param {String} modelName
   * @param {import('./model-schema')} modelSchema
   * @param {{paranoid:Boolean}} options
   * @returns
   */
  static model(modelName, modelSchema, options = {}) {
    if (!modelSchema.createDBSchema) {
      throwAppError('Invalid model schema');
    }

    let dbSchema = modelSchema.createDBSchema();
    const appConfig = {};

    if (options.paranoid) {
      const { updatedSchema, uniqueFields } = this.#handleParanoidSchema(dbSchema);

      dbSchema = updatedSchema;
      appConfig.uniqueFields = uniqueFields;
    }

    const databaseModel = mongoose.model(modelName, dbSchema);

    if (options.paranoid) {
      appConfig.paranoid = true;
    }

    if (modelSchema.hasULIDID()) {
      appConfig.supportULIDID = true;
    }

    databaseModel.__appConfig = appConfig;

    return databaseModel;
  }
}

module.exports = DatabaseModel;
