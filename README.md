# Assessment Codebase Guide

This guide will help you understand the codebase architecture and set up your services, endpoints, and middleware correctly. This is NOT a solution to the assessment - it's a reference guide to help you implement your own solution following the codebase conventions.

> 📖 **For comprehensive architecture documentation, see [documentation.md](./documentation.md)**

---

## Table of Contents

1. [Project Architecture Overview](#project-architecture-overview)
2. [Setting Up a Service](#setting-up-a-service)
3. [Creating an Endpoint](#creating-an-endpoint)
4. [Using Middleware (Optional)](#using-middleware-optional)
5. [Error Handling](#error-handling)
6. [Testing Your Implementation](#testing-your-implementation)
7. [Common Pitfalls](#common-pitfalls)

---

## Project Architecture Overview

The codebase follows a layered architecture:

```
Request → Endpoint → Middleware (optional) → Service → Repository → Database
```

**Key Principles:**
- **Endpoints** handle HTTP routing and orchestrate service calls
- **Services** contain business logic and validation
- **Repositories** handle database operations (not needed for assessment)
- **Middleware** handles cross-cutting concerns (auth, logging, etc.)

**Path Aliases:**
- `@app-core/*` - Core utilities (logger, validator, errors, etc.)
- `@app/services/*` - Business logic services
- `@app/messages/*` - Error message definitions
- `@app/middlewares/*` - Middleware functions

> 💡 **For detailed information about core modules, repositories, and advanced patterns, see [documentation.md](./documentation.md)**

---

## Setting Up a Service

Services are the "workhorse" of the application. They contain all business logic and validation.

### Service Structure

**Location:** `services/[feature-group]/[service-name].js`

**Example:** `services/payment-processor/parse-instruction.js`

### Service Template

```javascript
const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const PaymentMessages = require('@app/messages/payment'); // Your message file

// Step 1: Define your validation spec
const spec = `root {
  accounts[] {
    id string
    balance number
    currency string
  }
  instruction string
}`;

// Step 2: Parse the spec once (outside the function)
const parsedSpec = validator.parse(spec);

// Step 3: Define your service function
async function parseInstruction(serviceData, options = {}) {
  let response;

  // Step 4: Validate input data
  const data = validator.validate(serviceData, parsedSpec);

  try {
    // Step 5: Implement your business logic
    const instruction = data.instruction.trim();
    const accounts = data.accounts;

    // Your parsing logic here...
    // Example: Extract keywords, validate, process

    // Build your response
    response = {
      type: 'DEBIT',
      amount: 100,
      currency: 'USD',
      debit_account: 'a',
      credit_account: 'b',
      execute_by: null,
      status: 'successful',
      status_reason: 'Transaction executed successfully',
      status_code: 'AP00',
      accounts: processedAccounts,
    };
  } catch (error) {
    appLogger.errorX(error, 'parse-instruction-error');
    throw error;
  }

  // Step 6: Single exit point - return response
  return response;
}

// Step 7: Export the function
module.exports = parseInstruction;
```

### Validator Spec Syntax (VSL)

The validator uses a custom DSL (Domain Specific Language) called VSL.

**Basic Syntax:**
```javascript
const spec = `root { // Description (optional)
  fieldName type
  optionalField? type
  arrayField[] type
  nestedObject {
    innerField type
  }
}`;
```

**Important:** Always include a **space** between `root` and `{`

**Available Types:**
- `string` - Text values
- `number` - Numeric values (integers or decimals)
- `boolean` - true/false values
- `object` - Nested objects
- `any` - Any type

**Field Modifiers:**
- `field type` - Required field
- `field? type` - Optional field
- `field[] type` - Required array
- `field[]? type` - Optional array

**Constraints:**

Constraints are added with angle brackets: `<constraint1|constraint2>`

```javascript
// String constraints
string<trim>                           // Remove leading/trailing spaces
string<lowercase>                      // Convert to lowercase
string<uppercase>                      // Convert to uppercase
string<minLength:8>                    // Minimum length
string<maxLength:100>                  // Maximum length
string<length:26>                      // Exact length
string<lengthBetween:5,50>            // Length range
string<startsWith:prefix>             // Must start with
string<endsWith:.pdf>                 // Must end with
string<isEmail>                       // Email validation

// Numeric constraints
number<min:0>                         // Minimum value
number<max:1000>                      // Maximum value
number<between:1,100>                 // Value range

// Enums (preferred shorthand)
status string(pending|approved|rejected)

// Multiple constraints (order matters: transforms → length → format → enums)
email string<trim|lowercase|isEmail>
code string<uppercase|length:3>
```

**Example Specs:**

```javascript
// Simple flat structure
const spec1 = `root {
  name string<trim|minLength:1>
  email string<trim|lowercase|isEmail>
  age? number<min:18|max:120>
  status string(active|inactive)
}`;

// Nested structure
const spec2 = `root {
  user {
    id string<length:26>
    profile {
      name string<trim>
      email string<trim|lowercase|isEmail>
    }
  }
  settings {
    theme string(light|dark)
    notifications boolean
  }
}`;

// Arrays
const spec3 = `root {
  accounts[] {
    id string
    balance number<min:0>
    currency string<uppercase|length:3>
  }
  tags[]? string<trim|minLength:1>
}`;
```

### Service Constraints (CRITICAL)

**1. Two Parameters Only:**
```javascript
async function myService(serviceData, options = {}) {
  // serviceData: all input data as a single object
  // options: optional configuration (defaults to {})
}
```

**2. Input Validation First:**
```javascript
const data = validator.validate(serviceData, parsedSpec);
// Validation must be the FIRST step
```

**3. Single Exit Point:**
```javascript
async function myService(serviceData, options = {}) {
  let response; // Declare at top
  
  // ... logic ...
  
  return response; // Only ONE return statement
}
```

**4. Error Handling:**
```javascript
// Always use throwAppError with message files
if (invalidCondition) {
  throwAppError(MessageFile.ERROR_MESSAGE, ERROR_CODE.INVLDDATA);
}
```

### Creating Message Files

**Location:** `messages/[resource].js`

**Example:** `messages/payment.js`

```javascript
const PaymentMessages = {
  INVALID_AMOUNT: 'Amount must be a positive integer',
  CURRENCY_MISMATCH: 'Account currency mismatch',
  UNSUPPORTED_CURRENCY: 'Only NGN, USD, GBP, and GHS are supported',
  INSUFFICIENT_FUNDS: 'Insufficient funds in debit account',
  SAME_ACCOUNT_ERROR: 'Debit and credit accounts cannot be the same',
  ACCOUNT_NOT_FOUND: 'Account not found',
  INVALID_ACCOUNT_ID: 'Invalid account ID format',
  INVALID_DATE_FORMAT: 'Date must be in YYYY-MM-DD format',
  MISSING_KEYWORD: 'Missing required keyword',
  INVALID_KEYWORD_ORDER: 'Invalid keyword order',
  MALFORMED_INSTRUCTION: 'Malformed instruction',
  TRANSACTION_SUCCESSFUL: 'Transaction executed successfully',
  TRANSACTION_PENDING: 'Transaction scheduled for future execution',
};

module.exports = PaymentMessages;
```

**Register your message file** in `messages/index.js`:
```javascript
module.exports = {
  // ... existing messages
  PaymentMessages: require('./payment'),
};
```

---

## Creating an Endpoint

Endpoints define API routes and orchestrate service calls.

### Endpoint Structure

**Location:** `endpoints/[feature-group]/[endpoint-name].js`

**Example:** `endpoints/payment-instructions/process.js`

### Endpoint Template

```javascript
const { createHandler } = require('@app-core/server');
const parseInstruction = require('@app/services/payment-processor/parse-instruction');

module.exports = createHandler({
  // Step 1: Define the route
  path: '/payment-instructions',
  method: 'post', // 'get', 'post', 'put', 'patch', 'delete'

  // Step 2: Add middlewares (optional)
  middlewares: [], // Empty for no middleware

  // Step 3: Define props (optional)
  props: {
    // Custom properties accessible in middleware/handler
    // Example: ACL: { requiresAuth: false }
  },

  // Step 4: Define the handler
  async handler(rc, helpers) {
    // rc = request context
    // rc.body = POST/PUT/PATCH payload
    // rc.query = GET query parameters
    // rc.params = URL path parameters
    // rc.headers = HTTP headers
    // rc.meta = Data added by middleware

    // Step 5: Prepare service payload
    const payload = {
      ...rc.body, // For POST/PUT/PATCH
      // ...rc.query, // For GET
      // ...rc.params, // For path params like /resource/:id
    };

    // Step 6: Call your service
    const response = await parseInstruction(payload);

    // Step 7: Return response
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Instruction processed successfully', // Optional
      data: response,
    };
  },
});
```

### HTTP Status Codes

Available via `helpers.http_statuses`:

```javascript
// Success codes
HTTP_200_OK                    // General success
HTTP_201_CREATED              // Resource created
HTTP_204_NO_CONTENT           // Success with no content

// Client error codes
HTTP_400_BAD_REQUEST          // Validation errors
HTTP_401_UNAUTHORIZED         // Authentication required
HTTP_403_FORBIDDEN            // Permission denied
HTTP_404_NOT_FOUND           // Resource not found
HTTP_409_CONFLICT            // Duplicate resource

// Server error codes
HTTP_500_INTERNAL_SERVER_ERROR // General server error
HTTP_503_SERVICE_UNAVAILABLE   // Service down
```

**Usage Example:**
```javascript
// Success
return {
  status: helpers.http_statuses.HTTP_200_OK,
  data: result,
};

// Validation error (caught by error handler)
// Just throw the error, the framework handles the status code
throwAppError(Messages.INVALID_INPUT, ERROR_CODE.VALIDATIONERR);
```

### Registering Your Endpoint

**Step 1:** Create your endpoint folder structure
```
endpoints/
  payment-instructions/
    process.js        // Your endpoint file
```

**Step 2:** Add to `app.js`
```javascript
const ENDPOINT_CONFIGS = [
  // ... existing configs
  { path: './endpoints/payment-instructions/' }, // Add your folder
];
```

The framework will automatically load all `.js` files in the folder.

---

## Using Middleware (Optional)

Middleware runs before your endpoint handler. Use it for cross-cutting concerns like authentication, logging, or validation.

### When to Use Middleware

**Use middleware for:**
- Authentication/authorization
- Request logging
- Rate limiting
- Payload signature verification
- Input sanitization

**Don't use middleware for:**
- Business logic (belongs in services)
- Data transformations (belongs in services)
- Database operations (belongs in repositories)

### Middleware Structure

**Location:** `middlewares/[middleware-name].js`

**Example:** `middlewares/log-request.js`

```javascript
const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');

module.exports = createHandler({
  // Step 1: Define path pattern
  path: '*', // '*' = all routes, or specific pattern like '/api/*'

  // Step 2: Define handler
  async handler(rc, helpers) {
    // rc = request context
    // rc.props = endpoint props (from endpoint definition)

    // Step 3: Perform middleware logic
    appLogger.info(
      {
        method: rc.method,
        path: rc.path,
        body: rc.body,
      },
      'request-received'
    );

    // Step 4: Augment request context (optional)
    // Data added here becomes available in endpoint handler as rc.meta
    return {
      augments: {
        meta: {
          requestTime: Date.now(),
          // Add any data you want available in endpoint handler
        },
      },
    };
  },
});
```

### Using Middleware in Endpoints

```javascript
const { createHandler } = require('@app-core/server');
const logRequest = require('@app/middlewares/log-request');

module.exports = createHandler({
  path: '/payment-instructions',
  method: 'post',
  
  // Add middleware here
  middlewares: [logRequest],
  
  async handler(rc, helpers) {
    // Access data from middleware via rc.meta
    console.log('Request time:', rc.meta.requestTime);
    
    // Your handler logic...
  },
});
```

### Middleware Example: Simple Validator

```javascript
const { createHandler } = require('@app-core/server');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

module.exports = createHandler({
  path: '*',
  async handler(rc) {
    // Check if endpoint requires validation
    if (rc.props?.requiresValidation) {
      const contentType = rc.headers['content-type'];
      
      if (!contentType || !contentType.includes('application/json')) {
        throwAppError(
          'Content-Type must be application/json',
          ERROR_CODE.INVLDREQ
        );
      }
    }

    // Pass through without augments
    return {};
  },
});
```

**Register middleware** in `middlewares/index.js`:
```javascript
module.exports = {
  // ... existing middleware
  logRequest: require('./log-request'),
};
```

---

## Error Handling

The codebase has a centralized error handling system.

### Available Error Codes

From `@app-core/errors`:

```javascript
const { ERROR_CODE } = require('@app-core/errors');

// Authentication & Authorization
ERROR_CODE.AUTHERR           // Authentication error
ERROR_CODE.NOAUTHERR         // No authentication provided
ERROR_CODE.INVLDAUTHTOKEN    // Invalid auth token
ERROR_CODE.INACTIVEACCT      // Inactive account
ERROR_CODE.EXPIREDTOKEN      // Expired token
ERROR_CODE.PERMERR           // Permission error

// Request Errors
ERROR_CODE.INVLDREQ          // Invalid request
ERROR_CODE.INVLDDATA         // Invalid data
ERROR_CODE.VALIDATIONERR     // Validation error
ERROR_CODE.NOTFOUND          // Not found

// Business Errors
ERROR_CODE.DUPLRCRD          // Duplicate record
ERROR_CODE.LIMITERR          // Rate limit error
ERROR_CODE.FEEERR            // Fee error

// System Errors
ERROR_CODE.APPERR            // Application error
ERROR_CODE.HTTPREQERR        // HTTP request error
```

### Throwing Errors

**Always use `throwAppError`:**

```javascript
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const PaymentMessages = require('@app/messages/payment');

// Throw an error
if (!account) {
  throwAppError(PaymentMessages.ACCOUNT_NOT_FOUND, ERROR_CODE.NOTFOUND);
}

// The framework automatically converts this to appropriate HTTP response
```

### Error Response Format

The framework automatically formats errors:

```json
{
  "status": "error",
  "message": "Account not found",
  "code": "NOTFOUND"
}
```

---

## Testing Your Implementation

### Local Testing

**1. Start your server:**
```bash
npm run dev
```

> 💡 **For complete setup instructions, see the [Getting Started](./documentation.md#getting-started) section in documentation.md**

**2. Test with curl:**
```bash
curl -X POST http://localhost:3000/payment-instructions \
  -H "Content-Type: application/json" \
  -d '{
    "accounts": [
      {"id": "a", "balance": 230, "currency": "USD"},
      {"id": "b", "balance": 300, "currency": "USD"}
    ],
    "instruction": "DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
  }'
```

**3. Test with Postman or Thunder Client (VS Code extension)**

### Logging

Use the built-in logger (never use `console.log`):

```javascript
const { appLogger } = require('@app-core/logger');

// Info logging
appLogger.info({ data: 'some data' }, 'log-key');

// Warning
appLogger.warn({ issue: 'something' }, 'warning-key');

// Error
appLogger.error({ error: err }, 'error-key');

// Critical error (special formatting)
appLogger.errorX({ error: err }, 'critical-error-key');
```

### Debugging Tips

**1. Log your parsing steps:**
```javascript
appLogger.info({ instruction: instruction }, 'parsing-start');
appLogger.info({ parsed: parsedData }, 'parsing-complete');
```

**2. Validate incrementally:**
```javascript
// Check one thing at a time
if (!isValidAmount) {
  appLogger.warn({ amount }, 'invalid-amount');
  throwAppError(Messages.INVALID_AMOUNT, ERROR_CODE.INVLDDATA);
}
```

**3. Test edge cases:**
- Empty strings
- Extra whitespace
- Case variations
- Missing keywords
- Invalid formats

---

## Common Pitfalls

### 1. Validator Spec Formatting

❌ **Wrong:**
```javascript
const spec = `root{ // No space before brace
  name string
}`;
```

✅ **Correct:**
```javascript
const spec = `root { // Space before brace
  name string
}`;
```

### 2. Service Function Signature

❌ **Wrong:**
```javascript
async function myService(param1, param2, param3) {
  // Multiple individual parameters
}
```

✅ **Correct:**
```javascript
async function myService(serviceData, options = {}) {
  // Single object parameter + optional options
}
```

### 3. Multiple Return Statements

❌ **Wrong:**
```javascript
async function myService(serviceData, options = {}) {
  if (condition) {
    return result1;
  }
  return result2; // Multiple returns
}
```

✅ **Correct:**
```javascript
async function myService(serviceData, options = {}) {
  let response;
  
  if (condition) {
    response = result1;
  } else {
    response = result2;
  }
  
  return response; // Single return
}
```

### 4. Error Handling

❌ **Wrong:**
```javascript
throw new Error('Account not found'); // Plain Error
```

✅ **Correct:**
```javascript
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const Messages = require('@app/messages/payment');

throwAppError(Messages.ACCOUNT_NOT_FOUND, ERROR_CODE.NOTFOUND);
```

### 5. Logging

❌ **Wrong:**
```javascript
console.log('Processing payment'); // Don't use console.log
```

✅ **Correct:**
```javascript
const { appLogger } = require('@app-core/logger');
appLogger.info({ action: 'processing' }, 'payment-processing');
```

### 6. Validation Before Logic

❌ **Wrong:**
```javascript
async function myService(serviceData, options = {}) {
  // Business logic first
  const result = processData(serviceData);
  
  // Validation later
  const data = validator.validate(serviceData, parsedSpec);
}
```

✅ **Correct:**
```javascript
async function myService(serviceData, options = {}) {
  // Validation FIRST
  const data = validator.validate(serviceData, parsedSpec);
  
  // Then business logic
  const result = processData(data);
}
```

### 7. Path Aliases

❌ **Wrong:**
```javascript
const validator = require('../../core/validator');
const logger = require('../../../core/logger');
```

✅ **Correct:**
```javascript
const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
```

---

## Quick Reference

### File Structure for Assessment

```
services/
  payment-processor/
    parse-instruction.js       # Your parsing service

endpoints/
  payment-instructions/
    process.js                 # Your API endpoint

messages/
  payment.js                   # Your error messages
```

### Minimal Service Template

```javascript
const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const Messages = require('@app/messages/payment');

const spec = `root {
  // Your spec here
}`;

const parsedSpec = validator.parse(spec);

async function myService(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);
  
  // Your logic here
  
  return response;
}

module.exports = myService;
```

### Minimal Endpoint Template

```javascript
const { createHandler } = require('@app-core/server');
const myService = require('@app/services/my-group/my-service');

module.exports = createHandler({
  path: '/my-path',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = rc.body;
    const response = await myService(payload);
    
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      data: response,
    };
  },
});
```

---

## Additional Resources

### Documentation

- **[documentation.md](./documentation.md)** - Complete architecture guide covering:
  - All core modules and their usage
  - Comprehensive validator syntax reference
  - Repository patterns and methods
  - Transaction handling
  - Model definitions and constraints
  - Complete endpoint examples
  - Best practices and code quality rules

### Core Utilities

```javascript
// Logger
const { appLogger } = require('@app-core/logger');
appLogger.info(data, 'log-key');
appLogger.error(data, 'error-key');

// Errors
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
throwAppError(message, ERROR_CODE.INVLDDATA);

// Validator
const validator = require('@app-core/validator');
const spec = validator.parse(specString);
const data = validator.validate(inputData, spec);

// Randomness (if needed)
const { ulid, uuid, randomNumbers } = require('@app-core/randomness');
const id = ulid(); // Generate unique ID

// Security (if needed)
const { hash, redact } = require('@app-core/security');
const hashed = await hash.create('password', 'bcrypt');
```

### String Manipulation (No Regex Allowed)

For the assessment, you can only use basic string methods:

```javascript
// Allowed
.split(' ')           // Split by string
.indexOf('keyword')   // Find position
.substring(start, end) // Extract substring
.slice(start, end)    // Extract substring
.trim()               // Remove whitespace
.toLowerCase()        // Convert to lowercase
.toUpperCase()        // Convert to uppercase
.replace('old', 'new') // Replace string with string
.startsWith('prefix')
.endsWith('suffix')
.includes('substring')

// NOT allowed (uses regex)
.match(/pattern/)
.split(/pattern/)
.replace(/pattern/, 'replacement')
.test()
```

---

## Final Tips

1. **Read the [documentation.md](./documentation.md)** - Complete architecture documentation and conventions
2. **Follow the single responsibility principle** - One service = one purpose
3. **Validate early** - Catch errors as soon as possible
4. **Log important steps** - Makes debugging easier
5. **Test incrementally** - Don't write everything at once
6. **Use the correct error codes** - Map validation failures to appropriate codes
7. **Keep services pure** - No side effects, predictable outputs
8. **Use path aliases** - Makes imports cleaner and easier to maintain

---

**Good luck with your assessment!** 🚀

Remember: This guide shows you HOW to structure your code, not WHAT logic to implement. The problem-solving is up to you!
