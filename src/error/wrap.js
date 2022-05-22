import omit from 'omit.js'

import { normalizeError } from './utils.js'

// Wrap a child error with a new message and type
export const wrapError = function (error, prefix, ErrorType) {
  const errorA = normalizeError(error)
  const errorB = changeErrorType(errorA, ErrorType)
  const errorC = wrapErrorMessage(errorB, prefix)
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

// Prepend|append a prefix|suffix to an error message
const wrapErrorMessage = function (error, prefix) {
  if (prefix === '') {
    return error
  }

  const { message } = error
  error.message = prefix.startsWith('\n')
    ? `${message}${prefix}`
    : `${prefix}${getSpaceDelimiter(message, prefix)}${message.trimStart()}`
  fixErrorStack(error)
  return error
}

const getSpaceDelimiter = function (message, prefix) {
  return WHITESPACE_END_REGEXP.test(prefix) || message.startsWith("'")
    ? ''
    : ' '
}

const WHITESPACE_END_REGEXP = /\s$/u

// `error.name` and `error.message` are prepended to `error.stack`.
// However, if `error.stack` has already been retrieved, it is cached.
// Therefore modifying `error.message` would not reflect in `error.stack`.
// Works with multiline error messages.
const fixErrorStack = function (error) {
  if (!error.stack.includes(STACK_TRACE_START)) {
    Error.captureStackTrace(error, wrapError)
  }

  const stackStart = error.stack.indexOf(STACK_TRACE_START)
  const stackLines = stackStart === -1 ? '' : error.stack.slice(stackStart)
  error.stack = `${error.name}: ${error.message}${stackLines}`
}

const STACK_TRACE_START = '\n    at '

// Copy error static properties.
// This excludes special properties, like `name`, `message` and `stack`, without
// assuming they are non enumerable, because this is not always the case.
const copyStaticProps = function (newError, error) {
  if (newError === error) {
    return newError
  }

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(newError, omit.default(error, ERROR_CORE_PROPERTIES))
  return newError
}

const ERROR_CORE_PROPERTIES = ['name', 'message', 'stack', 'cause', 'errors']
