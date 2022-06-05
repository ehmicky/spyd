// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (name, onCreate = defaultOnCreate) {
  const ErrorType = class extends Error {
    constructor(message, opts = {}) {
      validateOpts(opts)
      const errorOpts = opts.cause === undefined ? {} : { cause: opts.cause }
      super(message, errorOpts)
      // eslint-disable-next-line fp/no-this
      onCreate(this, getOnCreateOpts(this, opts))
    }
  }
  validateErrorName(name)
  setErrorName(ErrorType, name)
  return ErrorType
}

// Validate `error.name` looks like `ExampleError`.
const validateErrorName = function (name) {
  if (typeof name !== 'string') {
    throw new TypeError(`Error name must be a string: ${name}`)
  }

  if (!name.endsWith(ERROR_NAME_END) || name === ERROR_NAME_END) {
    throw new Error(`Error name "${name}" must end with "${ERROR_NAME_END}"`)
  }

  validateErrorNamePattern(name)
}

const validateErrorNamePattern = function (errorName) {
  if (errorName[0] !== errorName.toUpperCase()[0]) {
    throw new Error(
      `Error name "${errorName}" must start with an uppercase letter.`,
    )
  }

  if (!ERROR_NAME_REGEXP.test(errorName)) {
    throw new Error(`Error name "${errorName}" must only contain letters.`)
  }
}

const ERROR_NAME_END = 'Error'
const ERROR_NAME_REGEXP = /[A-Z][a-zA-Z]*Error$/u

const validateOpts = function (opts) {
  if (typeof opts !== 'object' || opts === null) {
    throw new TypeError(
      `Error's second argument must be a plain object: ${opts}`,
    )
  }
}

// When passing options to `onCreate()`, ignore keys that:
//  - Would override `Object` prototype (`hasOwnProperty`, etc.) or `Error`
//    prototype (`toString`)
//  - Are prototype-specific (`__proto__`, `prototype`, `constructor`)
//  - Are core error properties (`name`, `message`, `stack`, `cause`, `errors`)
//  - Are inherited
//  - Are not enumerable
const getOnCreateOpts = function (error, opts) {
  const onCreateOpts = {}

  // eslint-disable-next-line fp/no-loops
  for (const key in opts) {
    // eslint-disable-next-line max-depth
    if (isEnum.call(opts, key) && !shouldIgnoreKey(error, key)) {
      // eslint-disable-next-line fp/no-mutation
      onCreateOpts[key] = opts[key]
    }
  }

  return onCreateOpts
}

const { propertyIsEnumerable: isEnum } = Object.prototype

const shouldIgnoreKey = function (error, key) {
  return key in error || IGNORED_KEYS.has(key)
}

const IGNORED_KEYS = new Set(['errors', 'prototype'])

// `onCreate(error, opts)` allows custom logic at initialization time.
// The construction arguments are passed.
//  - They can be validated, normalized, etc.
//  - No third argument is passed. This enforces calling named parameters
//    `new ErrorType('message', opts)` instead of positional ones, which is
//    cleaner.
// `onCreate()` is useful to assign error instance-specific properties.
//  - Therefore, the default value just assign `opts`.
// Properties that are error type-specific (i.e. same for all instances of that
// type):
//  - Should use a separate object where the key is the `error.name` and the
//    value are the properties
//  - Those should be used either:
//     - By letting the error catcher|consumer retrieve object[error.name],
//       which is preferred since it:
//        - Decouples error consumption from creation
//        - Prevents those properties from being printed on the console
//        - Makes it harder to lose those properties as the error gets passed
//          around, serialized, wrapped in `error.cause` or `error.errors`, etc.
//        - Is simpler for error throwing logic
//     - By assigning them in `onCreate()` using
//       `Object.assign(this, object[error.name])`
//        - This is simpler for the error catching|consuming logic
const defaultOnCreate = function (error, opts) {
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(error, opts)
}

// To mimic native error types and to print correctly with `util.inspect()`:
//  - `error.name` should be assigned on the prototype, not on the instance
//  - the constructor `name` must be set too
const setErrorName = function (ErrorType, name) {
  setNonEnumProp(ErrorType, 'name', name)
  setNonEnumProp(ErrorType.prototype, 'name', name)
}

const setNonEnumProp = function (object, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(object, propName, {
    value,
    writable: false,
    enumerable: false,
    configurable: true,
  })
}
