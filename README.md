# Valleyed


## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the [npm registry](https://www.npmjs.com/package/valleyed).
Before installing, [download and install Node.js](https://nodejs.org/en/download/). Node.js 4.2.4 or higher is required.
If this is a brand new project, make sure to create a `package.json` first with the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).
Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

### Using npm:
    npm install valleyed

### Using yarn:
    yarn add valleyed

### Using CDN:
[Valleyed jsDelivr CDN](https://www.jsdelivr.com/package/npm/valleyed)


## Basic Usage

```ts
import { isEmail, isMinOf } from 'valleyed'

// The isEmail function builds and returns a function that checks if the first argument is a valid email
let validity = isEmail()('johndoe@mail.co')
console.log(validity)
// Output should be : { valid: true, error: null, value: 'johndoe@mail.co' }

// The isMinOf function builds a function that checks if the first argument is of minimum length of the length passed into the builder function
validity = isMinOf(5)('abcd')
console.log(validity)
// Output should be : { valid: false, error: 'must contain 5 or more characters', value: 'abcd' }
```


## Common Rule Builders

### Errors

All rule builders accept an optional string as the last argument used to customize the error message

```ts
const res = isEmail('is missing specific characters')('')
console.log(res) // { valid: false, error: 'is missing specific characters', value: '' }
```

### Equality

```ts
// Checks if the validation value is shallow equal to the compare. Valuable for comparing primitive types
isShallowEqualTo(compare)

// Checks if the validation value resolves to true when passed into the compareFunction. The compareFunction passes the validation value and the compare value as the arguments and expects a boolean in return. Valuable for comparing non-primitive types.
isDeepEqualTo(compare, compareFunction)
const res = isDeepEqualTo({ id: 1 }, (value, compare) => {
	return value?.id === compare.id
})({ id: 1 }) // res.valid is true

// Checks if the validation value is in an array of predefined values
arrayContains(array, compareFunction)
const res = arrayContains([{ id: 1 }, { id: 2 }], (value, compare) => {
	return value?.id === compare.id
})({ id: 2 }) // res.valid is true
```

### Strings

```ts
// Checks if the validation value is of type String. This is used internally in all string methods, so no need to use it unless you are making a custom rule
isString()

// Checks if the length of the validation value is equal to the length
isLengthOf(length)

// Checks if the length of the validation value is greater than or equal to the length
isMinOf(length)

// Checks if the length of the validation value is less than or equal to the length
isMaxOf(length)

// Checks if the validation value is formatted as a valid email
isEmail()

// Checks if the validation value is formatted as a valid url
isUrl()
```

### Numbers

```ts
// Checks if the validation value is of type Number. This is used internally in all number methods, so no need to use it unless you are making a custom rule
isNumber()

// Checks if the the validation value is greater than the compare
isMoreThan(compare)

// Checks if the the validation value is greater than or equal to the compare
isMoreThanOrEqualTo(compare)

// Checks if the the validation value is less than the compare
isLessThan(compare)

// Checks if the the validation value is less than or equal to the compare
isLessThanOrEqualTo(compare)
```

### Arrays

```ts
// Checks if the validation value is of type Array. This is used internally in all array methods, so no need to use it unless you are making a custom rule
isArray()

// Checks if the length of the validation value is equal to the length
hasLengthOf(length)

// Checks if the length of the validation value is greater than or equal to the length
hasMinOf(length)

// Checks if the length of the validation value is less than or equal to the length
hasMaxOf(length)

// Checks if the validation value is formatted as a valid email
isEmail()

// Checks if all elements in the valition value passes a requirement. The compare function passes a element and its index as the arguments and expects a boolean in return.
isArrayOf(compareFunction)
const res = isArrayOf((element, index) => {
	return isString(element).valid // This ensures all elements in the array are strings
})(['a', 'b', 'c']) // res.valid is true

// Used to validate tuples(arrays that can contain different data types). Checks if all elements in the validation values passes a different requirement
isTuple(compareFunctionsArray)
const res = isTuple([
	(element, index) => isString(element).valid,
	(element, index) => isNumber(element).valid
])(['hello world', 2]) // res.valid is true because it expects an array that contains a string at index 0 and a number at index 1
```

### Datetime

```ts
// Checks if the validation value can be parsed into a valid javascript date. Validation value can be a Date object, a timestamp number or a datetime string. This is used internally in all datetime methods, so no need to use it unless you are making a custom rule
isTime()

// Checks if the validation value is later than the compare. Compare can also be a Date object, a timestamp number or a datetime string
isLaterThan(compare)

// Checks if the validation value is earlier than the compare. Compare can also be a Date object, a timestamp number or a datetime string
isEarlierThan(compare)
```

### Other Types

```ts
// Checks if the validation value is a boolean
isBoolean()

// Checks if the validation value is null
isNull()

// Checks if the validation value is undefined
isUndefined()

// Checks if the validation value is an instance of the Class passed in
isInstanceOf(classDefinition)
const res = isInstanceOf(String)('') // res.valid is true
```

### Records and Maps

```ts
/// Checks if all values in an object passes a comparer function
isRecord(compareFunction)
const res = isRecord((currentValue) => {
	return isNumber(currentValue).valid
})({ a: 1, b: 2, c: 3 }) // res.valid is true because all the values of the object are numbers

/// Checks if all keys and values in an map passes a comparer function
isMap(keysCompareFunction, valuesCompareFunction)
const map = new Map([
	[1, true],
	[2, false],
	[3, true]
])
const res = isMap(
	(key) => isNumber(key).valid,
	(value) => isBoolean(value).valid
)(map) // res.valid is true because all the keys of the map are numbers and all the values are booleans
```

### Files

```ts
// Checks if the validation value is an object with a key "type" that contains a supported file mimetypes. All supported file mimetypes can be imported under the name "fileMimeTypes". This is used internally in all file methods, so no need to use it unless you are making a custom rule
isFile()

// Checks if the validation value's type is a valid image mimetype. All supported image mimetypes can be imported under the name "imageMimeTypes".
isImage()

// Checks if the validation value's type is a valid audio mimetype. All supported audio mimetypes can be imported under the name "audioMimeTypes".
isAudio()

// Checks if the validation value's type is a valid video mimetype. All supported video mimetypes can be imported under the name "videoMimeTypes".
isVideo()
```

### Custom Rule

```ts
// If there is a rule for your usecase, you can create a custom one with this. The validityFunction passes the validation value as its argument and expects a boolean in return
isCustom(validityFunction)
const res = isCustom((value) => typeof value === 'function')(() => {}) // res.valid is true because the typeof value is function
```


## Combining Rules

```ts
import { Validator, isEmail, isMinOf, isString, isNumber } from 'valleyed'

// The Validator.and function is used to build up a schema or list of rules to validate a value against
let res = Validator.and([[isEmail(), isMinOf(1)]])('johndoe@mail.com')
console.log(res) // { valid: true, errors: [], value: 'johndoe@mail.com' }

// if the value fails validation, it returns a list of all errors in the errors array
res = Validator.and([[isEmail(), isMinOf(1)]])('')
console.log(res) // { valid: false, value: '', errors: [ 'is not a valid email', 'must contain 1 or more characters' ] }

// Similar to the And function, Validator has an or function that checks if the value passes validation for any of the list of rules passed in
let res = Validator.or([[isString(), isMinOf(1)], [isNumber()]])(2)
console.log(res) // { valid: true, value: 2, errors: [] }

// if the value fails validation, it returns a list of all errors in the errors array
res = Validator.or([[isString(), isMinOf(1)], [isNumber()]])(false)
console.log(res) // { valid: false, value: false, errors: [ 'doesn't match any of the schema' ] }

// An optional third paramater can be passed into the And/Or functions to control if null and undefined are allowed to pass validation
Validator.and([[isEmail()]], {
	nullable: true, // Boolean: if true, null passed as the first argument passes validation
	required: () => false // Boolean or Function that returns a boolean: if false, undefined passed as the first argument passes validation
})('')
```
