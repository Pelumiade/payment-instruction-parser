const assert = require('assert');
const validator = require('@app-core/validator');

function runEnumerationTests() {
  console.log('🧪 Running Enumeration and Possible Values Tests...');
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

  // Basic enum shorthand syntax tests
  test('should validate enum shorthand syntax correctly', () => {
    const spec = `root {
  status string(pending|approved|rejected)
}`;
    const ast = validator.parse(spec);

    // Valid - all enum options
    const result1 = validator.validate({ status: 'pending' }, ast);
    assert.strictEqual(result1.status, 'pending');

    const result2 = validator.validate({ status: 'approved' }, ast);
    assert.strictEqual(result2.status, 'approved');

    const result3 = validator.validate({ status: 'rejected' }, ast);
    assert.strictEqual(result3.status, 'rejected');

    // Invalid - not in enum
    assert.throws(() => {
      validator.validate({ status: 'invalid' }, ast);
    }, /Expected status's value: invalid to be one of pending, approved, rejected/);

    // Invalid - case sensitive
    assert.throws(() => {
      validator.validate({ status: 'PENDING' }, ast);
    }, /Expected status's value: PENDING to be one of pending, approved, rejected/);
  });

  // IsAnyOf constraint syntax tests
  test('should validate isAnyOf constraint correctly', () => {
    const spec = `root {
  color string<isAnyOf:red,green,blue,yellow>
}`;
    const ast = validator.parse(spec);

    // Valid - all enum options
    const result1 = validator.validate({ color: 'red' }, ast);
    assert.strictEqual(result1.color, 'red');

    const result2 = validator.validate({ color: 'green' }, ast);
    assert.strictEqual(result2.color, 'green');

    const result3 = validator.validate({ color: 'blue' }, ast);
    assert.strictEqual(result3.color, 'blue');

    const result4 = validator.validate({ color: 'yellow' }, ast);
    assert.strictEqual(result4.color, 'yellow');

    // Invalid - not in enum
    assert.throws(() => {
      validator.validate({ color: 'purple' }, ast);
    }, /should be any of red,green,blue,yellow/);

    // Invalid - case sensitive
    assert.throws(() => {
      validator.validate({ color: 'RED' }, ast);
    }, /should be any of red,green,blue,yellow/);
  });

  // Enum equivalence test - shorthand vs explicit
  test('should treat enum shorthand and isAnyOf as equivalent', () => {
    const spec1 = `root {
  size string(XS|S|M|L|XL)
}`;
    const spec2 = `root {
  size string<isAnyOf:XS,S,M,L,XL>
}`;

    const ast1 = validator.parse(spec1);
    const ast2 = validator.parse(spec2);

    const testData = { size: 'M' };

    // Both should validate the same way
    const result1 = validator.validate(testData, ast1);
    const result2 = validator.validate(testData, ast2);

    assert.strictEqual(result1.size, 'M');
    assert.strictEqual(result2.size, 'M');

    // Both should reject invalid values the same way
    const invalidData = { size: 'XXL' };

    assert.throws(() => {
      validator.validate(invalidData, ast1);
    });

    assert.throws(() => {
      validator.validate(invalidData, ast2);
    });
  });

  // Enum with transformation constraints
  test('should validate enum with transformation constraints correctly', () => {
    const spec = `root {
  category string(ABC|GHI|FHT)<uppercase>
}`;
    const ast = validator.parse(spec);

    // Valid - value gets transformed then validated against enum
    const result1 = validator.validate({ category: 'ABC' }, ast);
    assert.strictEqual(result1.category, 'ABC');

    const result2 = validator.validate({ category: 'abc' }, ast);
    assert.strictEqual(result2.category, 'ABC');

    const result3 = validator.validate({ category: 'ghi' }, ast);
    assert.strictEqual(result3.category, 'GHI');

    // Invalid - not in enum even after transformation
    assert.throws(() => {
      validator.validate({ category: 'xyz' }, ast);
    }, /Expected category's value: XYZ to be one of ABC, GHI, FHT/);
  });

  // Multiple enum fields
  test('should validate multiple enum fields correctly', () => {
    const spec = `root {
  priority string(low|medium|high|critical)
  status string(active|inactive|pending)
  type string<isAnyOf:user,admin,moderator>
}`;
    const ast = validator.parse(spec);

    // Valid - all enum fields
    const result = validator.validate(
      {
        priority: 'high',
        status: 'active',
        type: 'admin',
      },
      ast
    );

    assert.strictEqual(result.priority, 'high');
    assert.strictEqual(result.status, 'active');
    assert.strictEqual(result.type, 'admin');

    // Invalid - one field invalid
    assert.throws(() => {
      validator.validate(
        {
          priority: 'urgent', // not in enum
          status: 'active',
          type: 'admin',
        },
        ast
      );
    }, /Expected priority's value: urgent to be one of low, medium, high, critical/);
  });

  // Enum arrays
  test('should validate enum arrays correctly', () => {
    const spec = `root {
  roles[] string(admin|user|moderator)
  tags[] string<isAnyOf:red,blue,green>
}`;
    const ast = validator.parse(spec);

    // Valid - all array elements in enum
    const result = validator.validate(
      {
        roles: ['admin', 'user'],
        tags: ['red', 'blue', 'green'],
      },
      ast
    );

    assert.deepStrictEqual(result.roles, ['admin', 'user']);
    assert.deepStrictEqual(result.tags, ['red', 'blue', 'green']);

    // Valid - single element arrays
    const result2 = validator.validate(
      {
        roles: ['moderator'],
        tags: ['blue'],
      },
      ast
    );

    assert.deepStrictEqual(result2.roles, ['moderator']);
    assert.deepStrictEqual(result2.tags, ['blue']);

    // Invalid - array element not in enum
    assert.throws(() => {
      validator.validate(
        {
          roles: ['admin', 'superuser'], // superuser not in enum
          tags: ['red'],
        },
        ast
      );
    }, /Expected roles\[1\]'s value: superuser to be one of admin, user, moderator/);

    // Invalid - array element not in isAnyOf enum
    assert.throws(() => {
      validator.validate(
        {
          roles: ['admin'],
          tags: ['yellow'], // yellow not in enum
        },
        ast
      );
    }, /should be any of red,blue,green/);
  });

  // Optional enum fields
  test('should validate optional enum fields correctly', () => {
    const spec = `root {
  requiredStatus string(active|inactive)
  optionalPriority? string(low|high)
}`;
    const ast = validator.parse(spec);

    // Valid - both provided
    const result1 = validator.validate(
      {
        requiredStatus: 'active',
        optionalPriority: 'high',
      },
      ast
    );

    assert.strictEqual(result1.requiredStatus, 'active');
    assert.strictEqual(result1.optionalPriority, 'high');

    // Valid - only required provided
    const result2 = validator.validate(
      {
        requiredStatus: 'inactive',
      },
      ast
    );

    assert.strictEqual(result2.requiredStatus, 'inactive');
    assert.strictEqual(result2.optionalPriority, undefined);

    // Invalid - required field not in enum
    assert.throws(() => {
      validator.validate(
        {
          requiredStatus: 'pending', // not in enum
          optionalPriority: 'high',
        },
        ast
      );
    }, /Expected requiredStatus's value: pending to be one of active, inactive/);

    // Invalid - optional field provided but not in enum
    assert.throws(() => {
      validator.validate(
        {
          requiredStatus: 'active',
          optionalPriority: 'medium', // not in enum
        },
        ast
      );
    }, /Expected optionalPriority's value: medium to be one of low, high/);
  });

  // Nested object enums
  test('should validate nested object enums correctly', () => {
    const spec = `root {
  user {
    role string(admin|user|guest)
    preferences {
      theme string(light|dark|auto)
      language string<isAnyOf:en,es,fr,de>
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - all nested enums
    const result = validator.validate(
      {
        user: {
          role: 'admin',
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
      },
      ast
    );

    assert.strictEqual(result.user.role, 'admin');
    assert.strictEqual(result.user.preferences.theme, 'dark');
    assert.strictEqual(result.user.preferences.language, 'en');

    // Invalid - nested enum invalid
    assert.throws(() => {
      validator.validate(
        {
          user: {
            role: 'admin',
            preferences: {
              theme: 'custom', // not in enum
              language: 'en',
            },
          },
        },
        ast
      );
    }, /Expected user\.preferences\.theme's value: custom to be one of light, dark, auto/);
  });

  //   // Enum with special characters
  //   test('should validate enums with special characters correctly', () => {
  //     const spec = `root {
  //   format string(application/json|text/plain|image/jpeg)
  //   protocol string<isAnyOf:http://,https://,ftp://>
  // }`;
  //     const ast = validator.parse(spec);

  //     // Valid - special characters in enum values
  //     const result = validator.validate(
  //       {
  //         format: 'application/json',
  //         protocol: 'https://',
  //       },
  //       ast
  //     );

  //     assert.strictEqual(result.format, 'application/json');
  //     assert.strictEqual(result.protocol, 'https://');

  //     // Valid - other options
  //     const result2 = validator.validate(
  //       {
  //         format: 'text/plain',
  //         protocol: 'ftp://',
  //       },
  //       ast
  //     );

  //     assert.strictEqual(result2.format, 'text/plain');
  //     assert.strictEqual(result2.protocol, 'ftp://');

  //     // Invalid - not in enum
  //     assert.throws(() => {
  //       validator.validate(
  //         {
  //           format: 'application/xml', // not in enum
  //           protocol: 'https://',
  //         },
  //         ast
  //       );
  //     }, /Expected format's value: application\/xml to be one of application\/json, text\/plain, image\/jpeg/);
  //   });

  // Empty enum values (edge case)
  test('should handle empty string in enum correctly', () => {
    const spec = `root {
  value string(|empty|blank)
}`;
    const ast = validator.parse(spec);

    // Valid - empty string is in enum
    const result1 = validator.validate({ value: '' }, ast);
    assert.strictEqual(result1.value, '');

    // Valid - other enum values
    const result2 = validator.validate({ value: 'empty' }, ast);
    assert.strictEqual(result2.value, 'empty');

    const result3 = validator.validate({ value: 'blank' }, ast);
    assert.strictEqual(result3.value, 'blank');

    // Invalid - not in enum
    assert.throws(() => {
      validator.validate({ value: 'null' }, ast);
    }, /Expected value's value: null to be one of , empty, blank/);
  });

  // Numeric enums (edge case)
  test('should handle string enums with numeric-like values', () => {
    const spec = `root {
  version string(1.0|2.0|3.0)
  level string<isAnyOf:0,1,2,3>
}`;
    const ast = validator.parse(spec);

    // Valid - string values that look like numbers
    const result = validator.validate(
      {
        version: '2.0',
        level: '1',
      },
      ast
    );

    assert.strictEqual(result.version, '2.0');
    assert.strictEqual(result.level, '1');

    // Invalid - actual numbers (not strings)
    assert.throws(() => {
      validator.validate(
        {
          version: 2.0, // number, not string
          level: '1',
        },
        ast
      );
    }, /Invalid Type Passed.*Expected string got number/);
  });

  console.log(
    `✅ Enumeration and Possible Values Tests Completed: ${passedCount}/${testCount} passed`
  );
  return { passed: passedCount, total: testCount };
}

module.exports = runEnumerationTests;
