# Valleyed

[![npm version](https://badge.fury.io/js/valleyed.svg)](https://badge.fury.io/js/valleyed)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A powerful, TypeScript-first validation library with a functional pipe-based API that provides type-safe validation with automatic JSON Schema generation.

## ✨ Features

- 🔒 **Type-safe**: Full TypeScript support with automatic type inference
- 🧩 **Composable**: Functional pipe-based API for chaining validations
- 📋 **JSON Schema**: Automatic JSON Schema generation from validation pipes
- 🚀 **Performance**: Lightweight with zero dependencies (except url-regex-safe)
- 🎯 **Comprehensive**: Built-in validators for all common data types
- 🛠 **Extensible**: Easy to create custom validation rules
- 📦 **Tree-shakable**: Only import what you need
- 🔧 **Transformations**: Built-in data transformation capabilities

## 📦 Installation

```bash
# npm
npm install valleyed

# yarn
yarn add valleyed

# pnpm
pnpm add valleyed
```

## 🚀 Quick Start

```ts
import { v } from 'valleyed'

// Simple validation
const emailPipe = v.string().pipe(v.email())
const result = emailPipe.safeParse('user@example.com') // { valid: true, value: 'user@example.com' }

// Complex object validation
const userPipe = v.object({
  name: v.string().pipe(v.min(2)).pipe(v.max(50)),
  email: v.string().pipe(v.email()),
  age: v.number().pipe(v.gte(0)).pipe(v.lte(120)),
  role: v.string().pipe(v.in(['admin', 'user', 'guest']))
})

const user = userPipe.parse({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  role: 'user'
}) // Fully typed result
```

## 📚 Core Concepts

### Pipes

Pipes are the building blocks of Valleyed. Each pipe represents a validation step that can be chained together:

```ts
import { v } from 'valleyed'

const usernamePipe = v.string()
  .pipe(v.asTrim())          // Transform: trim whitespace
  .pipe(v.min(3))            // Validate: minimum 3 characters
  .pipe(v.max(20))           // Validate: maximum 20 characters
  .pipe(v.asLower())         // Transform: convert to lowercase

const result = usernamePipe.parse('  JohnDoe  ') // 'johndoe'
```

### Parsing Methods

```ts
// Safe parsing - returns result object
const safeResult = v.string().safeParse(123)
if (safeResult.valid) {
  console.log(safeResult.value) // string value
} else {
  console.log(safeResult.error) // PipeError instance
}

// Direct parsing - throws on failure
try {
  const value = v.string().parse(123) // throws PipeError
} catch (error) {
  console.log(error.message) // validation error message
}
```

## 🔤 Primitive Types

### Strings

```ts
// Basic validation
v.string() // validates string type

// Length validation
v.string().pipe(v.has(10))    // exactly 10 characters
v.string().pipe(v.min(5))     // at least 5 characters
v.string().pipe(v.max(20))    // at most 20 characters

// Format validation
v.string().pipe(v.email())    // valid email format
v.string().pipe(v.url())      // valid URL format

// Transformations
v.string().pipe(v.asTrim())         // trim whitespace
v.string().pipe(v.asLower())        // convert to lowercase
v.string().pipe(v.asUpper())        // convert to uppercase
v.string().pipe(v.asCapitalize())   // capitalize first letter
v.string().pipe(v.asStrippedHTML()) // strip HTML tags
v.string().pipe(v.asSliced(100))    // truncate to 100 characters

// Custom error messages
v.string().pipe(v.min(5, 'Must be at least 5 characters long'))
```

### Numbers

```ts
// Basic validation
v.number() // validates number type

// Comparison validation
v.number().pipe(v.gt(0))      // greater than 0
v.number().pipe(v.gte(0))     // greater than or equal to 0
v.number().pipe(v.lt(100))    // less than 100
v.number().pipe(v.lte(100))   // less than or equal to 100

// Type validation
v.number().pipe(v.int())      // must be integer

// Transformations
v.number().pipe(v.asRound(2)) // round to 2 decimal places
```

### Booleans and Others

```ts
v.boolean()   // validates boolean type
v.null()      // validates null
v.undefined() // validates undefined
v.any()       // accepts any value (with generic support)
```

## 📝 Arrays

```ts
// Array validation
const stringArray = v.array(v.string()) // array of strings
const numberArray = v.array(v.number()) // array of numbers

// Length constraints
v.array(v.string()).pipe(v.contains(5))    // exactly 5 items
v.array(v.string()).pipe(v.containsMin(1)) // at least 1 item
v.array(v.string()).pipe(v.containsMax(10)) // at most 10 items

// Tuples (fixed-length arrays with different types)
const coordinatePipe = v.tuple([
  v.number(),  // x coordinate
  v.number(),  // y coordinate
  v.string()   // label
])

const coord = coordinatePipe.parse([10, 20, 'point A']) // [10, 20, 'point A']

// Remove duplicates
const uniqueStrings = v.array(v.string()).pipe(v.asSet())
const uniqueById = v.array(v.object({ id: v.number(), name: v.string() }))
  .pipe(v.asSet(item => item.id)) // remove duplicates by id
```

## 🗂 Objects

```ts
// Basic object validation
const userPipe = v.object({
  name: v.string().pipe(v.min(1)),
  email: v.string().pipe(v.email()),
  age: v.number().pipe(v.gte(0))
})

// Nested objects
const profilePipe = v.object({
  user: v.object({
    id: v.number(),
    username: v.string()
  }),
  settings: v.object({
    theme: v.string().pipe(v.in(['light', 'dark'])),
    notifications: v.boolean()
  })
})

// Object manipulation
const originalSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.string(),
  password: v.string(),
  createdAt: v.time()
})

// Pick specific fields
const publicUser = v.objectPick(originalSchema, ['id', 'name', 'email'])

// Omit specific fields
const userUpdate = v.objectOmit(originalSchema, ['id', 'createdAt'])

// Extend with additional fields
const fullUser = v.objectExtends(originalSchema, {
  lastLogin: v.optional(v.time()),
  permissions: v.array(v.string())
})

// Dynamic objects (records)
const stringToNumber = v.record(v.string(), v.number()) // { [key: string]: number }
const dynamicConfig = v.record(
  v.string().pipe(v.min(1)), 
  v.or([v.string(), v.number(), v.boolean()])
)
```

## ❓ Optional and Nullable Values

```ts
// Optional fields (can be undefined)
const userPipe = v.object({
  name: v.string(),
  bio: v.optional(v.string()),        // string | undefined
  avatar: v.nullable(v.string()),     // string | null
  metadata: v.nullish(v.object({}))   // object | null | undefined
})

// Conditional requirements
const conditionalPipe = v.object({
  type: v.string().pipe(v.in(['user', 'admin'])),
  adminKey: v.requiredIf(
    v.string(), 
    () => getCurrentUserType() === 'admin'
  )
})

// Default values
const configPipe = v.object({
  theme: v.defaults(v.string(), 'light'),
  retries: v.defaults(v.number(), () => Math.floor(Math.random() * 3) + 1),
  timeout: v.defaultsOnFail(v.number(), 5000) // use default if validation fails
})
```

## 🔀 Unions and Intersections

```ts
// Union types (OR logic)
const stringOrNumber = v.or([
  v.string(),
  v.number()
])

const result = stringOrNumber.parse('hello') // 'hello'
const result2 = stringOrNumber.parse(42)     // 42

// Intersection types (AND logic)
const namedEntity = v.and([
  v.object({ id: v.number() }),
  v.object({ name: v.string() })
])

// Discriminated unions
const shapePipe = v.discriminate(
  (input) => input.type, // discriminator function
  {
    circle: v.object({
      type: v.eq('circle'),
      radius: v.number().pipe(v.gt(0))
    }),
    rectangle: v.object({
      type: v.eq('rectangle'),
      width: v.number().pipe(v.gt(0)),
      height: v.number().pipe(v.gt(0))
    }),
    triangle: v.object({
      type: v.eq('triangle'),
      base: v.number().pipe(v.gt(0)),
      height: v.number().pipe(v.gt(0))
    })
  }
)

const circle = shapePipe.parse({
  type: 'circle',
  radius: 10
}) // { type: 'circle', radius: 10 }
```

## 📅 Dates and Times

```ts
// Date validation (accepts Date, string, or number)
v.time() // parses various date formats

// Date comparisons
const futureDatePipe = v.time().pipe(v.after(new Date()))
const pastDatePipe = v.time().pipe(v.before(new Date('2025-01-01')))

// Date range
const dateRangePipe = v.time()
  .pipe(v.after(new Date('2023-01-01')))
  .pipe(v.before(new Date('2024-01-01')))

// Date transformations
const timestampPipe = v.time().pipe(v.asStamp())      // convert to timestamp
const isoStringPipe = v.time().pipe(v.asISOString())  // convert to ISO string

// Example usage
const eventPipe = v.object({
  name: v.string(),
  startDate: v.time().pipe(v.after(new Date())),      // must be in future
  endDate: v.time(),
  createdAt: v.defaults(v.time(), () => new Date())
})
```

## 📁 File Validation

```ts
// Basic file validation
const filePipe = v.file() // validates File interface with type property

// Specific file types
const imagePipe = v.image()  // image/* MIME types
const audioPipe = v.audio()  // audio/* MIME types
const videoPipe = v.video()  // video/* MIME types

// Custom file types
const pdfPipe = v.fileType('application/pdf')
const documentPipe = v.fileType([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
])

// File validation in forms
const uploadPipe = v.object({
  title: v.string().pipe(v.min(1)),
  description: v.optional(v.string()),
  file: v.image(), // only allow image uploads
  thumbnail: v.optional(v.image())
})
```

## 🎯 Custom Validation

```ts
// Custom validation rules
const evenNumberPipe = v.number().pipe(
  v.custom(n => n % 2 === 0, 'Must be an even number')
)

const strongPasswordPipe = v.string().pipe(
  v.min(8, 'Password must be at least 8 characters'),
  v.custom(
    pwd => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd),
    'Password must contain uppercase, lowercase, and number'
  )
)

// Equality and membership checks
const statusPipe = v.string().pipe(v.in(['active', 'inactive', 'pending']))
const notBannedPipe = v.string().pipe(v.nin(['banned', 'suspended']))
const exactValuePipe = v.string().pipe(v.eq('expected'))
const notValuePipe = v.string().pipe(v.ne('forbidden'))

// Advanced custom validation with context
const uniqueEmailPipe = v.string()
  .pipe(v.email())
  .pipe(v.custom(async (email) => {
    const exists = await checkEmailExists(email)
    return !exists
  }, 'Email already exists'))
```

## 🔄 Advanced Patterns

### JSON String Parsing

```ts
// Parse JSON strings or accept objects directly
const configPipe = v.tryJSON(v.object({
  apiKey: v.string(),
  timeout: v.number(),
  retries: v.number()
}))

// Both work:
configPipe.parse({ apiKey: 'key', timeout: 5000, retries: 3 })
configPipe.parse('{"apiKey":"key","timeout":5000,"retries":3}')
```

### Map Conversion

```ts
// Convert objects to Maps
const mapPipe = v.record(v.string(), v.number()).pipe(v.asMap())
const result = mapPipe.parse({ a: 1, b: 2 }) // Map<string, number>
```

### Complex Nested Validation

```ts
const apiResponsePipe = v.object({
  success: v.boolean(),
  data: v.optional(v.object({
    users: v.array(v.object({
      id: v.number(),
      profile: v.object({
        name: v.string().pipe(v.min(1)),
        email: v.string().pipe(v.email()),
        preferences: v.record(v.string(), v.or([v.string(), v.number(), v.boolean()]))
      }),
      permissions: v.array(v.string()),
      lastActive: v.time()
    })),
    pagination: v.object({
      page: v.number().pipe(v.gte(1)),
      limit: v.number().pipe(v.gte(1)).pipe(v.lte(100)),
      total: v.number().pipe(v.gte(0))
    })
  })),
  error: v.optional(v.object({
    code: v.string(),
    message: v.string(),
    details: v.optional(v.any())
  }))
})
```

## 📋 JSON Schema Generation

All pipes automatically generate JSON Schema:

```ts
const userPipe = v.object({
  name: v.string()
    .pipe(v.min(1))
    .meta({
      title: 'Full Name',
      description: 'The user\'s full name',
      examples: ['John Doe', 'Jane Smith']
    }),
  email: v.string()
    .pipe(v.email())
    .meta({
      title: 'Email Address',
      description: 'Valid email address for contact'
    }),
  age: v.optional(v.number().pipe(v.gte(0)).pipe(v.lte(120)))
})

// Generate JSON Schema
const schema = userPipe.toJsonSchema()
console.log(JSON.stringify(schema, null, 2))
```

Output:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "title": "Full Name",
      "description": "The user's full name",
      "examples": ["John Doe", "Jane Smith"]
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address",
      "description": "Valid email address for contact"
    },
    "age": {
      "anyOf": [
        {
          "type": "number",
          "minimum": 0,
          "maximum": 120
        },
        {
          "type": "undefined"
        }
      ]
    }
  },
  "required": ["name", "email"],
  "additionalProperties": false
}
```

## 🔧 Error Handling

```ts
import { PipeError } from 'valleyed'

