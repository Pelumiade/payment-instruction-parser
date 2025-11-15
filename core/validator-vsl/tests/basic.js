const assert = require('assert');
const validator = require('@app-core/validator');

function runBasicTypeTests() {
  console.log('🧪 Running Basic Type Validation Tests...');
  let testCount = 0;
  let passedCount = 0;

  function test(name, testFn) {
    testCount++;
    try {
      testFn();
      passedCount++;
      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.log(`  ❌ ${name}: ${error.message}`);
      throw error;
    }
  }

  // String type tests
  test('should validate string types correctly', () => {
    const spec = `root {
  name string
}`;
    const ast = validator.parse(spec);

    // Valid string
    const result = validator.validate({ name: 'John' }, ast);
    assert.strictEqual(result.name, 'John');

    // Invalid type - number
    assert.throws(() => {
      validator.validate({ name: 123 }, ast);
    }, /Invalid Type Passed.*Expected string got number/);

    // Invalid type - boolean
    assert.throws(() => {
      validator.validate({ name: true }, ast);
    }, /Invalid Type Passed.*Expected string got boolean/);

    // Invalid type - object
    assert.throws(() => {
      validator.validate({ name: {} }, ast);
    }, /Invalid Type Passed.*Expected string got object/);
  });

  // Number type tests
  test('should validate number types correctly', () => {
    const spec = `root {
  age number
}`;
    const ast = validator.parse(spec);

    // Valid number - integer
    const result1 = validator.validate({ age: 25 }, ast);
    assert.strictEqual(result1.age, 25);

    // Valid number - float
    const result2 = validator.validate({ age: 25.5 }, ast);
    assert.strictEqual(result2.age, 25.5);

    // Invalid type - string
    assert.throws(() => {
      validator.validate({ age: '25' }, ast);
    }, /Invalid Type Passed.*Expected number got string/);

    // Invalid type - boolean
    assert.throws(() => {
      validator.validate({ age: false }, ast);
    }, /Invalid Type Passed.*Expected number got boolean/);
  });

  // Boolean type tests
  test('should validate boolean types correctly', () => {
    const spec = `root {
  isActive boolean
}`;
    const ast = validator.parse(spec);

    // Valid boolean - true
    const result1 = validator.validate({ isActive: true }, ast);
    assert.strictEqual(result1.isActive, true);

    // Valid boolean - false
    const result2 = validator.validate({ isActive: false }, ast);
    assert.strictEqual(result2.isActive, false);

    // Invalid type - string
    assert.throws(() => {
      validator.validate({ isActive: 'true' }, ast);
    }, /Invalid Type Passed.*Expected boolean got string/);

    // Invalid type - number
    assert.throws(() => {
      validator.validate({ isActive: 1 }, ast);
    }, /Invalid Type Passed.*Expected boolean got number/);
  });

  // Object type tests
  test('should validate object types correctly', () => {
    const spec = `root {
  user object
  nested {
    name string
  }
}`;
    const ast = validator.parse(spec);

    // Valid object
    const result = validator.validate(
      {
        user: { some: 'data' },
        nested: { name: 'John' },
      },
      ast
    );
    assert.deepStrictEqual(result.user, { some: 'data' });
    assert.strictEqual(result.nested.name, 'John');

    // Invalid type - string for object
    assert.throws(() => {
      validator.validate({ user: 'not an object', nested: { name: 'John' } }, ast);
    }, /Invalid Type Passed.*Expected object got string/);

    // Invalid type - array for object
    assert.throws(() => {
      validator.validate({ user: [], nested: { name: 'John' } }, ast);
    }, /Invalid Type Passed.*Expected object got array/);
  });

  // Any type tests
  test('should validate any types correctly', () => {
    const spec = `root {
  data any
}`;
    const ast = validator.parse(spec);

    // Valid - string
    const result1 = validator.validate({ data: 'string' }, ast);
    assert.strictEqual(result1.data, 'string');

    // Valid - number
    const result2 = validator.validate({ data: 42 }, ast);
    assert.strictEqual(result2.data, 42);

    // Valid - boolean
    const result3 = validator.validate({ data: true }, ast);
    assert.strictEqual(result3.data, true);

    // Valid - object
    const result4 = validator.validate({ data: { nested: 'value' } }, ast);
    assert.deepStrictEqual(result4.data, { nested: 'value' });

    // Valid - array
    const result5 = validator.validate({ data: [1, 2, 3] }, ast);
    assert.deepStrictEqual(result5.data, [1, 2, 3]);
  });

  // Array type tests
  test('should validate array types correctly', () => {
    const spec = `root {
  tags[] string
  numbers[] number
  flags[] boolean
}`;
    const ast = validator.parse(spec);

    // Valid arrays
    const result = validator.validate(
      {
        tags: ['tag1', 'tag2'],
        numbers: [1, 2, 3],
        flags: [true, false],
      },
      ast
    );
    assert.deepStrictEqual(result.tags, ['tag1', 'tag2']);
    assert.deepStrictEqual(result.numbers, [1, 2, 3]);
    assert.deepStrictEqual(result.flags, [true, false]);

    // Invalid - not an array
    assert.throws(() => {
      validator.validate(
        {
          tags: 'not an array',
          numbers: [1, 2, 3],
          flags: [true, false],
        },
        ast
      );
    }, /Invalid Type Passed.*Expected array got string/);

    // Invalid array element type
    assert.throws(() => {
      validator.validate(
        {
          tags: ['tag1', 123],
          numbers: [1, 2, 3],
          flags: [true, false],
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got number/);
  });

  // Required vs Optional field tests
  test('should handle required fields correctly', () => {
    const spec = `root {
  required string
  optional? string
}`;
    const ast = validator.parse(spec);

    // Valid - both provided
    const result1 = validator.validate(
      {
        required: 'value',
        optional: 'value',
      },
      ast
    );
    assert.strictEqual(result1.required, 'value');
    assert.strictEqual(result1.optional, 'value');

    // Valid - only required provided
    const result2 = validator.validate(
      {
        required: 'value',
      },
      ast
    );
    assert.strictEqual(result2.required, 'value');
    assert.strictEqual(result2.optional, undefined);

    // Invalid - required field missing
    assert.throws(() => {
      validator.validate({ optional: 'value' }, ast);
    }, /required is required!/);

    // Invalid - completely empty object
    assert.throws(() => {
      validator.validate({}, ast);
    }, /required is required!/);
  });

  // Boolean edge cases for required/optional
  test('should handle boolean fields with required/optional correctly', () => {
    const spec = `root {
  requiredFlag boolean
  optionalFlag? boolean
}`;
    const ast = validator.parse(spec);

    // Valid - false is a valid value for required boolean
    const result1 = validator.validate(
      {
        requiredFlag: false,
        optionalFlag: true,
      },
      ast
    );
    assert.strictEqual(result1.requiredFlag, false);
    assert.strictEqual(result1.optionalFlag, true);

    // Valid - only required boolean provided
    const result2 = validator.validate(
      {
        requiredFlag: true,
      },
      ast
    );
    assert.strictEqual(result2.requiredFlag, true);
    assert.strictEqual(result2.optionalFlag, undefined);

    // Invalid - required boolean missing
    assert.throws(() => {
      validator.validate({ optionalFlag: false }, ast);
    }, /requiredFlag is required!/);
  });

  // Empty array handling
  test('should handle empty arrays correctly', () => {
    const spec = `root {
  requiredArray[] string
  optionalArray[]? string
}`;
    const ast = validator.parse(spec);

    // Valid - non-empty arrays
    const result1 = validator.validate(
      {
        requiredArray: ['item'],
        optionalArray: ['item'],
      },
      ast
    );
    assert.deepStrictEqual(result1.requiredArray, ['item']);
    assert.deepStrictEqual(result1.optionalArray, ['item']);

    // Valid - optional array omitted
    const result2 = validator.validate(
      {
        requiredArray: ['item'],
      },
      ast
    );
    assert.deepStrictEqual(result2.requiredArray, ['item']);
    assert.strictEqual(result2.optionalArray, undefined);

    // Invalid - required array is empty
    assert.throws(() => {
      validator.validate(
        {
          requiredArray: [],
          optionalArray: ['item'],
        },
        ast
      );
    }, /requiredArray is required!/);

    // Valid - optional array is empty (should be allowed)
    const result3 = validator.validate(
      {
        requiredArray: ['item'],
        optionalArray: [],
      },
      ast
    );
    assert.deepStrictEqual(result3.requiredArray, ['item']);
    assert.deepStrictEqual(result3.optionalArray, []);
  });

  // Nested object arrays
  test('should handle nested object arrays correctly', () => {
    const spec = `root {
  users[] {
    name string
    age number
  }
}`;
    const ast = validator.parse(spec);

    // Valid - array of objects
    const result = validator.validate(
      {
        users: [
          { name: 'John', age: 25 },
          { name: 'Jane', age: 30 },
        ],
      },
      ast
    );

    assert.strictEqual(result.users[0].name, 'John');
    assert.strictEqual(result.users[0].age, 25);
    assert.strictEqual(result.users[1].name, 'Jane');
    assert.strictEqual(result.users[1].age, 30);

    // Invalid - missing required field in array element
    assert.throws(() => {
      validator.validate(
        {
          users: [
            { name: 'John', age: 25 },
            { name: 'Jane' }, // missing age
          ],
        },
        ast
      );
    }, /users\[1\]\.age is required!/);
  });

  console.log(`✅ Basic Type Validation Tests Completed: ${passedCount}/${testCount} passed`);
  return { passed: passedCount, total: testCount };
}

module.exports = runBasicTypeTests;
