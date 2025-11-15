# Node.js Backend Project - Architecture Guide

A Node.js backend application following clean architecture principles, functional programming paradigms, and best practices.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Programming Conventions](#programming-conventions)
- [Core Modules (`@app-core`)](#core-modules-app-core)
- [Services (`@app/services`)](#services-appservices)
- [Data Layer (`@app/repository`)](#data-layer-apprepository)
- [Endpoints](#endpoints)
- [Middlewares](#middlewares)
- [Specs Folder](#specs-folder)
- [Error Handling](#error-handling)
- [Messages](#messages)
- [Logging](#logging)
- [Code Quality Rules](#code-quality-rules)
- [Best Practices](#best-practices)

---

## Architecture Overview

### Data Flow

```
Client Request → Express Server → Middleware (Optional) → Endpoint Handler → Service → Repository → Database
```

### Key Principles

1. **Separation of Concerns**: Endpoints orchestrate, services process, repositories handle data
2. **Single Responsibility**: Each file exports one function with a clear purpose
3. **Repository Pattern**: All database access goes through repositories
4. **Functional Programming**: Pure functions, single exit points, immutability where possible
5. **Type Safety via Validation**: Runtime validation using VSL specs

---

## Programming Conventions

### File Naming

- **Verb-based names** for files that export functions (e.g., `create-user.js`, `validate-token.js`)
- **Noun-based names** for configuration/data files (e.g., `user.js` for models)
- **kebab-case** for all filenames
- Export name should match filename (e.g., `create-user.js` exports `createUser`)

### Code Conventions

- **camelCase** for functions and variables
- **PascalCase** for model exports and classes
- **snake_case** for request/response payloads and database fields
- **SCREAMING_SNAKE_CASE** for constants

### Path Aliases

- `@app-core/*` - Core utilities and libraries
- `@app/*` - Application code (services, repositories, messages, middlewares)

---

## Core Modules (`@app-core`)

The `core` folder contains reusable utilities and abstractions. **Never modify core modules without team discussion.**

### 🪵 Logging

Use `appLogger` for all logging. **Never use `console.log`**.

```javascript
const { appLogger } = require('@app-core/logger');

// Usage
appLogger.info({ data }, 'log-key');
appLogger.warn({ data }, 'log-key');
appLogger.error({ data }, 'log-key');
appLogger.errorX({ data }, 'critical-error-key'); // For critical errors with special formatting
```

**Time Logging** for performance measurement:

```javascript
const { TimeLogger } = require('@app-core/logger');

const timeLogger = new TimeLogger('service-name');
timeLogger.start('operation-name');
// ... code to measure
timeLogger.end('operation-name'); // Logs duration automatically
```

### 🔐 Security

Hash and validate sensitive data:

```javascript
const { hash } = require('@app-core/security');

// Supported: 'md5', 'sha1', 'sha256', 'sha512', 'bcrypt'
const hashedPassword = await hash.create('myPassword123', 'bcrypt');
const isValid = await hash.validate('myPassword123', hashedPassword, 'bcrypt'); // true
```

### 🎲 Randomness & UUIDs

```javascript
const { randomBytes, randomNumbers, ulid, uuid } = require('@app-core/randomness');

const id = ulid(); // ULID string (26 chars) - use for all record IDs
const randomHex = randomBytes(12); // "a1b2c3d4e5f6"
const randomNum = randomNumbers(1, 100); // Random number between 1-100
```

### ⚙️ Handlebars Templating

```javascript
const { parse, render } = require('@app-core/handlebars');

const template = parse('Hello, {{name}}! Welcome to {{place}}.');
const result = render(template, { name: 'Alex', place: 'our app' });
// "Hello, Alex! Welcome to our app."
```

### 🌐 HTTP Requests

```javascript
const HttpRequest = require('@app-core/http-request');

// Direct usage
const data = await HttpRequest.get('https://api.example.com/data');

// With base URL (recommended for services)
const apiClient = HttpRequest.initialize({
  baseUrl: 'https://api.example.com',
});
const users = await apiClient.get('/users');
```

### 🚨 Error Handling

**CRITICAL**: All errors must use `throwAppError` with messages from `messages/` files.

```javascript
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { IdentityManagementMessages } = require('@app/messages');

if (!user) {
  throwAppError(IdentityManagementMessages.USER_NOT_FOUND, ERROR_CODE.NOTFOUND);
}
```

**Available Error Codes**:
- `AUTHERR` - Authentication error
- `NOAUTHERR` - No authentication provided
- `INVLDAUTHTOKEN` - Invalid auth token
- `INACTIVEACCT` - Inactive account
- `EXPIREDTOKEN` - Expired token
- `INVLDREQ` - Invalid request
- `PERMERR` - Permission error
- `LIMITERR` - Rate limit error
- `FEEERR` - Fee calculation error
- `NOTFOUND` - Resource not found
- `APPERR` - Application error
- `HTTPREQERR` - HTTP request error
- `DUPLRCRD` - Duplicate record
- `VALIDATIONERR` - Validation error
- `INVLDDATA` - Invalid data

### ✅ Validator

**VSL Syntax** (Validation Specification Language)

**Structure**: `root { ... }` with space before brace

```javascript
const validator = require('@app-core/validator');

const spec = `root { // User registration
  email string<trim|lowercase|isEmail>
  password string<minLength:8|maxLength:128>
  first_name string<trim|minLength:2|maxLength:35>
  last_name string<trim|minLength:2|maxLength:35>
  age? number<min:18|max:120>
  status string(active|inactive|pending)
  roles[] string(admin|user|moderator)
}`;

const parsedSpec = validator.parse(spec);

function myService(serviceData) {
  const data = validator.validate(serviceData, parsedSpec); // Throws on invalid
  // ... use validated data
}
```

**Field Syntax**:
- `field type` - Required field
- `field? type` - Optional field
- `field[] type` - Required array
- `field[]? type` - Optional array
- `field { ... }` - Nested object
- `field[] { ... }` - Array of objects

**Types**: `string`, `number`, `boolean`, `object`, `any`

**Constraints**:

```javascript
// Numeric
min:value, max:value, between:min,max

// String Length
length:value, minLength:value, maxLength:value, lengthBetween:min,max

// String Patterns
startsWith:prefix, endsWith:suffix

// String Transforms
trim, lowercase, uppercase

// Format Validation
isEmail, timestampToHex

// Database Constraints (models only)
isUnique, indexed

// Enums (preferred shorthand)
status string(pending|approved|rejected)
// Alternative: status string<isAnyOf:pending,approved,rejected>
```

**Constraint Order**: transforms → length → format → enums

**Examples**:

```javascript
// Basic
email string<trim|lowercase|isEmail>
currency string<length:3|uppercase>  // USD, EUR, GBP
age? number<min:13|max:120>

// Advanced
api_key string<startsWith:sk_|length:32>
filename string<endsWith:.pdf>
score number<between:0,100>
description string<trim|lengthBetween:10,500>

// Nested objects
profile? {
  name string<trim|minLength:1>
  settings {
    theme string(light|dark|auto)
    notifications boolean
  }
}
```

### 💾 Mongoose Helper

```javascript
const { createSession } = require('@app-core/mongoose');

// For transactions
const session = await createSession();
await session.startTransaction();
// ... database operations
await session.commitTransaction();
await session.endSession();
```

---

## Services (`@app/services`)

Services contain all business logic. They are **pure functions** that process data.

### Service Structure

**Location**: `services/[feature-group]/[service-name].js`

**Critical Requirements**:

1. ✅ **Two Parameters Only**: `(serviceData, options = {})`
2. ✅ **Validation First**: Always validate input before any logic
3. ✅ **Single Exit Point**: One `return` statement
4. ✅ **Error Handling**: Use `throwAppError` with messages from `messages/`

### Basic Service Example

```javascript
const validator = require('@app-core/validator');
const { hash } = require('@app-core/security');
const Identity = require('@app/repository/identity-management/identity');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { IdentityManagementMessages } = require('@app/messages');

const spec = `root {
  email string<trim|lowercase|isEmail>
  password string<minLength:8|maxLength:128>
  first_name string<trim|minLength:2|maxLength:35>
  last_name string<trim|minLength:2|maxLength:35>
}`;

const parsedSpec = validator.parse(spec);

async function createIdentity(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    // Check for existing user
    const existingUser = await Identity.findOne({
      query: { email: data.email },
    });

    if (existingUser) {
      throwAppError(
        IdentityManagementMessages.EMAIL_ALREADY_EXISTS,
        ERROR_CODE.DUPLRCRD
      );
    }

    // Hash password
    data.password = await hash.create(data.password, 'bcrypt');

    // Create user
    const user = await Identity.create(data);

    result = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  } catch (error) {
    appLogger.errorX(error, 'create-identity-error');
    throw error;
  }

  return result; // Single exit point
}

module.exports = createIdentity;
```

### Transaction Pattern

**When to Use Transactions**:
- Multi-table operations (user + profile + auth)
- Financial operations (payment + ledger + balance)
- Any operation where partial failure creates invalid state

**Pattern**:

```javascript
const { createSession } = require('@app-core/mongoose');
const { appLogger } = require('@app-core/logger');

async function serviceWithTransaction(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  // Determine session ownership
  let sessionToUse;
  let isSessionNative = false;

  if (options.session) {
    sessionToUse = options.session; // Use passed session
    isSessionNative = false;
  } else {
    sessionToUse = await createSession(); // Create own session
    isSessionNative = true;
  }

  try {
    // Only start transaction if we created the session
    if (isSessionNative) {
      sessionToUse.startTransaction();
    }

    // All database operations use the session
    const record1 = await Repository1.create(data1, { session: sessionToUse });
    const record2 = await Repository2.create(data2, { session: sessionToUse });

    // Call other services, passing the session
    const relatedData = await otherService(otherPayload, { session: sessionToUse });

    // Only commit if we own the session
    if (isSessionNative) {
      await sessionToUse.commitTransaction();
    }

    result = { record1, record2, relatedData };
  } catch (error) {
    // Only abort if we own the session
    if (isSessionNative) {
      await sessionToUse.abortTransaction();
    }
    appLogger.errorX(error, 'service-transaction-error');
    throw error;
  } finally {
    // Only end session if we own it
    if (isSessionNative) {
      await sessionToUse.endSession();
    }
  }

  return result;
}
```

**Transaction Exceptions** (DO NOT use transactions):
- Authentication services (logs must persist on failure)
- Audit logging
- Rate limiting
- Security monitoring
- Webhook delivery logs

---

## Data Layer (`@app/repository`)

**Repository Pattern**: All database access goes through repositories.

### Model Definition

**Location**: `models/[model-name].js` (singular form of collection)

```javascript
const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');
const timestamps = require('./plugins/timestamps');

const modelName = 'identities'; // Plural, camelCase

const schemaConfig = {
  _id: { type: SchemaTypes.ULID }, // Always use ULID for IDs
  email: { type: SchemaTypes.String, unique: true, index: true },
  first_name: { type: SchemaTypes.String },
  last_name: { type: SchemaTypes.String },
  status: { type: SchemaTypes.String, index: true },
  // Never add: required: true (validation is in services)
  // Never add: enum: [] (validation is in services)
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });
modelSchema.plugin(timestamps); // Adds created, updated, deleted

module.exports = DatabaseModel.model(modelName, modelSchema, { paranoid: true });
```

**Export in `models/index.js`** (PascalCase):

```javascript
const Identity = require('./identity');
module.exports = { Identity };
```

### Model Constraints Rules

**CRITICAL**: Only database-level constraints go in models:

✅ **Allowed in Models**:
- `unique: true` (from spec's `<isUnique>`)
- `index: true` (from spec's `<indexed>`)
- `default: value`

❌ **NOT Allowed in Models**:
- `required: true` (validate in service)
- `enum: []` (validate in service)
- `minLength`, `maxLength` (validate in service)

### Repository Creation

**Location**: `repository/[model-name]/index.js`

```javascript
const repositoryFactory = require('@app-core/repository-factory');

// Must match model name from models/index.js (PascalCase)
module.exports = repositoryFactory('Identity', {});
```

### Repository Methods

```javascript
const Identity = require('@app/repository/identity-management/identity');

// Find one record
const user = await Identity.findOne({
  query: { email: 'user@example.com' },
  options: { projection: { password: 0 } }, // Optional
});

// Find many records
const users = await Identity.findMany({
  query: { status: 'active' },
  options: {
    limit: 20,
    sort: { created: -1 },
    projection: { password: 0 },
  },
});

// Create single record
const newUser = await Identity.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  // _id is auto-generated, never set it manually
});

// Create with session (for transactions)
const newUser = await Identity.create({
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
}, { session }); // Pass session as second parameter

// Create multiple records
const users = await Identity.createMany({
  entries: [
    { email: 'user1@example.com', first_name: 'John' },
    { email: 'user2@example.com', first_name: 'Jane' },
  ],
});

// Create multiple with session
const users = await Identity.createMany({
  entries: [
    { email: 'user1@example.com', first_name: 'John' },
    { email: 'user2@example.com', first_name: 'Jane' },
  ],
  options: { session }, // Session goes in options object
});

// Update one record
await Identity.updateOne({
  query: { _id: userId },
  updateValues: { status: 'inactive' },
});

// Update with session (for transactions)
await Identity.updateOne({
  query: { _id: userId },
  updateValues: { status: 'inactive' },
  options: { session }, // Session goes in options object
});

// Update many records
await Identity.updateMany({
  query: { status: 'pending' },
  updateValues: { status: 'active' },
});

// Update many with session
await Identity.updateMany({
  query: { status: 'pending' },
  updateValues: { status: 'active' },
  options: { session }, // Session goes in options object
});

// Delete one record (soft delete with paranoid: true)
await Identity.deleteOne({ query: { _id: userId } });

// Delete with session (for transactions)
await Identity.deleteOne({
  query: { _id: userId },
  options: { session }, // Session goes in options object
});

// Access raw Mongoose model (use sparingly, mainly for aggregations)
const IdentityModel = Identity.raw('Identity');
const stats = await IdentityModel.aggregate([...]);
```

**Session Handling in Repositories**:
- `create(data, options)` - Session as second parameter: `{ session }`
- `createMany({ entries, options })` - Session in options: `options: { session }`
- `updateOne({ query, updateValues, options })` - Session in options
- `updateMany({ query, updateValues, options })` - Session in options
- `deleteOne({ query, options })` - Session in options

---

## Endpoints

Endpoints orchestrate the request-response cycle. Keep them thin—delegate to services.

### Endpoint Structure

**Location**: `endpoints/[resource]/[action-name].js`

```javascript
const { createHandler } = require('@app-core/server');
const { validateClient } = require('@app/middlewares');
const createIdentityService = require('@app/services/identity-management/create-identity');

module.exports = createHandler({
  path: '/identities',
  method: 'post', // 'get', 'post', 'put', 'patch', 'delete'
  middlewares: [validateClient], // Optional
  props: {
    // Optional properties accessible in middlewares/handler
    rateLimit: { max: 5, window: '1m' },
  },
  async handler(rc, helpers) {
    // Prepare payload from request context (rc)
    const payload = {
      ...rc.body,
      ip: rc.properties.IP,
      client_id: rc.meta.client._id,
      user_agent: rc.properties.userAgent,
    };

    // Call service
    const responseData = await createIdentityService(payload);

    // Return response
    return {
      status: helpers.http_statuses.HTTP_201_CREATED,
      message: 'Identity created successfully',
      data: responseData,
    };
  },
});
```

**Request Context (`rc`) Properties**:
- `rc.body` - Request body (POST/PUT/PATCH)
- `rc.query` - Query parameters (GET)
- `rc.params` - Path parameters (:id)
- `rc.headers` - Request headers
- `rc.properties` - Server-injected properties (IP, userAgent, etc.)
- `rc.meta` - Data added by middlewares (user, client, etc.)
- `rc.props` - Endpoint props defined in createHandler

### Admin Endpoint Pattern

**CRITICAL**: Admin endpoints require specific structure:

```javascript
const { createHandler } = require('@app-core/server');
const { verifySession, verifyAdmin } = require('@app/middlewares');
const adminService = require('@app/services/admin/admin-service');

module.exports = createHandler({
  method: 'get',
  path: '/admin-resource',
  middlewares: [verifySession, verifyAdmin], // BOTH required
  props: {
    allowedAuthMethods: { jwt: true, sk: false }, // JWT only
    acl: {
      can_view_resource: true, // ACL permission key
    },
  },
  async handler(rc, helpers) {
    const payload = rc.query; // Use rc.query for GET, rc.body for POST/PATCH

    const responseData = await adminService(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Resource fetched successfully', // Always include message
      data: responseData,
    };
  },
});
```

### Endpoint Registration

**In `app.js`**:

```javascript
const ENDPOINT_CONFIGS = [
  { path: './endpoints/identity-management/' },
  { path: './endpoints/account-management/' },
  { path: './endpoints/admin/' },
];
```

---

## Middlewares

Middlewares run before endpoint handlers for cross-cutting concerns.

### Middleware Structure

**Location**: `middlewares/[middleware-name].js`

```javascript
const { createHandler } = require('@app-core/server');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const AuthenticationMessages = require('@app/messages/authentication');
const verifyTokenService = require('@app/services/identity-management/verify-token');

module.exports = createHandler({
  path: '*', // Can use glob patterns or specific paths
  async handler(rc) {
    const token = rc.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throwAppError(AuthenticationMessages.MISSING_TOKEN, ERROR_CODE.NOAUTHERR);
    }

    const user = await verifyTokenService({ token });

    // Augment request context for subsequent handlers
    return {
      augments: {
        meta: { user }, // Available as rc.meta.user in endpoint
      },
    };
  },
});
```

**Export in `middlewares/index.js`**:

```javascript
const validateClient = require('./validate-client');
const verifySession = require('./verify-session');
const verifyAdmin = require('./verify-admin');

module.exports = {
  validateClient,
  verifySession,
  verifyAdmin,
};
```

---

## Specs Folder

The `specs/` folder contains VSL validation specs and endpoint specifications.

### Structure

```
specs/
  [servicegroup]/
    data/
      [service].go           # VSL data validation specs
    endpoint/
      [service].endpoint.go  # Extended VSL endpoint specs
```

**Note**: `.go` extension is for syntax highlighting, not actual Go code.

### Data Spec Example

`specs/identity-management/data/create-identity.go`:

```javascript
root { // Identity creation validation
  email string<trim|lowercase|isEmail>
  password string<minLength:8|maxLength:128>
  first_name string<trim|minLength:2|maxLength:35>
  last_name string<trim|minLength:2|maxLength:35>
  middle_name? string<trim|minLength:2|maxLength:35>
  phonenumber? string<minLength:10|maxLength:14>
}
```

### Endpoint Spec Example

`specs/identity-management/endpoint/create-identity.endpoint.go`:

```javascript
CreateIdentityRequest {
  path /identities
  method POST
  body {
    email string<trim|lowercase|isEmail>
    password string<minLength:8|maxLength:128>
    first_name string<trim|minLength:2|maxLength:35>
    last_name string<trim|minLength:2|maxLength:35>
  }
  response.ok {
    http.code 201
    status successful
    message "Identity created successfully"
    data {
      identity {
        id string<length:26>
        email string
        first_name string
        last_name string
        created number
      }
    }
  }
  response.error {
    http.code 400
    status error
    message "Validation failed"
    data {
      errors[] {
        field string
        message string
        code string
      }
    }
  }
}
```

---

## Error Handling

### Message Files

**Location**: `messages/[resource].js`

```javascript
module.exports = {
  USER_NOT_FOUND: 'User with the provided credentials not found',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  INVALID_PASSWORD: 'Password must be at least 8 characters',
  ACCOUNT_INACTIVE: 'Your account has been deactivated',
};
```

**Export in `messages/index.js`**:

```javascript
const IdentityManagementMessages = require('./identity-management');
const AuthenticationMessages = require('./authentication');

module.exports = {
  IdentityManagementMessages,
  AuthenticationMessages,
};
```

### Throwing Errors

```javascript
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { IdentityManagementMessages } = require('@app/messages');

// Always throw with message from messages file + error code
throwAppError(IdentityManagementMessages.USER_NOT_FOUND, ERROR_CODE.NOTFOUND);
```

---

## Logging

### Application Logging

```javascript
const { appLogger } = require('@app-core/logger');

// Info logs
appLogger.info({ userId, action: 'login' }, 'user-login-success');

// Warning logs
appLogger.warn({ userId, attempts: 3 }, 'user-login-attempts-warning');

// Error logs
appLogger.error({ error, userId }, 'user-login-error');

// Critical error logs (special formatting)
appLogger.errorX({ error, context: 'payment-processing' }, 'critical-payment-error');
```

### Performance Logging

```javascript
const { TimeLogger } = require('@app-core/logger');

const timeLogger = new TimeLogger('create-identity-service');

timeLogger.start('validate-input');
// ... validation code
timeLogger.end('validate-input');

timeLogger.start('database-query');
// ... database operations
timeLogger.end('database-query');

// Automatically logs: "create-identity-service.validate-input: 12ms"
```

---

## Code Quality Rules

### Strict Requirements

1. ✅ **Single Exit Point**: Functions must have exactly one `return` statement
2. ✅ **No console.log**: Always use `appLogger`
3. ✅ **Object Parameters**: Services accept one object, not multiple parameters
4. ✅ **Validation First**: Validate input before any business logic
5. ✅ **Pure Functions**: Services should be predictable and side-effect free where possible
6. ✅ **DRY Principle**: Don't repeat yourself—extract common logic
7. ✅ **Error Messages from Files**: Never hardcode error messages
8. ✅ **Single File Responsibility**: One exported function per file
9. ✅ **No System Commands**: Never execute bash/git commands unless explicitly requested
10. ✅ **No Package Management**: Never run npm/yarn unless explicitly requested

### Service Composition

Services should handle their complete business domain. If an operation naturally triggers related operations (e.g., profile creation → contact creation), implement these cascades within the responsible service, not in calling services.

**Example**:

```javascript
// ✅ GOOD: Cascade handled in service
async function createProfile(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  let result;

  try {
    const profile = await Profile.create(data);
    
    // Service handles related operations
    if (data.contacts) {
      await createContacts({ profile_id: profile._id, contacts: data.contacts });
    }

    result = profile;
  } catch (error) {
    appLogger.errorX(error, 'create-profile-error');
    throw error;
  }

  return result;
}

// ❌ BAD: Cascade handled in calling code (endpoint/other service)
// This violates single responsibility and creates duplication
```

---

## Best Practices

### Think Top-Down

1. **Current Needs**: What does this feature need now?
2. **Future Requirements**: What might change?
3. **Breaking Points**: Where could this fail?

### Architecture Principles

- ✅ Keep business logic in **services**, not endpoints
- ✅ Use **middleware** for cross-cutting concerns (auth, validation, logging)
- ✅ Use **repository pattern** for all database operations
- ✅ Consistent **error handling** and **logging** throughout
- ✅ Follow **established patterns** for imports and module structure

### Code Organization

- ✅ One function per file
- ✅ Single responsibility per file
- ✅ Group related services by feature (e.g., `services/identity-management/`)
- ✅ Utility functions in `services/utils/`

### Validation Best Practices

- ✅ Always include space between `root` and `{` in specs: `root { ... }`
- ✅ Parse specs once at module level, reuse in function
- ✅ Validate at service entry point, not in endpoints
- ✅ Use constraint order: transforms → length → format → enums

### Transaction Best Practices

- ✅ Use transactions for multi-table operations
- ✅ Pass sessions through service calls via `options.session`
- ✅ Only session creator manages lifecycle (start/commit/abort/end)
- ❌ Don't use transactions for logging or audit trails

### Security Best Practices

- ✅ Hash all passwords with bcrypt
- ✅ Use ULID for all record IDs
- ✅ Validate and sanitize all inputs
- ✅ Never expose internal error details to clients
- ✅ Use environment variables for secrets

---

## Quick Reference

### Project Structure

```
├── app.js                    # Entry point
├── bootstrap.js              # App initialization
├── core/                     # @app-core modules
│   ├── errors/
│   ├── jwt/
│   ├── logger/
│   ├── mongoose/
│   ├── security/
│   ├── validator/
│   └── ...
├── endpoints/                # API routes
│   ├── identity-management/
│   ├── account-management/
│   └── admin/
├── services/                 # Business logic
│   ├── identity-management/
│   ├── account-management/
│   └── utils/
├── models/                   # Mongoose schemas
├── repository/               # Data access layer
├── middlewares/              # Request interceptors
├── messages/                 # Error messages
├── specs/                    # Validation specs
│   └── [servicegroup]/
│       ├── data/
│       └── endpoint/
└── docs/                     # Documentation
```

### Common Imports

```javascript
// Validation
const validator = require('@app-core/validator');

// Error handling
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { IdentityManagementMessages } = require('@app/messages');

// Security
const { hash } = require('@app-core/security');

// Logging
const { appLogger, TimeLogger } = require('@app-core/logger');

// IDs
const { ulid } = require('@app-core/randomness');

// Database
const Identity = require('@app/repository/identity-management/identity');
const { createSession } = require('@app-core/mongoose');

// Server
const { createHandler } = require('@app-core/server');
```

---

## Getting Started

### Prerequisites

- **Node.js** v16+ and npm installed
- **MongoDB** instance running (local or remote)
- **Environment variables** configured

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure required variables:
   ```bash
   # Server Configuration
   PORT=3000
   APP_BASE_URL=http://localhost:3000
   APP_NAME=YourAppName

   # Database
   MONGODB_URI=mongodb://localhost:27017/your_database

   # JWT Authentication
   JWT_SECRET=your-secret-key-here
   JWT_DEFAULT_EXPIRY=3600

   # Security
   HASH_SALT_ROUNDS=10

   # Email (if using email features)
   RESEND_TOKEN=your-resend-api-key
   RESEND_SENDER_ADDRESS=noreply@yourdomain.com

   # Add other required environment variables...
   ```

4. **Start the development server**:
   ```bash
   node bootstrap.js
   ```
   
   The server will start on the port specified in your `.env` file (default: 3000).

### Development Commands

```bash
# Start development server
node bootstrap.js

# Run tests
npm test

# Sync environment files
npm run sync-envs
```

### Verify Installation

Once the server is running, you should see:
```
Server listening on port 3000
MongoDB connected successfully
```

Test the server by accessing the application:
```bash
curl http://localhost:3000
```

---

## Need Help?

- Check existing services in `services/` for patterns
- Review specs in `specs/` for validation examples
- Read endpoint implementations in `endpoints/`

---

**Version**: 2.0  
**Last Updated**: November 2025
