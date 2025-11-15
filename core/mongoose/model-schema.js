/* eslint-disable lines-between-class-members */
const mongoose = require('mongoose');
const { throwAppError } = require('@app-core/errors');
const { MongooseTypes } = require('./enums');

const { Schema } = mongoose;

class ModelSchema {
  #schemaObject;
  #schemaOptions;
  #indexes = [];
  #plugins = [];
  #shouldSupportULIDID = false;
  meta = {};

  /**
   * Create a model schema
   * @param {object} schema
   * @param {Object} options
   */
  constructor(schema, options) {
    if (!this.#isValidObject(schema)) {
      throwAppError('Invalid schema definition');
    }

    this.#schemaObject = schema;
    this.#schemaOptions = options || {};
  }

  #isValidObject(obj) {
    return obj && !Array.isArray(obj) && typeof obj === 'object' && Object.keys(obj).length;
  }

  /**
   * Create an index
   * @param {Object} fieldMap The index fields and their order
   * @param {Object} options Index Options
   */
  index(fieldMap, options) {
    if (!this.#isValidObject(fieldMap)) {
      throwAppError('Invalid index definition');
    }

    this.#indexes.push({ fieldMap, options });
  }

  /**
   * Registers a plugin for this schema.
   * @param {Function} pluginFn - The plugin function.
   * @param {Object} [opts={}] - Options to pass to the plugin.
   */
  plugin(pluginFn, opts = {}) {
    this.#plugins.push([pluginFn, opts]);
  }

  hasULIDID() {
    return this.#shouldSupportULIDID;
  }

  createDBSchema() {
    // extend this to all fields if the need arises
    if (this.#schemaObject._id === MongooseTypes.ULID) {
      this.#schemaObject._id = { type: String, required: true };

      this.#shouldSupportULIDID = true;
    } else if (this.#schemaObject._id?.type === MongooseTypes.ULID) {
      this.#schemaObject._id.type = String;
      this.#schemaObject._id.required = true;

      this.#shouldSupportULIDID = true;
    }

    const mongoSchema = new Schema(this.#schemaObject, this.#schemaOptions);

    if (this.#indexes.length) {
      this.#indexes.forEach((index) => {
        mongoSchema.index(index.fieldMap, index.options);
      });
    }

    if (this.#plugins.length > 0) {
      this.#plugins.forEach(([pluginFn, opts]) => mongoSchema.plugin(pluginFn, opts));
    }

    return mongoSchema;
  }
}

module.exports = ModelSchema;
