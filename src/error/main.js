// We distinguish between user, plugin and core errors.
// We also define abort errors, which are user-driven but are not failures.
// Limit errors are also special as they are user-driven but are a different
// kind of failure.
const getErrorType = function (name) {
  return class extends Error {
    constructor(...args) {
      super(...args)
      // eslint-disable-next-line fp/no-this, fp/no-mutation
      this.name = name
    }
  }
}

export const StopError = getErrorType('StopError')
export const CoreError = getErrorType('CoreError')
export const PluginError = getErrorType('PluginError')
export const UserError = getErrorType('UserError')
export const LimitError = getErrorType('LimitError')

// Retrieve error type-specific behavior
export const getErrorProps = function ({ name }) {
  const nameA = ERROR_PROPS[name] === undefined ? CORE_ERROR_NAME : name
  return ERROR_PROPS[nameA]
}

const ERROR_PROPS = {
  StopError: { exitCode: 0, printStack: false, indented: true },
  CoreError: { exitCode: 1, printStack: true, indented: false },
  PluginError: { exitCode: 2, printStack: true, indented: false },
  UserError: { exitCode: 3, printStack: false, indented: false },
  LimitError: { exitCode: 4, printStack: false, indented: false },
}

const CORE_ERROR_NAME = 'CoreError'

// Ensure we are using an Error instance
export const normalizeError = function (error) {
  return error instanceof Error ? error : new Error(error)
}

// Append a suffix or prefix to an error message
export const wrapErrorMessage = function (error, message) {
  const errorA = normalizeError(error)
  // eslint-disable-next-line fp/no-mutation
  errorA.message = message.trim().replace('$1', errorA.message.trim())
  return errorA
}
