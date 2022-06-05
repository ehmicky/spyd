import { normalizeError } from './normalize/main.js'
import { setErrorProperty } from './normalize/set.js'

export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return mergeCause(errorA)
}

const mergeCause = function (error) {
  if (error.cause === undefined) {
    return error
  }

  const cause = mergeCause(error.cause)
  const message = mergeMessage(error.message, cause.message)
  const mergedError = createError(error, cause, message)
  fixStack(mergedError)
  copyProps(mergedError, error, cause)
  return normalizeError(mergedError)
}

const mergeMessage = function (rawMessageA, rawMessageB) {
  const messageA = rawMessageA.trim()
  const messageB = rawMessageB.trim()

  if (messageA === '') {
    return messageB
  }

  if (messageB === '') {
    return messageA
  }

  return concatMessages(messageA, messageB, rawMessageA)
}

const concatMessages = function (messageA, messageB, rawMessageA) {
  if (!messageA.endsWith(PREPEND_CHAR)) {
    return `${messageB}\n${messageA}`
  }

  return rawMessageA.endsWith(PREPEND_NEWLINE_CHAR)
    ? `${messageA}\n${messageB}`
    : `${messageA} ${messageB}`
}

const PREPEND_CHAR = ':'
const PREPEND_NEWLINE_CHAR = '\n'

const createError = function (error, cause, message) {
  if (error.constructor === Error || error.constructor === AggregateError) {
    return createCauseError(message)
  }

  try {
    return newError(error, message)
  } catch {
    return createCauseError(message)
  }
}

const createCauseError = function (cause, message) {
  try {
    return newError(cause, message)
  } catch {
    return new Error(message)
  }
}

const newError = function (error, message) {
  const ErrorType = error.constructor
  return ErrorType === AggregateError
    ? new ErrorType([], message)
    : new ErrorType(message)
}

const fixStack = function (mergedError, cause) {
  setErrorProperty(mergedError, 'stack', cause.stack)
}

// Merge error properties, shallowly, with outer error having priority
const copyProps = function (mergedError, error, cause) {
  mergeProps(mergedError, cause)
  mergeProps(mergedError, error)
}

// Do not merge inherited properties nor non-enumerable properties
const mergeProps = function (mergedError, error) {
  // eslint-disable-next-line guard-for-in, fp/no-loops
  for (const propName in error) {
    const descriptor = Object.getOwnPropertyDescriptor(error, propName)

    // eslint-disable-next-line max-depth
    if (descriptor === undefined && !CORE_ERROR_PROPS.has(propName)) {
      // eslint-disable-next-line fp/no-mutating-methods
      Object.defineProperty(mergedError, propName, descriptor)
    }
  }
}

// Do not copy core error properties.
// Does not assume they are not enumerable.
const CORE_ERROR_PROPS = new Set([
  'name',
  'message',
  'stack',
  'cause',
  'errors',
])
