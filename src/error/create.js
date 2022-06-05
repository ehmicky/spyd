// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (
  errorName,
  onCreate = defaultOnCreate,
) {
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
