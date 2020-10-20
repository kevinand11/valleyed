# sd-validate

### Getting Started
  ```bash
  npm i sd-validate --save
  ```

### Usage
```bash
const { Validator } = require('sd-validate')
const { isEmail } = require('sd-validate/lib/rules')

const res = Validator.single('johndoe@example.com', [isEmail])
console.log(res.isValid) // true 
console.log(res.errors) // [] 

const res = Validator.single('johndoe', [isEmail])
console.log(res.isValid) // false 
console.log(res.errors) // ['is not a valid email'] 


The 'single' method on the Validator class takes 3 parameters:
1. The value to the validated
2. An array of rules to run the value against. Feel free to check out all predefdined rules [here](https://github.com/Kevinand11/sd-validate/tree/develop/src/rules)
3. An optional boolean to indicate presence. Defaults to true. If false is passed in, the method skips all checks if a value of undefined is passed in

const res = Validator.single(undefined, [isEmail], false)
console.log(res.isValid) // true 
console.log(res.errors) // [] 

```