const userPipe = v.object({
  name: v.string().pipe(v.min(2)),
  email: v.string().pipe(v.email()),
  age: v.number().pipe(v.gte(0))
})

// Handle validation errors
try {
  userPipe.parse({
    name: 'J',
    email: 'invalid-email',
    age: -5
  })
} catch (error) {
  if (error instanceof PipeError) {
    console.log('Validation failed:')
    error.messages.forEach(msg => {
      console.log(`- ${msg.path ? msg.path + ': ' : ''}${msg.message}`)
    })
    // Output:
    // - name: must contain 2 or more characters
    // - email: is not a valid email
    // - age: must be greater than or equal to 0
  }
}

// Safe parsing for error handling
const result = userPipe.safeParse(invalidData)
if (!result.valid) {
  // Handle validation errors gracefully
  const errors = result.error.messages.map(msg => ({
    field: msg.path || 'root',
    message: msg.message
  }))
  return { success: false, errors }
}
```

## 🏗 Utility Functions

Valleyed includes utility functions for common operations:

```ts
import { 
  capitalize, 
  stripHTML, 
  trimToLength, 
  extractUrls,
  formatNumber,
  pluralize,
  getRandomValue,
  groupBy,
  addToArray,
  getPercentage,
  shuffleArray,
  chunkArray,
  compareTwoStrings
} from 'valleyed'

