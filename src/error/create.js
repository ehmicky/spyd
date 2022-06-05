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
