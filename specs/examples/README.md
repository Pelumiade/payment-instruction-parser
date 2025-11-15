# Specs Examples

This directory contains example specs that demonstrate the VSL (Validation Specification Language) syntax and patterns used throughout the project.

## Directory Structure

```
specs/examples/
├── commons.go                     # Common fields shared across models
├── data/                          # Model definitions
│   ├── create-identity.go         # Identity/User model
│   ├── create-product.go          # Product model with nested objects
│   ├── advanced-validation.go     # UserProfile model (complex example)
│   └── mood.go                    # Mood model (simple example)
└── endpoint/                      # Endpoint specifications
    ├── create-identity.endpoint.go
    ├── login.endpoint.go
    ├── get-products.endpoint.go
    └── update-profile.endpoint.go
```

## File Naming Convention

- **Data specs**: `[model-name].go` (e.g., `identity.go`, `mood.go`)
- **Endpoint specs**: `[endpoint-name].endpoint.go` (e.g., `create-identity.endpoint.go`)
- **Commons file**: `commons.go` - Contains shared fields that can be imported
- **Extension**: `.go` is used for syntax highlighting only, these are not Go files

## VSL Syntax Quick Reference

### Model Definition Structure

```javascript
import ../commons.go

ModelName {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  field_name type<constraints> // Field comment explaining purpose
  ...common // Spread common fields (created, updated, deleted)
}
```

### Validation Structure (in endpoint specs)

```javascript
root { // Comment describing the validation
  field_name type<constraints>
}
```

### Field Modifiers

- `field` - Required field
- `field?` - Optional field
- `field[]` - Required array
- `field[]?` - Optional array
- `field { ... }` - Nested object
- `field[] { ... }` - Array of objects

### Data Types

- `string` - String values
- `number` - Numeric values
- `boolean` - Boolean values (true/false)
- `object` - Generic object
- `any` - Any type

### Common Constraints

#### String Transforms
```javascript
email string<trim|lowercase|isEmail>
name string<trim|uppercase>
```

#### String Length
```javascript
username string<minLength:3|maxLength:20>
bio string<lengthBetween:10,500>
country_code string<length:2>
```

#### String Patterns
```javascript
api_key string<startsWith:sk_>
filename string<endsWith:.pdf>
```

#### Numeric Constraints
```javascript
age number<min:18|max:120>
score number<between:0,100>
```

#### Enums (Preferred Shorthand)
```javascript
status string(active|inactive|pending)
role string(admin|user|moderator)
```

#### Format Validation
```javascript
email string<isEmail>
timestamp string<timestampToHex>
```

#### Database Constraints (Models Only)
```javascript
email string<isUnique|indexed>
```

### Constraint Order

Always apply constraints in this order:
1. **Transforms** (trim, lowercase, uppercase)
2. **Length** (minLength, maxLength, length, lengthBetween)
3. **Format** (isEmail, startsWith, endsWith)
4. **Enums** (using parentheses notation)

Example:
```javascript
email string<trim|lowercase|isEmail>  // ✅ Correct order
email string<isEmail|trim|lowercase>  // ❌ Wrong order
```

## Data Spec Examples (Model Definitions)

Data specs represent **model definitions** - the structure of data as it exists in the database. They are NOT validation specs for service input.

### Key Differences: Models vs Validation

