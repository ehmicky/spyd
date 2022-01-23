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

// Wrap a child error with a new message and type
export const wrapError = function (error, message, ErrorType) {
  const errorA = normalizeError(error)
  const errorB = changeErrorType(errorA, ErrorType)
  const errorC = wrapErrorMessage(errorB, message)
  return errorC
}

// Modify error class and `name` while keeping its other properties:
// `message`, `stack` and static properties.
const changeErrorType = function (error, ErrorType) {
  if (ErrorType === undefined || error instanceof ErrorType) {
    return error
  }

  const newError = new ErrorType(error.message)
  // eslint-disable-next-line fp/no-mutation
  newError.stack = error.stack

  if (newError.stack.startsWith(`${error.name}:`)) {
    // eslint-disable-next-line fp/no-mutation
    newError.stack = newError.stack.replace(error.name, newError.name)
  }

  return newError
}

// Prepend a prefix to an error message
const wrapErrorMessage = function (error, message) {
  const space = WHITESPACE_END_REGEXP.test(message) ? '' : ' '
  error.message = `${message}${space}${error.message.trim()}`
  fixErrorStack(error)
  return error
}

const WHITESPACE_END_REGEXP = /\s$/u

// `error.name` and `error.message` are prepended to `error.stack`.
// However, if `error.stack` has already been retrieved, it is cached.
// Therefore modifying `error.message` would not reflect in `error.stack`.
// Works with multiline error messages.
const fixErrorStack = function (error) {
  if (!error.stack.includes(STACK_TRACE_START)) {
    Error.captureStackTrace(error, wrapErrorMessage)
  }

  const stackStart = error.stack.indexOf(STACK_TRACE_START)
  const stackLines = stackStart === -1 ? '' : error.stack.slice(stackStart)
  error.stack = `${error.name}: ${error.message}${stackLines}`
}

const STACK_TRACE_START = '\n    at '

// Ensure we are using an Error instance
export const normalizeError = function (error) {
  return error instanceof Error ? error : new Error(error)
}
