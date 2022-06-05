// Create an error type with a specific `name`.
// The constructor allows setting either `error.cause` or any properties:
// `new ErrorType('message', { anyProp: true })`
export const createErrorType = function (name) {
  return class extends Error {
    constructor(message, { cause, ...props } = {}) {
      super(message, { cause })
      // eslint-disable-next-line fp/no-this, fp/no-mutating-assign
      Object.assign(this, props)
      // eslint-disable-next-line fp/no-this, fp/no-mutation
      this.name = name
    }
  }
}