**Models (data/*.go)**:
- Represent database schema
- Include `_id` field with `<isUnique|indexed>`
- Use database constraints: `<isUnique>`, `<indexed>`
- Include timestamps: `created`, `updated`, `deleted?`
- Use comments to explain what each field stores
- Can import and spread `...common` fields

**Validation (in services)**:
- Defines what input is accepted
- Uses transforms: `<trim|lowercase>`
- Uses length constraints: `<minLength:8|maxLength:128>`
- Uses format validation: `<isEmail>`
- Uses enums: `string(active|inactive|pending)`

### Simple Model

`mood.go` demonstrates:
- Basic model structure with import
- Required and optional fields
- Field comments explaining purpose
- Common timestamp fields

### Standard Model

`create-identity.go` demonstrates:
- Unique and indexed fields
- Required and optional fields
- Array fields
- Status and role management
- Timestamp tracking

### Complex Model with Nested Objects

`create-product.go` demonstrates:
- Nested objects for structured data
- Arrays of objects
- Optional nested structures
- Reference fields (vendor_id)

### Advanced Model

`advanced-validation.go` (UserProfile) demonstrates:
- Complex nested structures
- Multiple nested objects
- Arrays of complex objects
- Statistics and metrics
- Professional information structures

## Endpoint Spec Examples

Endpoint specs extend data validation with HTTP-specific details.

### Structure

```javascript
EndpointName {
  path /resource-path
  method GET|POST|PUT|PATCH|DELETE
  
  query { ... }      // Query parameters (GET)
  params { ... }     // Path parameters (:id)
  body { ... }       // Request body (POST/PUT/PATCH)
  
  response.ok {
    http.code 200
    status successful
    message "Success message"
    data { ... }
  }
  
  response.error {
    http.code 400
    status error
    message "Error message"
    data { ... }
  }
}
```

### Examples Included

1. **create-identity.endpoint.go** - POST endpoint with body validation
2. **login.endpoint.go** - Authentication endpoint pattern
3. **get-products.endpoint.go** - GET endpoint with query parameters and pagination
4. **update-profile.endpoint.go** - PATCH endpoint with path params and optional fields

## Usage in Project

### Model Definitions (data/*.go)

Model definitions are **reference documentation** for database schema. They show:
- What fields exist in the collection
- Field types and constraints
- Which fields are indexed
- What the data represents

**Example**: When creating a Mongoose schema:

```javascript
// Based on mood.go model definition
const schemaConfig = {
  _id: { type: SchemaTypes.ULID },
  user_id: { type: SchemaTypes.String, index: true },
  emoji: { type: SchemaTypes.String },
  text: { type: SchemaTypes.String },
  image: { type: SchemaTypes.String },
  is_public: { type: SchemaTypes.Boolean },
  meta: { type: SchemaTypes.Mixed },
};
```

### Validation in Services

Service validation is **separate** from model definitions. Use inline validation specs:

```javascript
const validator = require('@app-core/validator');

// This validates SERVICE INPUT, not the model
const spec = `root {
  user_id string<trim>
  emoji string<trim|minLength:1|maxLength:10>
  text? string<trim|maxLength:140>
  image? string<trim>
  is_public? boolean
}`;

const parsedSpec = validator.parse(spec);

async function createMood(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);
  
  // data is now validated and can be used to create record
  const mood = await Mood.create(data);
  return mood;
}
```

## Best Practices

### ✅ Do

- Always include space: `root { ... }`
- Use descriptive comments after `root {`
- Order constraints correctly (transforms → length → format → enums)
- Use enum shorthand: `status string(active|inactive)`
- Parse specs once at module level, reuse in function
- Use optional fields (`?`) liberally
- Validate at service entry point

### ❌ Don't

- Don't write: `root{...}` (missing space)
- Don't put validation in endpoints
- Don't use `required: true` in models (validate in services)
- Don't put enums in models (validate in services)
- Don't repeat validation across multiple layers

## Integration with Project

These specs are examples. For actual project features:

1. **Model Definitions**: Create in `specs/[feature-group]/data/[model-name].go`
   - Document your database schema
   - Reference when creating Mongoose models
   - Keep updated as schema evolves

2. **Endpoint Specs**: Create in `specs/[feature-group]/endpoint/[endpoint-name].endpoint.go`
   - Document API contracts
   - Define request/response structure
   - Use for API documentation generation

3. **Service Validation**: Write inline in service files
   - Don't copy model definitions for validation
   - Focus on what input is acceptable
   - Include transforms and format checks

4. **Common Fields**: Update `commons.go` with shared fields
   - Timestamps (created, updated, deleted)
   - Audit fields (created_by, updated_by)
   - Any other universally shared fields

## Additional Resources

- See project README.md for complete VSL documentation
- Check `services/` directory for implementation examples
- Review `endpoints/` directory for endpoint patterns
- Consult `core/validator/` for validator implementation

---

**Note**: While these files have `.go` extension for syntax highlighting, they are VSL spec files, not Go code.
