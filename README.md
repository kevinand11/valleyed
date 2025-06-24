# Valleyed

Valleyed is a powerful, type-safe, and lightweight validation library for TypeScript and JavaScript. It provides a fluent, chainable API to build complex validation pipelines with ease, inspired by libraries like superstruct, zod, etc but with a focus on simplicity, extensibility, and a functional approach.

## ✨ Features

-   **Type-Safe**: Full TypeScript support with first-class type inference. Infer types directly from your schemas.
-   **Lightweight**: Small bundle size with zero dependencies.
-   **Functional & Chainable API**: Build complex validation pipelines by creating and composing pipes.
-   **Extensible**: Easily add your own custom validation logic by creating new pipes.
-   **JSON Schema Generation**: Automatically generate JSON Schemas from your validation pipes.
-   **Standard Schema Compatible**: Implements the [Standard Schema v1](https://github.com/standard-schema/standard-schema) specification for interoperability.
-   **Isomorphic**: Works in both Node.js and browser environments.
-   **Utilities**: Includes a set of useful utilities for data manipulation, like a deep diffing utility and geohash functions.

## 📦 Installation

You can install Valleyed using your favorite package manager:

```bash
npm install valleyed
# or
yarn add valleyed
# or
pnpm add valleyed
```

## 🚀 Quick Start

Here's a quick example to get you started with Valleyed:

```typescript
import { v } from 'valleyed';

// 1. Define a schema (a "pipe") for your data
const userSchema = v.object({
  name: v.string().pipe(v.min(3)),
  email: v.string().pipe(v.email()),
  age: v.optional(v.number().pipe(v.gte(18))),
});

// 2. Some data to validate
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

// 3. Validate the data using v.validate()
const validationResult = v.validate(userSchema, userData);

if (validationResult.valid) {
  // Type-safe access to the validated data
  console.log('Validation successful:', validationResult.value);
} else {
  // Detailed error messages
  console.error('Validation failed:', validationResult.error.toString());
}

// 4. You can also parse directly with v.assert(), which throws on error
try {
    const user = v.assert(userSchema, userData);
    console.log('Parsed user:', user);
} catch (error) {
    console.error(error);
}
```

## 📚 Core Concepts

### Pipes

The fundamental building block in Valleyed is the **pipe**. A pipe is a function that takes an input, validates or transforms it, and returns the output. Pipes can be chained together to create a validation pipeline.

You can create a base pipe (like `v.string()`) and then chain more validation rules or transformations using the `.pipe()` method.

```typescript
const usernamePipe = v.string()
  .pipe(v.asTrimmed())      // Transformer: trims whitespace
  .pipe(v.min(3))           // Validator: minimum 3 characters
  .pipe(v.asLowercased());  // Transformer: converts to lowercase
```

### Execution Functions

Once you have a pipe, you use one of the top-level execution functions to run it:

-   `v.assert(pipe, input)`: Parses the input using the pipe. If validation is successful, it returns the (potentially transformed) output. If it fails, it throws a `PipeError`.
-   `v.validate(pipe, input)`: Safely validates the input. It returns an object: `{ valid: true, value: ... }` on success, or `{ valid: false, error: ... }` on failure. It never throws.
-   `v.schema(pipe)`: Generates a JSON Schema from the validation pipe.
-   `v.meta(pipe, metadata)`: Attaches metadata (like `title`, `description`, `examples`) to a pipe, which will be included in the generated JSON Schema.

```typescript
const username = v.assert(usernamePipe, '  JohnDoe  '); // 'johndoe'

const result = v.validate(usernamePipe, 'JD');
if (!result.valid) {
    console.log(result.error.messages);
    // [{ message: 'must contain 3 or more characters', path: '' }]
}
```

### Type Inference

Valleyed automatically infers TypeScript types from your schemas. You can use `v.PipeInput<T>` and `v.PipeOutput<T>` to extract the input and output types of a pipe.

```typescript
import { v, PipeInput, PipeOutput } from 'valleyed';

const userSchema = v.object({ /* ... */ });

type UserInput = PipeInput<typeof userSchema>;   // The type of the data before validation
type UserOutput = PipeOutput<typeof userSchema>; // The type of the data after validation
```

## 📚 API Reference

Valleyed exports a single object `v` which contains all the validation functions.

### Primitive Types

These are the basic building blocks for any schema.

| Function         | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `v.string()`     | Checks if the input is a `string`.                   |
| `v.number()`     | Checks if the input is a `number` (and not `NaN`).   |
| `v.boolean()`    | Checks if the input is a `boolean`.                  |
| `v.null()`       | Checks if the input is `null`.                       |
| `v.undefined()`  | Checks if the input is `undefined`.                  |
| `v.any()`        | Allows any value, essentially a pass-through.        |
| `v.instanceOf(class)` | Checks if the input is an instance of a given class. |

```typescript
// Example:
v.validate(v.string(), 'hello').valid; // true
v.validate(v.number(), 123).valid; // true
v.validate(v.instanceOf(Date), new Date()).valid; // true
```

### Core Validators

These validators can be piped from any other validator to add more constraints.

| Function                  | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `v.custom(fn, msg?)`      | Validates using a custom function that returns a boolean.                |
| `v.eq(val, msg?)`         | Checks for deep equality with a given value. Alias: `v.is()`.            |
| `v.ne(val, msg?)`         | Checks for deep inequality with a given value.                           |
| `v.in(arr, msg?)`         | Checks if the value is present in the provided array.                    |
| `v.nin(arr, msg?)`        | Checks if the value is **not** present in the provided array.            |
| `v.has(len, msg?)`        | For strings and arrays, checks for an exact length.                      |
| `v.min(len, msg?)`        | For strings and arrays, checks for a minimum length.                     |
| `v.max(len, msg?)`        | For strings and arrays, checks for a maximum length.                     |

```typescript
// Example:
const schema = v.string().pipe(v.min(5), v.in(['hello', 'world']));
v.validate(schema, 'hello').valid; // true
v.validate(schema, 'hi').valid; // false (fails min(5))
v.validate(schema, 'testing').valid; // false (fails in([...]))
```

### String Validators

Specific validators and transformers for strings.

| Function             | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `v.email(msg?)`      | Validates an email address format.                                       |
| `v.url(msg?)`        | Validates a URL format.                                                  |
| `v.asTrimmed()`      | **Transformer**: Trims whitespace from the start and end of a string.    |
| `v.asLowercased()`   | **Transformer**: Converts the string to lowercase.                       |
| `v.asUppercased()`   | **Transformer**: Converts the string to uppercase.                       |
| `v.asCapitalized()`  | **Transformer**: Capitalizes each word in the string.                    |
| `v.asStrippedHtml()` | **Transformer**: Removes HTML tags from the string.                      |
| `v.asSliced(len)`    | **Transformer**: Slices the string to a max length, adding `...`.        |
| `v.withStrippedHtml(pipe)` | Applies a validation pipe to an HTML-stripped version of the string, but returns the original string if valid. |

```typescript
// Example:
v.validate(v.string().pipe(v.email()), 'test@example.com').valid; // true

const trimmedLower = v.string().pipe(v.asTrimmed(), v.asLowercased());
v.assert(trimmedLower, '  HeLLo  '); // 'hello'
```

### Number Validators

Specific validators and transformers for numbers.

| Function          | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `v.gt(num, msg?)` | Checks if the number is greater than the given value.    |
| `v.gte(num, msg?)`| Checks if the number is greater than or equal to the given value. |
| `v.lt(num, msg?)` | Checks if the number is less than the given value.       |
| `v.lte(num, msg?)`| Checks if the number is less than or equal to the given value. |
| `v.int(msg?)`     | Checks if the number is an integer.                      |
| `v.asRounded(dp?)`| **Transformer**: Rounds the number to a number of decimal places. |

```typescript
// Example:
const ageSchema = v.number().pipe(v.int(), v.gte(18));
v.validate(ageSchema, 25).valid; // true
v.validate(ageSchema, 17.5).valid; // false
```

### Array Validators

Validators for handling arrays.

| Function                  | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| `v.array(schema)`         | Validates that every element in an array matches the provided schema.    |
| `v.tuple([s1, s2])`       | Validates a fixed-length array where each element has a specific type.   |
| `v.asSet(keyFn?)`         | **Transformer**: Removes duplicates from an array. By default, it uses the value itself for comparison. You can provide a `keyFn` for objects. |

```typescript
// Example:
const tagsSchema = v.array(v.string().pipe(v.min(2)));
v.validate(tagsSchema, ['food', 'travel']).valid; // true

const pointSchema = v.tuple([v.number(), v.number()]);
v.validate(pointSchema, [10, 20]).valid; // true
```

### Object Validators

Validators for handling objects.

| Function                        | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `v.object({ k: schema })`       | Validates an object's properties against a schema definition.            |
| `v.record(keySchema, valSchema)`| Validates objects with dynamic keys (like dictionaries or records).      |
| `v.objectPick(schema, keys)`    | Creates a new object schema by picking specified keys from an existing one. |
| `v.objectOmit(schema, keys)`    | Creates a new object schema by omitting specified keys from an existing one. |
| `v.asMap()`                     | **Transformer**: Converts a record-like object into a `Map`.             |

```typescript
// Example:
const userSchema = v.object({ name: v.string(), age: v.number() });

const publicUserSchema = v.objectOmit(userSchema, ['age']);
v.validate(publicUserSchema, { name: 'John' }).valid; // true
```

### Optional & Default Values

Functions for handling optional values and providing defaults.

| Function                       | Description                                                              |
| ------------------------------ | ------------------------------------------------------------------------ |
| `v.optional(schema)`           | Allows the value to be `undefined`.                                      |
| `v.nullable(schema)`           | Allows the value to be `null`.                                           |
| `v.nullish(schema)`            | Allows the value to be `null` or `undefined`.                            |
| `v.defaults(schema, val)`      | Provides a default value if the input is `undefined`.                    |
| `v.catch(schema, val)`| Provides a fallback value if the initial validation fails.                |
| `v.conditional(schema, fn)`    | Makes a field optional based on a dynamic boolean condition.             |

```typescript
// Example:
const schema = v.object({
  name: v.string(),
  nickname: v.optional(v.string()),
  role: v.defaults(v.string(), 'user'),
});

v.assert(schema, { name: 'John' });
// { name: 'John', role: 'user' }
```

### Junctions (Unions & Intersections)

Combine schemas to create complex types.

| Function                               | Description                                                              |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `v.or([s1, s2])`                       | A union type. The value must match at least one of the provided schemas. |
| `v.and([s1, s2])`                      | An intersection. The value must match all of the provided schemas.       |
| `v.merge(s1, s2)`                      | Merges two object or array schemas.                                      |
| `v.discriminate(fn, schemas)`          | Validates against one of several object schemas based on a discriminator field. |
| `v.fromJson(schema)`                   | **Transformer**: Parses a JSON string before validating against a schema. |

```typescript
// Example: Discriminated Union
const shapeSchema = v.discriminate(v => v.type, {
  circle: v.object({ type: v.is('circle'), radius: v.number() }),
  square: v.object({ type: v.is('square'), side: v.number() }),
});

v.validate(shapeSchema, { type: 'circle', radius: 10 }).valid; // true
v.validate(shapeSchema, { type: 'square', side: 5 }).valid; // true
```

### Date & Time Validators

Validators and transformers for dates and times.

| Function            | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `v.time(msg?)`      | Validates a date, accepting `Date` objects, timestamps, or date strings. |
| `v.after(date, msg?)`| Checks if the date is after a specified date.                          |
| `v.before(date, msg?)`| Checks if the date is before a specified date.                         |
| `v.asStamp()`       | **Transformer**: Converts a `Date` object into a numeric timestamp.      |
| `v.asISOString()`   | **Transformer**: Converts a `Date` object into an ISO 8601 string.       |

```typescript
// Example:
const eventSchema = v.object({
  name: v.string(),
  startsAt: v.time().pipe(v.after(new Date())),
});
```

### File Validators

Validators for file-like objects (e.g., from a file upload). These validators expect an object with a `type` property containing the MIME type.

| Function                      | Description                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| `v.file(msg?)`                | Validates a generic file-like object.                                    |
| `v.image(msg?)`               | Validates if the file is an image (`image/*`).                           |
| `v.audio(msg?)`               | Validates if the file is an audio file (`audio/*`).                      |
| `v.video(msg?)`               | Validates if the file is a video file (`video/*`).                       |
| `v.fileType(types, msg?)`     | Validates if the file's MIME type is in the provided list.               |

```typescript
// Example:
const imageSchema = v.file().pipe(v.image(), v.fileType(['image/jpeg', 'image/png']));
v.validate(imageSchema, { type: 'image/png' }).valid; // true
v.validate(imageSchema, { type: 'image/gif' }).valid; // false
```

### Coercion

These pipes attempt to convert the input to a specific type before validating it.

| Function            | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| `v.coerceString()`  | Coerces to `string` using `String()`.                                    |
| `v.coerceNumber()`  | Coerces to `number` using `Number()`. Fails if the result is `NaN`.      |
| `v.coerceBoolean()` | Coerces to `boolean` using `Boolean()`.                                  |
| `v.coerceTime()`    | Coerces to `Date` using `new Date()`.                                    |

```typescript
// Example:
const schema = v.coerceNumber().pipe(v.int());
v.assert(schema, '123'); // 123
v.validate(schema, '123.45').valid; // false (fails int())
```

## 🛠️ Utilities

Valleyed also exports a few standalone utilities.

### DataClass

A simple base class for creating data-centric classes with `toJSON` and custom inspection support.

```typescript
import { DataClass } from 'valleyed';

class User extends DataClass<{ name: string; email: string }> {
    constructor(data: { name: string; email: string }) {
        super(data);
    }
}

const user = new User({ name: 'John', email: 'john@example.com' });
console.log(user.name); // 'John'
console.log(user.toJSON()); // { name: 'John', email: 'email' }
```

### Geohash

Utilities for encoding and decoding geohashes.

```typescript
import { geohash } from 'valleyed';

const hash = geohash.encode([40.7128, -74.0060]); // 'dr5regw3pg'
const [lat, lon] = geohash.decode(hash); // [40.7128, -74.0060]
const neighbors = geohash.neighbors(hash);
```

### Differ

A utility for deep-diffing, checking equality, and merging objects.

```typescript
import { differ } from 'valleyed';

const obj1 = { a: 1, b: { c: 2 } };
const obj2 = { a: 1, b: { c: 3 } };

differ.equal(obj1, obj2); // false
differ.diff(obj1, obj2); // ['b.c']
differ.merge(obj1, { b: { d: 4 } }); // { a: 1, b: { c: 2, d: 4 } }
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### Development Setup

1.  Clone the repository.
2.  Install dependencies with `pnpm install`.
3.  Run tests with `pnpm test`.

## 📜 License

This project is licensed under the MIT License.
