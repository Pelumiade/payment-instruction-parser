const assert = require('assert');
const validator = require('@app-core/validator');

function runStringConstraintsTests() {
  console.log('🧪 Running String Constraints Tests...');
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

  // Length constraint tests
  test('should validate length constraint correctly', () => {
    const spec = `root {
  code string<length:5>
}`;
    const ast = validator.parse(spec);

    // Valid - exactly 5 characters
    const result1 = validator.validate({ code: 'ABCDE' }, ast);
    assert.strictEqual(result1.code, 'ABCDE');

    // Valid - exactly 5 characters with numbers
    const result2 = validator.validate({ code: '12345' }, ast);
    assert.strictEqual(result2.code, '12345');

    // Invalid - too short
    assert.throws(() => {
      validator.validate({ code: 'ABC' }, ast);
    }, /length 3 should be 5/);

    // Invalid - too long
    assert.throws(() => {
      validator.validate({ code: 'ABCDEF' }, ast);
    }, /length 6 should be 5/);

    // Valid - empty string for length 0
    const spec2 = `root {
  empty string<length:0>
}`;
    const ast2 = validator.parse(spec2);
    const result3 = validator.validate({ empty: '' }, ast2);
    assert.strictEqual(result3.empty, '');
  });

  // MinLength constraint tests
  test('should validate minLength constraint correctly', () => {
    const spec = `root {
  password string<minLength:8>
}`;
    const ast = validator.parse(spec);

    // Valid - exactly at minimum
    const result1 = validator.validate({ password: '12345678' }, ast);
    assert.strictEqual(result1.password, '12345678');

    // Valid - above minimum
    const result2 = validator.validate({ password: '123456789' }, ast);
    assert.strictEqual(result2.password, '123456789');

    // Invalid - below minimum
    assert.throws(() => {
      validator.validate({ password: '1234567' }, ast);
    }, /length 7 should be at least 8/);

    // Invalid - empty string
    assert.throws(() => {
      validator.validate({ password: '' }, ast);
    }, /length 0 should be at least 8/);
  });

  // MaxLength constraint tests
  test('should validate maxLength constraint correctly', () => {
    const spec = `root {
  username string<maxLength:20>
}`;
    const ast = validator.parse(spec);

    // Valid - exactly at maximum
    const result1 = validator.validate({ username: '12345678901234567890' }, ast);
    assert.strictEqual(result1.username, '12345678901234567890');

    // Valid - below maximum
    const result2 = validator.validate({ username: 'user123' }, ast);
    assert.strictEqual(result2.username, 'user123');

    // Valid - empty string (under max)
    const result3 = validator.validate({ username: '' }, ast);
    assert.strictEqual(result3.username, '');

    // Invalid - above maximum
    assert.throws(() => {
      validator.validate({ username: '123456789012345678901' }, ast);
    }, /length 21 should be at most 20/);
  });

  // LengthBetween constraint tests
  test('should validate lengthBetween constraint correctly', () => {
    const spec = `root {
  description string<lengthBetween:10,100>
}`;
    const ast = validator.parse(spec);

    // Valid - at minimum boundary
    const result1 = validator.validate({ description: '1234567890' }, ast);
    assert.strictEqual(result1.description, '1234567890');

    // Valid - at maximum boundary
    const maxString = 'a'.repeat(100);
    const result2 = validator.validate({ description: maxString }, ast);
    assert.strictEqual(result2.description, maxString);

    // Valid - in between
    const result3 = validator.validate({ description: 'This is a valid description' }, ast);
    assert.strictEqual(result3.description, 'This is a valid description');

    // Invalid - below minimum
    assert.throws(() => {
      validator.validate({ description: 'short' }, ast);
    }, /length 5 should be between 10 and 100/);

    // Invalid - above maximum
    const tooLongString = 'a'.repeat(101);
    assert.throws(() => {
      validator.validate({ description: tooLongString }, ast);
    }, /length 101 should be between 10 and 100/);
  });

  // StartsWith constraint tests
  test('should validate startsWith constraint correctly', () => {
    const spec = `root {
  apiKey string<startsWith:sk_>
}`;
    const ast = validator.parse(spec);

    // Valid - starts with prefix
    const result1 = validator.validate({ apiKey: 'sk_test_123456' }, ast);
    assert.strictEqual(result1.apiKey, 'sk_test_123456');

    // Valid - exactly the prefix
    const result2 = validator.validate({ apiKey: 'sk_' }, ast);
    assert.strictEqual(result2.apiKey, 'sk_');

    // Invalid - doesn't start with prefix
    assert.throws(() => {
      validator.validate({ apiKey: 'pk_test_123456' }, ast);
    }, /should start with sk_/);

    // Invalid - contains prefix but doesn't start with it
    assert.throws(() => {
      validator.validate({ apiKey: 'test_sk_123456' }, ast);
    }, /should start with sk_/);

    // Invalid - empty string
    assert.throws(() => {
      validator.validate({ apiKey: '' }, ast);
    }, /should start with sk_/);
  });

  // EndsWith constraint tests
  test('should validate endsWith constraint correctly', () => {
    const spec = `root {
  filename string<endsWith:.pdf>
}`;
    const ast = validator.parse(spec);

    // Valid - ends with suffix
    const result1 = validator.validate({ filename: 'document.pdf' }, ast);
    assert.strictEqual(result1.filename, 'document.pdf');

    // Valid - exactly the suffix
    const result2 = validator.validate({ filename: '.pdf' }, ast);
    assert.strictEqual(result2.filename, '.pdf');

    // Invalid - doesn't end with suffix
    assert.throws(() => {
      validator.validate({ filename: 'document.txt' }, ast);
    }, /should end with \.pdf/);

    // Invalid - contains suffix but doesn't end with it
    assert.throws(() => {
      validator.validate({ filename: 'document.pdf.backup' }, ast);
    }, /should end with \.pdf/);

    // Invalid - empty string
    assert.throws(() => {
      validator.validate({ filename: '' }, ast);
    }, /should end with \.pdf/);
  });

  // IsEmail constraint tests
  test('should validate isEmail constraint correctly', () => {
    const spec = `root {
  email string<isEmail>
}`;
    const ast = validator.parse(spec);

    // Valid emails
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'test123@test-domain.org',
      'a@b.co',
    ];

    validEmails.forEach((email) => {
      const result = validator.validate({ email }, ast);
      assert.strictEqual(result.email, email);
    });

    // Invalid emails
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@domain.com',
      'test@domain',
      'test.domain.com',
      'test@domain.',
      '',
    ];

    invalidEmails.forEach((email) => {
      assert.throws(() => {
        validator.validate({ email }, ast);
      }, /is not a valid email/);
    });
  });

  // Negated string constraints
  test('should validate negated string constraints correctly', () => {
    const spec = `root {
  username string<!length:12>
  bio string<!lengthBetween:4,5>
  slogan string<!minLength:3>
  state string<!maxLength:4>
  url string<!startsWith:abc>
  filename string<!endsWith:mm>
}`;
    const ast = validator.parse(spec);

    // Valid - all negated constraints satisfied
    const result = validator.validate(
      {
        username: '7384amnd83n', // length 11, not 12
        bio: 'noomaa', // length 6, not between 4-5
        slogan: '2', // length 1, not >= 3
        state: 'acmaaaa', // length 7, not <= 4
        url: 'aabcjama', // doesn't start with 'abc'
        filename: '99000mm1', // doesn't end with 'mm'
      },
      ast
    );

    assert.strictEqual(result.username, '7384amnd83n');
    assert.strictEqual(result.bio, 'noomaa');
    assert.strictEqual(result.slogan, '2');
    assert.strictEqual(result.state, 'acmaaaa');
    assert.strictEqual(result.url, 'aabcjama');
    assert.strictEqual(result.filename, '99000mm1');

    // Invalid - username has exactly 12 characters
    assert.throws(() => {
      validator.validate(
        {
          username: '123456789012',
          bio: 'noomaa',
          slogan: '2',
          state: 'acmaaaa',
          url: 'aabcjama',
          filename: '99000mm1',
        },
        ast
      );
    }, /length 12 should not be 12/);

    // Invalid - bio length is between 4-5
    assert.throws(() => {
      validator.validate(
        {
          username: '7384amnd83n',
          bio: 'test', // length 4, which is between 4-5
          slogan: '2',
          state: 'acmaaaa',
          url: 'aabcjama',
          filename: '99000mm1',
        },
        ast
      );
    }, /length 4 should not be between 4 and 5/);

    // Invalid - slogan length is >= 3
    assert.throws(() => {
      validator.validate(
        {
          username: '7384amnd83n',
          bio: 'noomaa',
          slogan: 'abc', // length 3, which is >= 3
          state: 'acmaaaa',
          url: 'aabcjama',
          filename: '99000mm1',
        },
        ast
      );
    }, /length 3 should not be at least 3/);
  });

  // Transformation constraints
  test('should validate string transformation constraints correctly', () => {
    const spec = `root {
  name string<trim>
  email string<lowercase>
  code string<uppercase>
}`;
    const ast = validator.parse(spec);

    // Valid - transformations applied
    const result = validator.validate(
      {
        name: '  John Doe  ',
        email: 'USER@EXAMPLE.COM',
        code: 'abc123',
      },
      ast
    );

    assert.strictEqual(result.name, 'John Doe');
    assert.strictEqual(result.email, 'user@example.com');
    assert.strictEqual(result.code, 'ABC123');
  });

  // Combined string constraints
  test('should validate combined string constraints correctly', () => {
    const spec = `root {
  email string<trim|lowercase|isEmail>
  username string<trim|minLength:3|maxLength:20>
  apiKey string<startsWith:sk_|length:30>
}`;
    const ast = validator.parse(spec);

    // Valid - all constraints satisfied
    const result = validator.validate(
      {
        email: '  USER@EXAMPLE.COM  ',
        username: '  john_doe  ',
        apiKey: 'sk_test_1234567890123456789012', // exactly 30 chars: sk_test_ (8) + 1234567890123456789012 (22) = 30
      },
      ast
    );

    assert.strictEqual(result.email, 'user@example.com');
    assert.strictEqual(result.username, 'john_doe');
    assert.strictEqual(result.apiKey, 'sk_test_1234567890123456789012');

    // Invalid - email not valid after transformation
    assert.throws(() => {
      validator.validate(
        {
          email: '  invalid-email  ',
          username: '  john_doe  ',
          apiKey: 'sk_test_1234567890123456789012',
        },
        ast
      );
    }, /is not a valid email/);

    // Invalid - username too short after trim
    assert.throws(() => {
      validator.validate(
        {
          email: '  USER@EXAMPLE.COM  ',
          username: '  a  ',
          apiKey: 'sk_test_1234567890123456789012',
        },
        ast
      );
    }, /length 1 should be at least 3/);

    // Invalid - apiKey doesn't start with prefix
    assert.throws(() => {
      validator.validate(
        {
          email: '  USER@EXAMPLE.COM  ',
          username: '  john_doe  ',
          apiKey: 'pk_test_1234567890123456789012',
        },
        ast
      );
    }, /should start with sk_/);

    // Invalid - apiKey wrong length
    assert.throws(() => {
      validator.validate(
        {
          email: '  USER@EXAMPLE.COM  ',
          username: '  john_doe  ',
          apiKey: 'sk_test_12345e', // too short, only 14 chars
        },
        ast
      );
    }, /length 14 should be 30/);
  });

  // Negated email constraint
  test('should validate negated isEmail constraint correctly', () => {
    const spec = `root {
  notAnEmail string<!isEmail>
}`;
    const ast = validator.parse(spec);

    // Valid - not a valid email format
    const validNonEmails = ['just-text', 'username', 'test@', '@domain.com', '12345'];

    validNonEmails.forEach((text) => {
      const result = validator.validate({ notAnEmail: text }, ast);
      assert.strictEqual(result.notAnEmail, text);
    });

    // Invalid - valid email format (should be rejected)
    assert.throws(() => {
      validator.validate({ notAnEmail: 'test@example.com' }, ast);
    }, /should not be a valid email/);
  });

  // String constraints on arrays
  test('should validate string constraints on array elements', () => {
    const spec = `root {
  tags[] string<minLength:2|maxLength:10>
  emails[] string<trim|lowercase|isEmail>
}`;
    const ast = validator.parse(spec);

    // Valid - all array elements satisfy constraints
    const result = validator.validate(
      {
        tags: ['tag1', 'category', 'important'],
        emails: ['  USER1@EXAMPLE.COM  ', '  user2@test.org  '],
      },
      ast
    );

    assert.deepStrictEqual(result.tags, ['tag1', 'category', 'important']);
    assert.deepStrictEqual(result.emails, ['user1@example.com', 'user2@test.org']);

    // Invalid - array element too short
    assert.throws(() => {
      validator.validate(
        {
          tags: ['a', 'category'],
          emails: ['user1@example.com'],
        },
        ast
      );
    }, /length 1 should be at least 2/);

    // Invalid - array element not valid email
    assert.throws(() => {
      validator.validate(
        {
          tags: ['tag1', 'category'],
          emails: ['invalid-email'],
        },
        ast
      );
    }, /is not a valid email/);
  });

  console.log(`✅ String Constraints Tests Completed: ${passedCount}/${testCount} passed`);
  return { passed: passedCount, total: testCount };
}

module.exports = runStringConstraintsTests;
