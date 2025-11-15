const assert = require('assert');
const validator = require('@app-core/validator');

function runTransformationPipelineTests() {
  console.log('🧪 Running Transformation Pipeline Tests...');
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

  // Single transformation tests
  test('should apply single transformations correctly', () => {
    const spec = `root {
  trimmed string<trim>
  lowercased string<lowercase>
  uppercased string<uppercase>
  hexTimestamp number<timestampToHex>
}`;
    const ast = validator.parse(spec);

    const result = validator.validate(
      {
        trimmed: '  spaced text  ',
        lowercased: 'MIXED Case TEXT',
        uppercased: 'mixed CASE text',
        hexTimestamp: 255,
      },
      ast
    );

    assert.strictEqual(result.trimmed, 'spaced text');
    assert.strictEqual(result.lowercased, 'mixed case text');
    assert.strictEqual(result.uppercased, 'MIXED CASE TEXT');
    assert.strictEqual(result.hexTimestamp, 'ff');
  });

  // Multiple transformation order tests
  test('should apply transformations in correct order (left to right)', () => {
    const spec = `root {
  trimThenLower string<trim|lowercase>
  lowerThenTrim string<lowercase|trim>
  trimThenUpper string<trim|uppercase>
  upperThenTrim string<uppercase|trim>
}`;
    const ast = validator.parse(spec);

    const result = validator.validate(
      {
        trimThenLower: '  HELLO WORLD  ',
        lowerThenTrim: '  HELLO WORLD  ',
        trimThenUpper: '  hello world  ',
        upperThenTrim: '  hello world  ',
      },
      ast
    );

    // trim|lowercase: trim first, then lowercase
    assert.strictEqual(result.trimThenLower, 'hello world');

    // lowercase|trim: lowercase first, then trim
    assert.strictEqual(result.lowerThenTrim, 'hello world');

    // trim|uppercase: trim first, then uppercase
    assert.strictEqual(result.trimThenUpper, 'HELLO WORLD');

    // uppercase|trim: uppercase first, then trim
    assert.strictEqual(result.upperThenTrim, 'HELLO WORLD');
  });

  // Order dependency demonstration
  test('should demonstrate transformation order dependencies', () => {
    const spec = `root {
  scenario1 string<trim|uppercase>
  scenario2 string<uppercase|trim>
}`;
    const ast = validator.parse(spec);

    // Using input with trailing whitespace
    const result = validator.validate(
      {
        scenario1: ' hello ',
        scenario2: ' hello ',
      },
      ast
    );

    // Both should produce the same result in this case
    assert.strictEqual(result.scenario1, 'HELLO');
    assert.strictEqual(result.scenario2, 'HELLO');

    // Test with input that shows order matters more clearly
    const result2 = validator.validate(
      {
        scenario1: '   mixed CASE   ',
        scenario2: '   mixed CASE   ',
      },
      ast
    );

    // trim|uppercase: "mixed CASE" -> "MIXED CASE"
    assert.strictEqual(result2.scenario1, 'MIXED CASE');

    // uppercase|trim: "   MIXED CASE   " -> "MIXED CASE"
    assert.strictEqual(result2.scenario2, 'MIXED CASE');
  });

  // Transformations with validation constraints
  test('should apply transformations before validation constraints', () => {
    const spec = `root {
  email string<trim|lowercase|isEmail>
  code string<uppercase|length:5>
  username string<trim|minLength:3|maxLength:10>
  status string<lowercase>(active|inactive|pending)
}`;
    const ast = validator.parse(spec);

    // Valid - transformations make values pass constraints
    const result = validator.validate(
      {
        email: '  USER@EXAMPLE.COM  ',
        code: 'abcde',
        username: '  john_doe  ',
        status: 'ACTIVE',
      },
      ast
    );

    assert.strictEqual(result.email, 'user@example.com');
    assert.strictEqual(result.code, 'ABCDE');
    assert.strictEqual(result.username, 'john_doe');
    assert.strictEqual(result.status, 'active');

    // Invalid - transformation doesn't make value valid
    assert.throws(() => {
      validator.validate(
        {
          email: '  INVALID-EMAIL  ', // trim|lowercase but still not valid email
          code: 'abcde',
          username: 'john_doe',
          status: 'active',
        },
        ast
      );
    }, /is not a valid email/);

    // Invalid - length constraint fails after transformation
    assert.throws(() => {
      validator.validate(
        {
          email: 'user@example.com',
          code: 'abc', // uppercase makes it 'ABC' but still length 3, not 5
          username: 'john_doe',
          status: 'active',
        },
        ast
      );
    }, /length 3 should be 5/);

    // Invalid - minLength fails after trim
    assert.throws(() => {
      validator.validate(
        {
          email: 'user@example.com',
          code: 'abcde',
          username: '  xx  ', // trim makes it 'xx' which is length 2, less than minLength:3
          status: 'active',
        },
        ast
      );
    }, /length 2 should be at least 3/);
  });

  // Complex transformation chains
  test('should handle complex transformation chains correctly', () => {
    const spec = `root {
  complexField string<trim|lowercase|uppercase>
  numericTransform number<timestampToHex|uppercase>
}`;
    const ast = validator.parse(spec);

    // String: trim -> lowercase -> uppercase
    const result = validator.validate(
      {
        complexField: '  Mixed CASE Text  ',
        numericTransform: 2748,
      },
      ast
    );

    // "  Mixed CASE Text  " -> "Mixed CASE Text" -> "mixed case text" -> "MIXED CASE TEXT"
    assert.strictEqual(result.complexField, 'MIXED CASE TEXT');

    // 2748 -> "abc" -> "ABC"
    assert.strictEqual(result.numericTransform, 'ABC');
  });

  // Transformations with enum constraints
  test('should apply transformations before enum validation', () => {
    const spec = `root {
  status string<lowercase>(active|inactive|pending)
  category string<trim|uppercase>(A|B|C)
  priority string<uppercase|isAnyOf:LOW,MEDIUM,HIGH>
}`;
    const ast = validator.parse(spec);

    // Valid - transformations make values match enum
    const result = validator.validate(
      {
        status: 'ACTIVE',
        category: '  b  ',
        priority: 'low',
      },
      ast
    );

    assert.strictEqual(result.status, 'active');
    assert.strictEqual(result.category, 'B');
    assert.strictEqual(result.priority, 'LOW');

    // Invalid - value doesn't match enum even after transformation
    assert.throws(() => {
      validator.validate(
        {
          status: 'RUNNING', // lowercase makes it 'running', not in enum
          category: 'b',
          priority: 'low',
        },
        ast
      );
    }, /Expected status's value: running to be one of active, inactive, pending/);

    // Invalid - enum constraint with isAnyOf
    assert.throws(() => {
      validator.validate(
        {
          status: 'active',
          category: 'B',
          priority: 'urgent', // uppercase makes it 'URGENT', not in isAnyOf list
        },
        ast
      );
    }, /should be any of LOW,MEDIUM,HIGH/);
  });

  // Transformations in arrays
  test('should apply transformations to array elements correctly', () => {
    const spec = `root {
  emails[] string<trim|lowercase|isEmail>
  codes[] string<uppercase|length:3>
  names[] string<trim|minLength:1>
}`;
    const ast = validator.parse(spec);

    // Valid - transformations applied to each array element
    const result = validator.validate(
      {
        emails: ['  USER1@EXAMPLE.COM  ', '  user2@TEST.ORG  '],
        codes: ['abc', 'xyz'],
        names: ['  Alice  ', '  Bob  ', '  Charlie  '],
      },
      ast
    );

    assert.deepStrictEqual(result.emails, ['user1@example.com', 'user2@test.org']);
    assert.deepStrictEqual(result.codes, ['ABC', 'XYZ']);
    assert.deepStrictEqual(result.names, ['Alice', 'Bob', 'Charlie']);

    // Invalid - array element fails constraint after transformation
    assert.throws(() => {
      validator.validate(
        {
          emails: ['user1@example.com', '  INVALID-EMAIL  '],
          codes: ['abc', 'xyz'],
          names: ['Alice', 'Bob'],
        },
        ast
      );
    }, /emails\[1\].*is not a valid email/);

    // Invalid - array element wrong length after transformation
    assert.throws(() => {
      validator.validate(
        {
          emails: ['user1@example.com'],
          codes: ['abc', 'toolong'], // becomes 'TOOLONG' which is length 7, not 3
          names: ['Alice'],
        },
        ast
      );
    }, /codes\[1\].*length 7 should be 3/);
  });

  // Transformations in nested objects
  test('should apply transformations in nested objects correctly', () => {
    const spec = `root {
  user {
    profile {
      name string<trim|uppercase>
      email string<trim|lowercase|isEmail>
      bio? string<trim|maxLength:100>
    }
    settings {
      theme string<lowercase>(light|dark)
      language string<uppercase|length:2>
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - nested transformations
    const result = validator.validate(
      {
        user: {
          profile: {
            name: '  john doe  ',
            email: '  JOHN@EXAMPLE.COM  ',
            bio: '  Software developer with 5 years of experience  ',
          },
          settings: {
            theme: 'DARK',
            language: 'en',
          },
        },
      },
      ast
    );

    assert.strictEqual(result.user.profile.name, 'JOHN DOE');
    assert.strictEqual(result.user.profile.email, 'john@example.com');
    assert.strictEqual(result.user.profile.bio, 'Software developer with 5 years of experience');
    assert.strictEqual(result.user.settings.theme, 'dark');
    assert.strictEqual(result.user.settings.language, 'EN');

    // Invalid - nested transformation reveals constraint violation
    assert.throws(() => {
      validator.validate(
        {
          user: {
            profile: {
              name: 'john doe',
              email: 'john@example.com',
              bio: `  ${'x'.repeat(200)}  `, // trim makes it 200 chars, over maxLength:100
            },
            settings: {
              theme: 'dark',
              language: 'en',
            },
          },
        },
        ast
      );
    }, /length 200 should be at most 100/);
  });

  // Edge case: transformation that changes type (timestampToHex)
  test('should handle type-changing transformations correctly', () => {
    const spec = `root {
  timestamp number<timestampToHex>
  timestampWithConstraints number<timestampToHex|uppercase|length:7>
  combinedTransform number<timestampToHex|lowercase>
}`;
    const ast = validator.parse(spec);

    // Valid - number to hex string transformation
    const result = validator.validate(
      {
        timestamp: 2748, // becomes "abc"
        timestampWithConstraints: 268435455, // becomes "fffffff" (7 chars) -> "FFFFFFF"
        combinedTransform: 2748, // becomes "abc" -> "abc"
      },
      ast
    );

    assert.strictEqual(result.timestamp, 'abc');
    assert.strictEqual(result.combinedTransform, 'abc');

    // Invalid - hex result doesn't meet length constraint
    assert.throws(() => {
      validator.validate(
        {
          timestamp: 2748,
          timestampWithConstraints: 2748, // becomes "abc" -> "ABC" (3 chars, not 8)
          combinedTransform: 2748,
        },
        ast
      );
    }, /length 3 should be 7/);
  });

  // Performance test with many transformations
  test('should handle multiple transformations efficiently', () => {
    const spec = `root {
  items[] {
    text string<trim|lowercase|uppercase>
    code string<trim|uppercase|length:5>
  }
}`;
    const ast = validator.parse(spec);

    // Create array with many items requiring transformations
    const manyItems = Array.from({ length: 100 }, (_, i) => ({
      text: `  item ${i} text  `,
      code: `cod${i.toString().padStart(2, '0')}`,
    }));

    const result = validator.validate({ items: manyItems }, ast);

    assert.strictEqual(result.items.length, 100);
    assert.strictEqual(result.items[0].text, 'ITEM 0 TEXT');
    assert.strictEqual(result.items[0].code, 'COD00');
    assert.strictEqual(result.items[99].text, 'ITEM 99 TEXT');
    assert.strictEqual(result.items[99].code, 'COD99');
  });

  console.log(`✅ Transformation Pipeline Tests Completed: ${passedCount}/${testCount} passed`);
  return { passed: passedCount, total: testCount };
}

module.exports = runTransformationPipelineTests;
