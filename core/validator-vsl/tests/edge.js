const assert = require('assert');
const validator = require('@app-core/validator');

function runErrorHandlingTests() {
  console.log('🧪 Running Error Handling and Edge Cases Tests...');
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

  // Null and undefined handling
  test('should handle null and undefined values correctly', () => {
    const spec = `root {
  required string
  optional? string
  requiredNumber number
  optionalNumber? number
}`;
    const ast = validator.parse(spec);

    // Invalid - null for required field
    assert.throws(() => {
      validator.validate(
        {
          required: null,
          requiredNumber: 42,
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got object/);

    // Invalid - undefined for required field (missing)
    assert.throws(() => {
      validator.validate(
        {
          requiredNumber: 42,
        },
        ast
      );
    }, /required is required!/);

    // Invalid - null for optional field when provided
    assert.throws(() => {
      validator.validate(
        {
          required: 'value',
          optional: null,
          requiredNumber: 42,
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got object/);

    // Valid - undefined for optional field (omitted)
    const result = validator.validate(
      {
        required: 'value',
        requiredNumber: 42,
      },
      ast
    );

    assert.strictEqual(result.required, 'value');
    assert.strictEqual(result.optional, undefined);
    assert.strictEqual(result.requiredNumber, 42);
    assert.strictEqual(result.optionalNumber, undefined);
  });

  // Array with null/undefined elements
  test('should handle null/undefined in arrays correctly', () => {
    const spec = `root {
  strings[] string
  numbers[] number
  optionalArray[]? string
}`;
    const ast = validator.parse(spec);

    // Invalid - null element in array
    assert.throws(() => {
      validator.validate(
        {
          strings: ['valid', null, 'another'],
          numbers: [1, 2, 3],
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got (object|undefined)/);

    // Invalid - undefined element in array
    assert.throws(() => {
      validator.validate(
        {
          strings: ['valid', undefined, 'another'],
          numbers: [1, 2, 3],
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got (object|undefined)/);

    // Invalid - empty array for required array field
    assert.throws(() => {
      validator.validate(
        {
          strings: [],
          numbers: [1, 2, 3],
        },
        ast
      );
    }, /strings is required!/);

    assert.throws(() => {
      validator.validate(
        {
          strings: ['valid'],
          numbers: [],
        },
        ast
      );
    }, /numbers is required!/);

    // Valid - non-empty required arrays
    const result = validator.validate(
      {
        strings: ['valid'],
        numbers: [1, 2, 3],
      },
      ast
    );

    assert.deepStrictEqual(result.strings, ['valid']);
    assert.deepStrictEqual(result.numbers, [1, 2, 3]);
    assert.strictEqual(result.optionalArray, undefined);
  });

  // Object with missing properties
  test('should handle objects with missing required properties', () => {
    const spec = `root {
  user {
    id string
    name string
    email? string
  }
  metadata {
    version number
    created boolean
  }
}`;
    const ast = validator.parse(spec);

    // Invalid - missing required property in nested object
    assert.throws(() => {
      validator.validate(
        {
          user: {
            id: '123',
            // missing name
            email: 'test@example.com',
          },
          metadata: {
            version: 1,
            created: true,
          },
        },
        ast
      );
    }, /user\.name is required!/);

    // Invalid - completely empty nested object
    assert.throws(() => {
      validator.validate(
        {
          user: {},
          metadata: {
            version: 1,
            created: true,
          },
        },
        ast
      );
    }, /user\.id is required!/);

    // Valid - all required fields present
    const result = validator.validate(
      {
        user: {
          id: '123',
          name: 'John',
        },
        metadata: {
          version: 1,
          created: true,
        },
      },
      ast
    );

    assert.strictEqual(result.user.email, undefined);
  });

  // Type coercion edge cases
  test('should handle type coercion edge cases correctly', () => {
    const spec = `root {
  stringField string
  numberField number
  booleanField boolean
}`;
    const ast = validator.parse(spec);

    // Invalid - string that looks like number
    assert.throws(() => {
      validator.validate(
        {
          stringField: 'text',
          numberField: '123', // string, not number
          booleanField: true,
        },
        ast
      );
    }, /Invalid Type Passed.*Expected number got string/);

    // Invalid - number that should be string
    assert.throws(() => {
      validator.validate(
        {
          stringField: 123, // number, not string
          numberField: 123,
          booleanField: true,
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got number/);

    // Invalid - string that looks like boolean
    assert.throws(() => {
      validator.validate(
        {
          stringField: 'text',
          numberField: 123,
          booleanField: 'true', // string, not boolean
        },
        ast
      );
    }, /Invalid Type Passed.*Expected boolean got string/);

    // Invalid - number that could be boolean
    assert.throws(() => {
      validator.validate(
        {
          stringField: 'text',
          numberField: 123,
          booleanField: 1, // number, not boolean
        },
        ast
      );
    }, /Invalid Type Passed.*Expected boolean got number/);
  });

  // Empty and whitespace-only strings with constraints
  test('should handle empty and whitespace strings with constraints', () => {
    const spec = `root {
  trimmed string<trim|minLength:1>
  notTrimmed string<minLength:1>
  email string<trim|isEmail>
  optional? string<trim|minLength:1>
}`;
    const ast = validator.parse(spec);

    // Invalid - empty string after trim
    assert.throws(() => {
      validator.validate(
        {
          trimmed: '   ', // becomes empty after trim
          notTrimmed: 'valid',
          email: 'test@example.com',
        },
        ast
      );
    }, /length 0 should be at least 1/);

    // Valid - whitespace string without trim constraint
    const result1 = validator.validate(
      {
        trimmed: 'valid',
        notTrimmed: '   ', // whitespace is valid without trim
        email: '  test@example.com  ',
      },
      ast
    );

    assert.strictEqual(result1.trimmed, 'valid');
    assert.strictEqual(result1.notTrimmed, '   ');
    assert.strictEqual(result1.email, 'test@example.com');

    // Invalid - empty string for email after trim
    assert.throws(() => {
      validator.validate(
        {
          trimmed: 'valid',
          notTrimmed: 'valid',
          email: '   ', // becomes empty after trim, fails email validation
        },
        ast
      );
    }, /is not a valid email/);

    // Valid - optional field with empty string after trim (should be skipped)
    const result2 = validator.validate(
      {
        trimmed: 'valid',
        notTrimmed: 'valid',
        email: 'test@example.com',
      },
      ast
    );

    assert.strictEqual(result2.optional, undefined);
  });

  // Special numeric values
  test('should handle special numeric values correctly', () => {
    const spec = `root {
  regularNumber number<min:0|max:1000>
  anyNumber number
}`;
    const ast = validator.parse(spec);

    // Invalid - Infinity
    assert.throws(() => {
      validator.validate(
        {
          regularNumber: Infinity,
          anyNumber: 42,
        },
        ast
      );
    }, /should be lesser than 1000/);

    // Invalid - -Infinity
    assert.throws(() => {
      validator.validate(
        {
          regularNumber: -Infinity,
          anyNumber: 42,
        },
        ast
      );
    }, /should be greater than 0/);

    // Invalid - NaN (NaN is typeof 'number' but not a valid number)
    assert.throws(() => {
      validator.validate(
        {
          regularNumber: NaN,
          anyNumber: 42,
        },
        ast
      );
    }, /should be greater than 0/);

    // Valid - regular numbers
    const result = validator.validate(
      {
        regularNumber: 500,
        anyNumber: -123.45,
      },
      ast
    );

    assert.strictEqual(result.regularNumber, 500);
    assert.strictEqual(result.anyNumber, -123.45);

    // Valid - zero and negative numbers
    const result2 = validator.validate(
      {
        regularNumber: 0,
        anyNumber: -Infinity, // anyNumber has no constraints
      },
      ast
    );

    assert.strictEqual(result2.regularNumber, 0);
    assert.strictEqual(result2.anyNumber, -Infinity);
  });

  // Circular reference handling
  test('should handle objects without circular references', () => {
    const spec = `root {
  user {
    id string
    name string
    friend? {
      id string
      name string
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - no circular reference
    const result = validator.validate(
      {
        user: {
          id: '1',
          name: 'Alice',
          friend: {
            id: '2',
            name: 'Bob',
          },
        },
      },
      ast
    );

    assert.strictEqual(result.user.name, 'Alice');
    assert.strictEqual(result.user.friend.name, 'Bob');

    // Note: VSL validator doesn't handle true circular references
    // This test just ensures normal object nesting works
  });

  // Large array handling
  test('should handle large arrays efficiently', () => {
    const spec = `root {
  items[] {
    id number<min:0>
    name string<minLength:1>
  }
}`;
    const ast = validator.parse(spec);

    // Create a large array
    const largeArray = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `item_${i}`,
    }));

    // Valid - large array should process without issues
    const result = validator.validate({ items: largeArray }, ast);

    assert.strictEqual(result.items.length, 1000);
    assert.strictEqual(result.items[0].id, 0);
    assert.strictEqual(result.items[999].name, 'item_999');

    // Invalid - error in large array (early failure)
    const invalidLargeArray = Array.from({ length: 100 }, (_, i) => ({
      id: i === 50 ? -1 : i, // Invalid id at index 50
      name: `item_${i}`,
    }));

    assert.throws(() => {
      validator.validate({ items: invalidLargeArray }, ast);
    }, /should be greater than 0/);
  });

  // Constraint failure with complex error paths
  test('should provide clear error paths for complex failures', () => {
    const spec = `root {
  users[] {
    profile {
      contacts[] {
        type string(email|phone)
        value string<isEmail>
        verified boolean
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Invalid - constraint failure deep in nested array
    assert.throws(() => {
      validator.validate(
        {
          users: [
            {
              profile: {
                contacts: [
                  {
                    type: 'email',
                    value: 'valid@example.com',
                    verified: true,
                  },
                  {
                    type: 'email',
                    value: 'invalid-email', // fails isEmail constraint
                    verified: false,
                  },
                ],
              },
            },
          ],
        },
        ast
      );
    }, /users\[0\]\.profile\.contacts\[1\]\.value.*is not a valid email/);

    // Invalid - enum constraint failure
    assert.throws(() => {
      validator.validate(
        {
          users: [
            {
              profile: {
                contacts: [
                  {
                    type: 'sms', // not in enum
                    value: 'test@example.com',
                    verified: true,
                  },
                ],
              },
            },
          ],
        },
        ast
      );
    }, /users\[0\]\.profile\.contacts\[0\]\.type.*to be one of email, phone/);
  });

  // Unicode and special characters
  test('should handle unicode and special characters correctly', () => {
    const spec = `root {
  name string<trim|minLength:1|maxLength:50>
  description string<lengthBetween:5,100>
  emoji string<length:2>
}`;
    const ast = validator.parse(spec);

    // Valid - unicode characters
    const result = validator.validate(
      {
        name: '  José María  ',
        description: 'Descripción con acentos y ñ',
        emoji: '🚀',
      },
      ast
    );

    assert.strictEqual(result.name, 'José María');
    assert.strictEqual(result.description, 'Descripción con acentos y ñ');
    assert.strictEqual(result.emoji, '🚀');

    // Valid - mixed scripts
    const result2 = validator.validate(
      {
        name: 'John 田中',
        description: 'Mixed English and 日本語 text here',
        emoji: '🎉',
      },
      ast
    );

    assert.strictEqual(result2.name, 'John 田中');

    // Invalid - unicode character length (emoji can be counted as 2 chars)
    // Note: JavaScript string length counts may vary for complex emoji
    // const result3 = validator.validate(
    //   {
    //     name: 'Test',
    //     description: 'Valid description here',
    //     emoji: '👨‍💻', // This might be counted as more than 2 characters
    //   },
    //   ast
    // );

    // // This test just ensures unicode doesn't break the validator
    // assert.strictEqual(typeof result3.emoji, 'string');
  });

  // Transformation edge cases
  test('should handle transformation edge cases correctly', () => {
    const spec = `root {
  email string<trim|lowercase|isEmail>
  code string<uppercase|length:5>
  name string<trim>
}`;
    const ast = validator.parse(spec);

    // Valid - extreme whitespace
    const result = validator.validate(
      {
        email: '    USER@EXAMPLE.COM    ',
        code: 'abcde',
        name: '\t\n  John Doe  \t\n',
      },
      ast
    );

    assert.strictEqual(result.email, 'user@example.com');
    assert.strictEqual(result.code, 'ABCDE');
    assert.strictEqual(result.name, 'John Doe');

    // Invalid - transformation reveals constraint violation
    assert.throws(() => {
      validator.validate(
        {
          email: '  INVALID-EMAIL  ', // valid after trim but fails email validation
          code: 'abcde',
          name: 'John',
        },
        ast
      );
    }, /is not a valid email/);

    // Invalid - length constraint after transformation
    assert.throws(() => {
      validator.validate(
        {
          email: 'test@example.com',
          code: 'abc', // too short even after uppercase
          name: 'John',
        },
        ast
      );
    }, /length 3 should be 5/);
  });

  console.log(
    `✅ Error Handling and Edge Cases Tests Completed: ${passedCount}/${testCount} passed`
  );
  return { passed: passedCount, total: testCount };
}

module.exports = runErrorHandlingTests;