// String utilities
capitalize('hello world')           // 'Hello World'
stripHTML('<p>Hello <b>world</b></p>') // 'Hello world'
trimToLength('Long text here', 10)     // 'Long text...'

// Array utilities
const users = [{ name: 'John', dept: 'IT' }, { name: 'Jane', dept: 'HR' }]
groupBy(users, user => user.dept)      // [{ key: 'IT', values: [...] }, ...]
chunkArray([1,2,3,4,5], 2)            // [[1,2], [3,4], [5]]
shuffleArray([1,2,3,4,5])             // [3,1,5,2,4] (random order)

// Number utilities
formatNumber(1234567)                 // '1.2M'
getPercentage(25, 100)               // 25
pluralize(1, 'item', 'items')        // 'item'
pluralize(5, 'item', 'items')        // 'items'

// String similarity
compareTwoStrings('hello', 'hallo')   // 0.8 (80% similar)
```

## 📊 TypeScript Integration

Valleyed provides full TypeScript support with automatic type inference:

```ts
import { v, PipeInput, PipeOutput } from 'valleyed'

const userPipe = v.object({
  id: v.number(),
  name: v.string(),
  email: v.optional(v.string().pipe(v.email())),
  settings: v.object({
    theme: v.string().pipe(v.in(['light', 'dark'])),
    notifications: v.boolean()
  })
})

