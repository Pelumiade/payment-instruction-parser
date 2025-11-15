// @ts-check
const { Schema } = require('mongoose');

const { Mixed, ObjectId, UUID, Decimal128 } = Schema.Types;

class ULID {
  static schemaName = 'ULID';
}

/**
 * @typedef {import('mongoose').Schema.Types} MongooseType
 */
/**
 *@typedef {ULID|Mixed|ObjectId|UUID|Decimal128|StringConstructor|NumberConstructor|BooleanConstructor|DateConstructor|BufferConstructor|MapConstructor} MongooseAllowedTypes
 */

/**
 * @typedef {any} MongooseTypeString
 */

/**
 * @typedef {Object} MongooseTypeStrings
 * @property {StringConstructor} String - Mongoose Type
 * @property {NumberConstructor} Number - Mongoose Type
 * @property {BooleanConstructor} Boolean - Mongoose Type
 * @property {DateConstructor} Date - Mongoose Type
 * @property {BufferConstructor} Buffer - Mongoose Type
 * @property {Mixed} Mixed - Mongoose Type
 * @property {ObjectId} ObjectId - Mongoose Type
 * @property {Decimal128} Decimal128 - Mongoose Type
 * @property {UUID} UUID - Mongoose Type
 * @property {MapConstructor} Map - Mongoose Type
 */

/**
 * Enum representing Mongoose Types
 * @readonly
 * @enum {MongooseAllowedTypes} MongooseTypes
 */
const MongooseTypes = {
  String,
  Number,
  Boolean,
  Date,
  Buffer,
  Mixed,
  ObjectId,
  Decimal128,
  UUID,
  Map,
  ULID,
  Array,
};

module.exports = {
  MongooseTypes,
};
