// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (
  errorName,
  onCreate = defaultOnCreate,
) {
  validateErrorName(errorName)
  const ErrorType = class extends Error {
    constructor(message, opts = {}) {
      validateOpts(opts)
      const errorOpts = opts.cause === undefined ? {} : { cause: opts.cause }
      super(message, errorOpts)
      // eslint-disable-next-line fp/no-this
      const onCreateOpts = getOnCreateOpts(this, opts)
      // eslint-disable-next-line fp/no-this
      onCreate(this, onCreateOpts)
    }
  }
  setErrorName(ErrorType, errorName)
  return ErrorType
}

// Validate `error.name` looks like `ExampleError`.
const validateErrorName = function (errorName) {
  if (typeof errorName !== 'string') {
    throw new TypeError(`Error name must be a string: ${errorName}`)
  }

  if (!errorName.endsWith(ERROR_NAME_END) || errorName === ERROR_NAME_END) {
    throw new Error(
      `Error name "${errorName}" must end with "${ERROR_NAME_END}"`,
    )
  }

  validateErrorNamePattern(errorName)
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

// `onCreate()` allows custom logic at initialization time.
// The construction arguments are passed.
//  - They can be validated, normalized, etc.
//  - No third argument is passed. This enforces calling named parameters
//    `new ErrorType('message', opts)` instead of positional ones, which is
//    cleaner.
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
