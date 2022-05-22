// Ensure we are using an Error instance
export const normalizeError = function (error) {
  return error instanceof Error ? error : new Error(error)
}

// Create an error type with a specific `name`
export const createErrorType = function (name) {
  return class extends Error {
    constructor(message, opts) {
      super(message, opts)
      // eslint-disable-next-line fp/no-this, fp/no-mutation
      this.name = name
    }
  }
}

// Retrieve error type-specific behavior
export const getErrorTypeProps = function (name, errorProps, defaultName) {
  return typeof name === 'string' && name in errorProps
    ? errorProps[name]
    : errorProps[defaultName]
}