// Automatically inferred types
type User = PipeOutput<typeof userPipe>
// {
//   id: number
//   name: string
//   email?: string
//   settings: {
//     theme: 'light' | 'dark'
//     notifications: boolean
//   }
// }

type UserInput = PipeInput<typeof userPipe>
// Same as User but represents the input before validation

// Use in functions
function createUser(userData: UserInput): User {
  return userPipe.parse(userData)
}

// Advanced type utilities
type UserSettings = PipeOutput<typeof userPipe>['settings']
type ThemeType = UserSettings['theme'] // 'light' | 'dark'
```

## ⚡ Performance

Valleyed is designed for performance:

- **Lazy evaluation**: Validations only run when needed
- **Early termination**: Stops at first validation failure
- **Minimal overhead**: Functional approach minimizes object creation
- **Tree-shakable**: Only bundle what you use
- **Zero dependencies**: Except for url-regex-safe for URL validation

### Benchmarks

```ts
// Simple validation - ~1-2ms for 1000 operations
const simple = v.string().pipe(v.email())

// Complex nested validation - ~5-10ms for 1000 operations  
const complex = v.object({
  users: v.array(v.object({
    profile: v.object({
      name: v.string().pipe(v.min(1)),
      email: v.string().pipe(v.email())
    })
  }))
})
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kevinand11/valleyed.git
cd valleyed

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the library
pnpm build

