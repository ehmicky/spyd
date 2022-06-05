import { normalizeError } from './normalize/main.js'
import { setErrorProperty } from './normalize/set.js'

export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return mergeCause(errorA)
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
const mergeCause = function (parent) {
  if (parent.cause === undefined) {
    return parent
  }

  const child = mergeCause(parent.cause)
  const message = mergeMessage(parent.message, child.message)
  const mergedError = createError(parent, child, message)
  fixStack(mergedError, child)
  copyProps(mergedError, parent, child)
  return normalizeError(mergedError)
}

const mergeMessage = function (rawParentMessage, rawChildMessage) {
  const parentMessage = rawParentMessage.trim()
  const childMessage = rawChildMessage.trim()

  if (parentMessage === '') {
    return childMessage
  }

  if (childMessage === '') {
    return parentMessage
  }

  return concatMessages(parentMessage, childMessage, rawParentMessage)
}

const concatMessages = function (
  parentMessage,
  childMessage,
  rawParentMessage,
) {
  if (!parentMessage.endsWith(PREPEND_CHAR)) {
    return `${childMessage}\n${parentMessage}`
  }

  return rawParentMessage.endsWith(PREPEND_NEWLINE_CHAR)
    ? `${parentMessage}\n${childMessage}`
    : `${parentMessage} ${childMessage}`
}

const PREPEND_CHAR = ':'
const PREPEND_NEWLINE_CHAR = '\n'

// Ensure both the prototype and `error.name` are correct, by creating a new
// instance with the right constructor.
// The
const createError = function (parent, child, message) {
  if (isSimpleErrorType(parent)) {
    return createCauseError(parent, child, message)
  }

  try {
    return new parent.constructor(message)
  } catch {
    return createCauseError(parent, child, message)
  }
}

const createCauseError = function (parent, child, message) {
  if (isSimpleErrorType(child)) {
    return createSimpleErrorType(parent, child, message)
  }

  try {
    return new child.constructor(message)
  } catch {
    return createSimpleErrorType(parent, child, message)
  }
}

const isSimpleErrorType = function (error) {
  return error.constructor === Error || error.constructor === AggregateError
}

const createSimpleErrorType = function (parent, child, message) {
  return parent.constructor === AggregateError ||
    child.constructor === AggregateError
    ? new AggregateError([], message)
    : new Error(message)
}

// Only show the child error's stack trace since the parent one contains mostly
// the same lines
const fixStack = function (mergedError, child) {
  setErrorProperty(mergedError, 'stack', child.stack)
}

// Merge error properties, shallowly, with parent error having priority
const copyProps = function (mergedError, parent, child) {
  mergeProps(mergedError, child)
  mergeProps(mergedError, parent)
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
