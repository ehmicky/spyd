// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (
  errorName,
  onCreate = defaultOnCreate,
) {
  validateErrorName(errorName)
  const ErrorType = class extends Error {
    // eslint-disable-next-line no-unused-vars
    constructor(message, { cause, name, ...opts } = {}) {
      const errorOpts = cause === undefined ? {} : { cause }
      super(message, errorOpts)
      // eslint-disable-next-line fp/no-this
      onCreate(this, opts)
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
