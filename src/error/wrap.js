import { normalizeError } from './main.js'

// Wrap a child error with a new message and type
export const wrapError = function (error, message, ErrorType) {
  const errorA = normalizeError(error)
  const errorB = changeErrorType(errorA, ErrorType)
  const errorC = wrapErrorMessage(errorB, message)
  const errorD = copyStaticProps(errorC, error)
  return errorD
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
  if (message === '') {
    return error
  }

  const space = WHITESPACE_END_REGEXP.test(message) ? '' : ' '
  error.message = message.startsWith('\n')
    ? `${error.message}${message}`
    : `${message}${space}${error.message.trim()}`
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

// Copy error static properties.
// This excludes non-enumerable properties, especially `name`, `message` and
// `stack`
const copyStaticProps = function (newError, error) {
  if (newError === error) {
    return newError
  }

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(newError, error)
  return newError
}
