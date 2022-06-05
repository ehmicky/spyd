// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (errorName) {
  const ErrorType = class extends Error {
    // eslint-disable-next-line no-unused-vars
    constructor(message, { cause, name, ...props } = {}) {
      const errorOpts = cause === undefined ? {} : { cause }
      super(message, errorOpts)
      // eslint-disable-next-line fp/no-this, fp/no-mutating-assign
      Object.assign(this, props)
    }
  }
  setErrorName(ErrorType, errorName)
  return ErrorType
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