# Run linting
pnpm lint
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test arrays.test.ts
```

## 📄 API Reference

### Core Functions

| Function | Description | Example |
|----------|-------------|---------|
| `v.string()` | String validation | `v.string().pipe(v.min(5))` |
| `v.number()` | Number validation | `v.number().pipe(v.gt(0))` |
| `v.boolean()` | Boolean validation | `v.boolean()` |
| `v.array(pipe)` | Array validation | `v.array(v.string())` |
| `v.object(schema)` | Object validation | `v.object({ name: v.string() })` |
| `v.optional(pipe)` | Optional validation | `v.optional(v.string())` |
| `v.nullable(pipe)` | Nullable validation | `v.nullable(v.string())` |
| `v.or(pipes)` | Union validation | `v.or([v.string(), v.number()])` |
| `v.and(pipes)` | Intersection validation | `v.and([pipe1, pipe2])` |

### String Validators

| Function | Description | Example |
|----------|-------------|---------|
| `v.email()` | Email format | `v.string().pipe(v.email())` |
| `v.url()` | URL format | `v.string().pipe(v.url())` |
| `v.min(n)` | Minimum length | `v.string().pipe(v.min(5))` |
| `v.max(n)` | Maximum length | `v.string().pipe(v.max(100))` |
| `v.has(n)` | Exact length | `v.string().pipe(v.has(10))` |

### Number Validators

| Function | Description | Example |
|----------|-------------|---------|
| `v.gt(n)` | Greater than | `v.number().pipe(v.gt(0))` |
| `v.gte(n)` | Greater than or equal | `v.number().pipe(v.gte(0))` |
| `v.lt(n)` | Less than | `v.number().pipe(v.lt(100))` |
| `v.lte(n)` | Less than or equal | `v.number().pipe(v.lte(100))` |
| `v.int()` | Integer validation | `v.number().pipe(v.int())` |

### Transformers

| Function | Description | Example |
|----------|-------------|---------|
| `v.asTrim()` | Trim whitespace | `v.string().pipe(v.asTrim())` |
| `v.asLower()` | Convert to lowercase | `v.string().pipe(v.asLower())` |
| `v.asUpper()` | Convert to uppercase | `v.string().pipe(v.asUpper())` |
| `v.asRound(dp)` | Round number | `v.number().pipe(v.asRound(2))` |

## 📜 License

ISC License © [Kevin Izuchukwu](https://github.com/kevinand11)

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/valleyed)
- [GitHub Repository](https://github.com/kevinand11/valleyed)
- [Issue Tracker](https://github.com/kevinand11/valleyed/issues)
- [Changelog](https://github.com/kevinand11/valleyed/blob/main/CHANGELOG.md)

---

**Built with ❤️ by [Kevin Izuchukwu](https://github.com/kevinand11)**