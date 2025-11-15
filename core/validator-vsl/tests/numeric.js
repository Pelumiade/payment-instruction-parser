const assert = require('assert');
const validator = require('@app-core/validator');

function runNumericConstraintsTests() {
  console.log('🧪 Running Numeric Constraints Tests...');
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

  // Min constraint tests
  test('should validate min constraint correctly', () => {
    const spec = `root {
  age number<min:18>
}`;
    const ast = validator.parse(spec);

    // Valid - exactly at minimum
    const result1 = validator.validate({ age: 18 }, ast);
    assert.strictEqual(result1.age, 18);

    // Valid - above minimum
    const result2 = validator.validate({ age: 25 }, ast);
    assert.strictEqual(result2.age, 25);

    // Invalid - below minimum
    assert.throws(() => {
      validator.validate({ age: 17 }, ast);
    }, /should be greater than 18/);

    // Valid - decimal values
    const result3 = validator.validate({ age: 18.5 }, ast);
    assert.strictEqual(result3.age, 18.5);
  });

  // Max constraint tests
  test('should validate max constraint correctly', () => {
    const spec = `root {
  percentage number<max:100>
}`;
    const ast = validator.parse(spec);

    // Valid - exactly at maximum
    const result1 = validator.validate({ percentage: 100 }, ast);
    assert.strictEqual(result1.percentage, 100);

    // Valid - below maximum
    const result2 = validator.validate({ percentage: 75 }, ast);
    assert.strictEqual(result2.percentage, 75);

    // Invalid - above maximum
    assert.throws(() => {
      validator.validate({ percentage: 101 }, ast);
    }, /should be lesser than 100/);

    // Valid - decimal values
    const result3 = validator.validate({ percentage: 99.9 }, ast);
    assert.strictEqual(result3.percentage, 99.9);
  });

  // Between constraint tests
  test('should validate between constraint correctly', () => {
    const spec = `root {
  score number<between:0,100>
}`;
    const ast = validator.parse(spec);

    // Valid - at minimum boundary
    const result1 = validator.validate({ score: 0 }, ast);
    assert.strictEqual(result1.score, 0);

    // Valid - at maximum boundary
    const result2 = validator.validate({ score: 100 }, ast);
    assert.strictEqual(result2.score, 100);

    // Valid - in between
    const result3 = validator.validate({ score: 50 }, ast);
    assert.strictEqual(result3.score, 50);

    // Invalid - below minimum
    assert.throws(() => {
      validator.validate({ score: -1 }, ast);
    }, /should be between 0 and 100/);

    // Invalid - above maximum
    assert.throws(() => {
      validator.validate({ score: 101 }, ast);
    }, /should be between 0 and 100/);

    // Valid - decimal values within range
    const result4 = validator.validate({ score: 75.5 }, ast);
    assert.strictEqual(result4.score, 75.5);
  });

  // Negated min constraint tests
  test('should validate negated min constraint correctly', () => {
    const spec = `root {
  age number<!min:10>
}`;
    const ast = validator.parse(spec);

    // Valid - below the negated minimum (age should NOT be >= 10)
    const result1 = validator.validate({ age: 9 }, ast);
    assert.strictEqual(result1.age, 9);

    const result2 = validator.validate({ age: 5 }, ast);
    assert.strictEqual(result2.age, 5);

    // Invalid - at or above the negated minimum
    assert.throws(() => {
      validator.validate({ age: 10 }, ast);
    }, /should be not greater than 10/);

    assert.throws(() => {
      validator.validate({ age: 15 }, ast);
    }, /should be not greater than 10/);
  });

  // Negated max constraint tests
  test('should validate negated max constraint correctly', () => {
    const spec = `root {
  height number<!max:10>
}`;
    const ast = validator.parse(spec);

    // Valid - above the negated maximum (height should NOT be <= 10)
    const result1 = validator.validate({ height: 11 }, ast);
    assert.strictEqual(result1.height, 11);

    const result2 = validator.validate({ height: 43 }, ast);
    assert.strictEqual(result2.height, 43);

    // Invalid - at or below the negated maximum
    assert.throws(() => {
      validator.validate({ height: 10 }, ast);
    }, /should be not lesser than 10/);

    assert.throws(() => {
      validator.validate({ height: 5 }, ast);
    }, /should be not lesser than 10/);
  });

  // Negated between constraint tests
  test('should validate negated between constraint correctly', () => {
    const spec = `root {
  value number<!between:10,20>
}`;
    const ast = validator.parse(spec);

    // Valid - below the range
    const result1 = validator.validate({ value: 9 }, ast);
    assert.strictEqual(result1.value, 9);

    // Valid - above the range
    const result2 = validator.validate({ value: 21 }, ast);
    assert.strictEqual(result2.value, 21);

    // Invalid - within the negated range
    assert.throws(() => {
      validator.validate({ value: 10 }, ast);
    }, /should not be between 10 and 20/);

    assert.throws(() => {
      validator.validate({ value: 15 }, ast);
    }, /should not be between 10 and 20/);

    assert.throws(() => {
      validator.validate({ value: 20 }, ast);
    }, /should not be between 10 and 20/);
  });

  // Combined numeric constraints
  test('should validate combined numeric constraints correctly', () => {
    const spec = `root {
  score number<min:0|max:100>
  temperature number<between:-10,40>
}`;
    const ast = validator.parse(spec);

    // Valid - all constraints satisfied
    const result = validator.validate(
      {
        score: 85,
        temperature: 25,
      },
      ast
    );
    assert.strictEqual(result.score, 85);
    assert.strictEqual(result.temperature, 25);

    // Invalid - score below min
    assert.throws(() => {
      validator.validate({ score: -5, temperature: 25 }, ast);
    }, /should be greater than 0/);

    // Invalid - score above max
    assert.throws(() => {
      validator.validate({ score: 105, temperature: 25 }, ast);
    }, /should be lesser than 100/);

    // Invalid - temperature outside range
    assert.throws(() => {
      validator.validate({ score: 85, temperature: 50 }, ast);
    }, /should be between -10 and 40/);
  });

  // Edge cases with zero and negative numbers
  test('should handle zero and negative numbers correctly', () => {
    const spec = `root {
  debt number<max:0>
  profit number<min:0>
  balance number<between:-1000,1000>
}`;
    const ast = validator.parse(spec);

    // Valid - zero values
    const result1 = validator.validate(
      {
        debt: 0,
        profit: 0,
        balance: 0,
      },
      ast
    );
    assert.strictEqual(result1.debt, 0);
    assert.strictEqual(result1.profit, 0);
    assert.strictEqual(result1.balance, 0);

    // Valid - negative debt, positive profit
    const result2 = validator.validate(
      {
        debt: -500,
        profit: 1000,
        balance: -999,
      },
      ast
    );
    assert.strictEqual(result2.debt, -500);
    assert.strictEqual(result2.profit, 1000);
    assert.strictEqual(result2.balance, -999);

    // Invalid - positive debt
    assert.throws(() => {
      validator.validate({ debt: 100, profit: 0, balance: 0 }, ast);
    }, /should be lesser than 0/);

    // Invalid - negative profit
    assert.throws(() => {
      validator.validate({ debt: 0, profit: -100, balance: 0 }, ast);
    }, /should be greater than 0/);
  });

  // Decimal precision tests
  test('should handle decimal numbers correctly', () => {
    const spec = `root {
  price number<min:0.01|max:999.99>
  rate number<between:0.0,1.0>
}`;
    const ast = validator.parse(spec);

    // Valid - decimal values
    const result = validator.validate(
      {
        price: 19.99,
        rate: 0.75,
      },
      ast
    );
    assert.strictEqual(result.price, 19.99);
    assert.strictEqual(result.rate, 0.75);

    // Valid - boundary values
    const result2 = validator.validate(
      {
        price: 0.01,
        rate: 1.0,
      },
      ast
    );
    assert.strictEqual(result2.price, 0.01);
    assert.strictEqual(result2.rate, 1.0);

    // Invalid - below minimum decimal
    assert.throws(() => {
      validator.validate({ price: 0.001, rate: 0.5 }, ast);
    }, /should be greater than 0.01/);

    // Invalid - above maximum decimal
    assert.throws(() => {
      validator.validate({ price: 19.99, rate: 1.1 }, ast);
    }, /should be between 0 and 1/);
  });

  // Numeric constraints on arrays
  test('should validate numeric constraints on array elements', () => {
    const spec = `root {
  scores[] number<min:0|max:100>
  temperatures[] number<between:-10,40>
}`;
    const ast = validator.parse(spec);

    // Valid - all array elements satisfy constraints
    const result = validator.validate(
      {
        scores: [85, 92, 78, 100, 0],
        temperatures: [25, -5, 35, 0],
      },
      ast
    );
    assert.deepStrictEqual(result.scores, [85, 92, 78, 100, 0]);
    assert.deepStrictEqual(result.temperatures, [25, -5, 35, 0]);

    // Invalid - array element below min
    assert.throws(() => {
      validator.validate(
        {
          scores: [85, -5, 78],
          temperatures: [25, -5, 35],
        },
        ast
      );
    }, /should be greater than 0/);

    // Invalid - array element above max
    assert.throws(() => {
      validator.validate(
        {
          scores: [85, 92, 105],
          temperatures: [25, -5, 35],
        },
        ast
      );
    }, /should be lesser than 100/);

    // Invalid - array element outside range
    assert.throws(() => {
      validator.validate(
        {
          scores: [85, 92, 78],
          temperatures: [25, -15, 35],
        },
        ast
      );
    }, /should be between -10 and 40/);
  });

  // timestampToHex transformation constraint
  test('should validate timestampToHex constraint correctly', () => {
    const spec = `root {
  timestamp number<timestampToHex>
}`;
    const ast = validator.parse(spec);

    // Valid - timestamp gets converted to hex
    const timestamp = Date.now();
    const result = validator.validate({ timestamp }, ast);
    assert.strictEqual(result.timestamp, timestamp.toString(16));

    // Valid - any number gets converted to hex
    const result2 = validator.validate({ timestamp: 255 }, ast);
    assert.strictEqual(result2.timestamp, 'ff');

    const result3 = validator.validate({ timestamp: 16 }, ast);
    assert.strictEqual(result3.timestamp, '10');
  });

  // Combined transformation and validation constraints
  test('should handle combined transformation and validation constraints', () => {
    const spec = `root {
  m number<timestampToHex|uppercase>
}`;
    const ast = validator.parse(spec);

    // Valid - number converted to hex then uppercased
    const result = validator.validate({ m: Date.now() }, ast);
    assert.strictEqual(typeof result.m, 'string');
    assert.strictEqual(result.m, result.m.toUpperCase());

    // Valid - simple number conversion
    const result2 = validator.validate({ m: 255 }, ast);
    assert.strictEqual(result2.m, 'FF');
  });

  console.log(`✅ Numeric Constraints Tests Completed: ${passedCount}/${testCount} passed`);
  return { passed: passedCount, total: testCount };
}

module.exports = runNumericConstraintsTests;
