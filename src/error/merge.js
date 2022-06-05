import { normalizeError } from './normalize/main.js'
import { setErrorProperty } from './normalize/set.js'

export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return mergeCause(errorA)
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
const mergeCause = function (error) {
  if (error.cause === undefined) {
    return error
  }

  const cause = mergeCause(error.cause)
  const message = mergeMessage(error.message, cause.message)
  const mergedError = createError(error, cause, message)
  fixStack(mergedError, cause)
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
  if (isSimpleErrorType(error)) {
    return createCauseError(error, cause, message)
  }

  try {
    return new error.constructor(message)
  } catch {
    return createCauseError(error, cause, message)
  }
}

const createCauseError = function (error, cause, message) {
  if (isSimpleErrorType(cause)) {
    return createSimpleErrorType(error, cause, message)
  }

  try {
    return new cause.constructor(message)
  } catch {
    return createSimpleErrorType(error, cause, message)
  }
}

const isSimpleErrorType = function (error) {
  return error.constructor === Error || error.constructor === AggregateError
}

const createSimpleErrorType = function (error, cause, message) {
  return error.constructor === AggregateError ||
    cause.constructor === AggregateError
    ? new AggregateError([], message)
    : new Error(message)
}

// Only show the inner error's stack trace since the outer one contains mostly
// the same lines
const fixStack = function (mergedError, cause) {
  setErrorProperty(mergedError, 'stack', cause.stack)
}

// Merge error properties, shallowly, with outer error having priority
const copyProps = function (mergedError, error, cause) {
  mergeProps(mergedError, cause)
  mergeProps(mergedError, error)
}

// Do not merge inherited properties nor non-enumerable properties.
// Works with symbol properties.
const mergeProps = function (mergedError, error) {
  // eslint-disable-next-line guard-for-in, fp/no-loops
  for (const propName in error) {
    mergeProp(mergedError, error, propName)
  }

  // eslint-disable-next-line fp/no-loops
  for (const propName of Object.getOwnPropertySymbols(error)) {
    mergeProp(mergedError, error, propName)
  }
}

const mergeProp = function (mergedError, error, propName) {
  const descriptor = Object.getOwnPropertyDescriptor(error, propName)

  if (descriptor !== undefined && !CORE_ERROR_PROPS.has(propName)) {
    // eslint-disable-next-line fp/no-mutating-methods
    Object.defineProperty(mergedError, propName, descriptor)
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
