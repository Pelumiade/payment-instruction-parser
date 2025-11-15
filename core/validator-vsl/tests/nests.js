const assert = require('assert');
const validator = require('@app-core/validator');

function runComplexNestedTests() {
  console.log('🧪 Running Complex Nested Structures Tests...');
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

  // Deep nested objects
  test('should validate deep nested objects correctly', () => {
    const spec = `root {
  user {
    profile {
      personal {
        name string<trim|minLength:1>
        age number<min:0|max:150>
      }
      contact {
        email string<trim|lowercase|isEmail>
        phone? string<startsWith:+>
      }
    }
    preferences {
      settings {
        theme string(light|dark|auto)
        notifications {
          email boolean
          push boolean
          sms? boolean
        }
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - complete nested structure
    const result = validator.validate(
      {
        user: {
          profile: {
            personal: {
              name: '  John Doe  ',
              age: 30,
            },
            contact: {
              email: '  JOHN@EXAMPLE.COM  ',
              phone: '+1234567890',
            },
          },
          preferences: {
            settings: {
              theme: 'dark',
              notifications: {
                email: true,
                push: false,
                sms: true,
              },
            },
          },
        },
      },
      ast
    );

    assert.strictEqual(result.user.profile.personal.name, 'John Doe');
    assert.strictEqual(result.user.profile.personal.age, 30);
    assert.strictEqual(result.user.profile.contact.email, 'john@example.com');
    assert.strictEqual(result.user.profile.contact.phone, '+1234567890');
    assert.strictEqual(result.user.preferences.settings.theme, 'dark');
    assert.strictEqual(result.user.preferences.settings.notifications.email, true);
    assert.strictEqual(result.user.preferences.settings.notifications.push, false);
    assert.strictEqual(result.user.preferences.settings.notifications.sms, true);

    // Valid - with optional fields omitted
    const result2 = validator.validate(
      {
        user: {
          profile: {
            personal: {
              name: 'Jane',
              age: 25,
            },
            contact: {
              email: 'jane@example.com',
            },
          },
          preferences: {
            settings: {
              theme: 'light',
              notifications: {
                email: false,
                push: true,
              },
            },
          },
        },
      },
      ast
    );

    assert.strictEqual(result2.user.profile.contact.phone, undefined);
    assert.strictEqual(result2.user.preferences.settings.notifications.sms, undefined);

    // Invalid - deep nested constraint violation
    assert.throws(() => {
      validator.validate(
        {
          user: {
            profile: {
              personal: {
                name: '', // fails minLength:1 after trim
                age: 30,
              },
              contact: {
                email: 'john@example.com',
              },
            },
            preferences: {
              settings: {
                theme: 'dark',
                notifications: {
                  email: true,
                  push: false,
                },
              },
            },
          },
        },
        ast
      );
    }, /length 0 should be at least 1/);
  });

  // Arrays of nested objects
  test('should validate arrays of nested objects correctly', () => {
    const spec = `root {
  users[] {
    id string<length:26>
    profile {
      name string<trim|minLength:1>
      email string<trim|lowercase|isEmail>
      tags[]? string<minLength:2|maxLength:20>
    }
    permissions[] {
      resource string(users|posts|comments|admin)
      actions[] string(read|write|delete|manage)
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - array of complex objects
    const result = validator.validate(
      {
        users: [
          {
            id: '01234567890123456789012345',
            profile: {
              name: '  Alice  ',
              email: '  ALICE@EXAMPLE.COM  ',
              tags: ['developer', 'admin'],
            },
            permissions: [
              {
                resource: 'users',
                actions: ['read', 'write'],
              },
              {
                resource: 'posts',
                actions: ['read', 'write', 'delete'],
              },
            ],
          },
          {
            id: '12345678901234567890123456',
            profile: {
              name: 'Bob',
              email: 'bob@test.com',
            },
            permissions: [
              {
                resource: 'comments',
                actions: ['read'],
              },
            ],
          },
        ],
      },
      ast
    );

    assert.strictEqual(result.users[0].profile.name, 'Alice');
    assert.strictEqual(result.users[0].profile.email, 'alice@example.com');
    assert.deepStrictEqual(result.users[0].profile.tags, ['developer', 'admin']);
    assert.strictEqual(result.users[1].profile.name, 'Bob');
    assert.strictEqual(result.users[1].profile.tags, undefined);

    // Invalid - array element constraint violation
    assert.throws(() => {
      validator.validate(
        {
          users: [
            {
              id: '01234567890123456789012345',
              profile: {
                name: 'Alice',
                email: 'alice@example.com',
              },
              permissions: [
                {
                  resource: 'invalid_resource', // not in enum
                  actions: ['read'],
                },
              ],
            },
          ],
        },
        ast
      );
    }, /Expected users\[0\]\.permissions\[0\]\.resource's value: invalid_resource to be one of users, posts, comments, admin/);
  });

  // Mixed array and object nesting
  test('should validate mixed array and object nesting correctly', () => {
    const spec = `root {
  company {
    name string<trim|minLength:1>
    departments[] {
      name string<trim|minLength:1>
      manager {
        name string<trim|minLength:1>
        email string<isEmail>
      }
      employees[] {
        id number<min:1>
        name string<trim|minLength:1>
        roles[] string(developer|designer|manager|qa)
        metadata? {
          startDate string
          salary? number<min:0>
          benefits[]? string
        }
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - complex mixed structure
    const result = validator.validate(
      {
        company: {
          name: '  Tech Corp  ',
          departments: [
            {
              name: '  Engineering  ',
              manager: {
                name: 'Sarah Johnson',
                email: 'sarah@techcorp.com',
              },
              employees: [
                {
                  id: 1,
                  name: '  John Smith  ',
                  roles: ['developer', 'manager'],
                  metadata: {
                    startDate: '2023-01-01',
                    salary: 75000,
                    benefits: ['health', 'dental', '401k'],
                  },
                },
                {
                  id: 2,
                  name: 'Jane Doe',
                  roles: ['designer'],
                },
              ],
            },
            {
              name: 'QA',
              manager: {
                name: 'Mike Wilson',
                email: 'mike@techcorp.com',
              },
              employees: [
                {
                  id: 3,
                  name: 'Bob Testing',
                  roles: ['qa'],
                  metadata: {
                    startDate: '2023-06-01',
                  },
                },
              ],
            },
          ],
        },
      },
      ast
    );

    assert.strictEqual(result.company.name, 'Tech Corp');
    assert.strictEqual(result.company.departments[0].name, 'Engineering');
    assert.strictEqual(result.company.departments[0].employees[0].name, 'John Smith');
    assert.deepStrictEqual(result.company.departments[0].employees[0].roles, [
      'developer',
      'manager',
    ]);
    assert.strictEqual(result.company.departments[0].employees[1].metadata, undefined);
    assert.strictEqual(result.company.departments[1].employees[0].metadata.salary, undefined);

    // Invalid - deep nested array element violation
    assert.throws(() => {
      validator.validate(
        {
          company: {
            name: 'Tech Corp',
            departments: [
              {
                name: 'Engineering',
                manager: {
                  name: 'Sarah Johnson',
                  email: 'sarah@techcorp.com',
                },
                employees: [
                  {
                    id: 1,
                    name: 'John Smith',
                    roles: ['developer', 'invalid_role'], // not in enum
                  },
                ],
              },
            ],
          },
        },
        ast
      );
    }, /Expected company\.departments\[0\]\.employees\[0\]\.roles\[1\]'s value: invalid_role to be one of developer, designer, manager, qa/);
  });

  // Optional nested objects with constraints
  test('should validate optional nested objects with constraints correctly', () => {
    const spec = `root {
  user {
    id string<length:26>
    name string<trim|minLength:1>
    profile? {
      bio string<trim|maxLength:500>
      avatar? {
        url string<startsWith:https://>
        width number<min:1|max:2000>
        height number<min:1|max:2000>
      }
      social? {
        twitter? string<startsWith:@|maxLength:16>
        github? string<trim|minLength:1|maxLength:39>
        website? string<startsWith:https://>
      }
    }
    settings? {
      theme string(light|dark)
      notifications? {
        email? boolean
        push? boolean
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - minimal required fields only
    const result1 = validator.validate(
      {
        user: {
          id: '01234567890123456789012345',
          name: 'John',
        },
      },
      ast
    );

    assert.strictEqual(result1.user.id, '01234567890123456789012345');
    assert.strictEqual(result1.user.name, 'John');
    assert.strictEqual(result1.user.profile, undefined);
    assert.strictEqual(result1.user.settings, undefined);

    // Valid - partial optional fields
    const result2 = validator.validate(
      {
        user: {
          id: '01234567890123456789012345',
          name: '  Jane Doe  ',
          profile: {
            bio: '  Software developer and tech enthusiast  ',
            social: {
              twitter: '@jane_doe',
              github: 'jane-doe',
            },
          },
        },
      },
      ast
    );

    assert.strictEqual(result2.user.name, 'Jane Doe');
    assert.strictEqual(result2.user.profile.bio, 'Software developer and tech enthusiast');
    assert.strictEqual(result2.user.profile.avatar, undefined);
    assert.strictEqual(result2.user.profile.social.website, undefined);
    assert.strictEqual(result2.user.settings, undefined);

    // Valid - all optional fields provided
    const result3 = validator.validate(
      {
        user: {
          id: '01234567890123456789012345',
          name: 'Alice',
          profile: {
            bio: 'Full stack developer',
            avatar: {
              url: 'https://example.com/avatar.jpg',
              width: 200,
              height: 200,
            },
            social: {
              twitter: '@alice',
              github: 'alice-dev',
              website: 'https://alice.dev',
            },
          },
          settings: {
            theme: 'dark',
            notifications: {
              email: true,
              push: false,
            },
          },
        },
      },
      ast
    );

    assert.strictEqual(result3.user.profile.avatar.url, 'https://example.com/avatar.jpg');
    assert.strictEqual(result3.user.settings.theme, 'dark');

    // Invalid - optional field provided but constraint violated
    assert.throws(() => {
      validator.validate(
        {
          user: {
            id: '01234567890123456789012345',
            name: 'John',
            profile: {
              bio: 'Bio',
              avatar: {
                url: 'http://example.com/avatar.jpg', // doesn't start with https://
                width: 200,
                height: 200,
              },
            },
          },
        },
        ast
      );
    }, /should start with https:\/\//);
  });

  // Arrays containing arrays as objects
  test('should validate arrays containing array-like structures correctly', () => {
    const spec = `root {
  rows[] {
    values[] number<min:0|max:100>
  }
  categories[] {
    name string<trim|minLength:1>
    itemGroups[] {
      items[] {
        id string
        value any
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - arrays containing objects with arrays
    const result = validator.validate(
      {
        rows: [{ values: [1, 2, 3] }, { values: [4, 5, 6] }, { values: [7, 8, 9] }],
        categories: [
          {
            name: '  Category A  ',
            itemGroups: [
              {
                items: [
                  { id: 'item1', value: 'text' },
                  { id: 'item2', value: 42 },
                ],
              },
              {
                items: [{ id: 'item3', value: true }],
              },
            ],
          },
        ],
      },
      ast
    );

    assert.deepStrictEqual(result.rows[0].values, [1, 2, 3]);
    assert.deepStrictEqual(result.rows[1].values, [4, 5, 6]);
    assert.strictEqual(result.categories[0].name, 'Category A');
    assert.strictEqual(result.categories[0].itemGroups[0].items[0].id, 'item1');
    assert.strictEqual(result.categories[0].itemGroups[0].items[1].value, 42);

    // Invalid - array element out of range
    assert.throws(() => {
      validator.validate(
        {
          rows: [
            { values: [1, 2, 3] },
            { values: [4, 101, 6] }, // 101 > max:100
          ],
          categories: [],
        },
        ast
      );
    }, /should be lesser than 100/);
  });

  // Deeply nested with transformations and constraints
  test('should validate deeply nested structures with transformations correctly', () => {
    const spec = `root {
  config {
    database {
      connections[] {
        name string<trim|lowercase>
        host string<trim>
        port number<min:1|max:65535>
        credentials {
          username string<trim|lowercase>
          password string<minLength:8>
        }
        options? {
          ssl? boolean
          timeout? number<min:1000|max:30000>
          pool? {
            min number<min:1|max:10>
            max number<min:1|max:100>
          }
        }
      }
    }
    services[] {
      name string<trim|uppercase>
      type string(api|worker|scheduler)
      endpoints[]? {
        path string<startsWith:/>
        methods[] string(GET|POST|PUT|DELETE)
      }
    }
  }
}`;
    const ast = validator.parse(spec);

    // Valid - complex configuration
    const result = validator.validate(
      {
        config: {
          database: {
            connections: [
              {
                name: '  PRIMARY_DB  ',
                host: '  localhost  ',
                port: 5432,
                credentials: {
                  username: '  ADMIN  ',
                  password: 'secure_password_123',
                },
                options: {
                  ssl: true,
                  timeout: 5000,
                  pool: {
                    min: 2,
                    max: 10,
                  },
                },
              },
              {
                name: 'cache_db',
                host: 'redis.example.com',
                port: 6379,
                credentials: {
                  username: 'redis_user',
                  password: 'redis_pass_456',
                },
              },
            ],
          },
          services: [
            {
              name: '  api_service  ',
              type: 'api',
              endpoints: [
                {
                  path: '/users',
                  methods: ['GET', 'POST'],
                },
                {
                  path: '/health',
                  methods: ['GET'],
                },
              ],
            },
            {
              name: 'worker_service',
              type: 'worker',
            },
          ],
        },
      },
      ast
    );

    assert.strictEqual(result.config.database.connections[0].name, 'primary_db');
    assert.strictEqual(result.config.database.connections[0].host, 'localhost');
    assert.strictEqual(result.config.database.connections[0].credentials.username, 'admin');
    assert.strictEqual(result.config.services[0].name, 'API_SERVICE');
    assert.strictEqual(result.config.services[1].endpoints, undefined);

    // Invalid - deep nested constraint violation
    assert.throws(() => {
      validator.validate(
        {
          config: {
            database: {
              connections: [
                {
                  name: 'test_db',
                  host: 'localhost',
                  port: 5432,
                  credentials: {
                    username: 'admin',
                    password: 'weak', // fails minLength:8
                  },
                },
              ],
            },
            services: [],
          },
        },
        ast
      );
    }, /length 4 should be at least 8/);
  });

  console.log(`✅ Complex Nested Structures Tests Completed: ${passedCount}/${testCount} passed`);
  return { passed: passedCount, total: testCount };
}

module.exports = runComplexNestedTests;
