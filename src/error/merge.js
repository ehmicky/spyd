import { normalizeError } from './normalize/main.js'
import { setErrorProperty } from './normalize/set.js'

// Merge `error.cause` recursively to a single error.
// This allows consumers to conveniently wrap errors using:
//   try {
//     ...
//   } catch (error) {
//     throw new ErrorType('message', { cause: error })
//   }
// While still working around the following issues with `error.cause`:
//  - The consumer needs to traverse `error.cause`
//     - to retrieve both error class and properties
//     - traversing is especially tricky since:
//        - exceptions might not be error instances
//        - the recursion might be infinite
//  - The stack trace shows the innermost error message last, even though it is
//    the most relevant one
//  - The stack trace of each error is most likely a duplicate of the others
//     - This is because, in most cases, `try/catch` blocks follow the stack
//       trace
//     - This might not be the case if:
//        - `Error.stackTraceLimit` is too low, in which case it should be
//          increased
//        - Using callbacks, in which case `async`/`await` should be used
//  - When printed, each error cause is indented and prints its own stack trace,
///   which is very verbose and hard to read
// In Node <16.9.0 and in some browsers, `error.cause` requires a polyfill like
// `error-cause`.
export const mergeErrorCause = function (error) {
  const errorA = normalizeError(error)
  return mergeCause(errorA)
}

// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// `normalizeError()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
const mergeCause = function (parent) {
  if (parent.cause === undefined) {
    return parent
  }

  const child = mergeCause(parent.cause)
  const message = mergeMessage(parent.message, child.message)
  const mergedError = createError(parent, child, message)
  fixStack(mergedError, child)
  mergeAggregate(mergedError, parent, child)
  copyProps(mergedError, parent, child)
  return normalizeError(mergedError)
}

// Merge parent and child error messages.
// By default, parent messages are appended
//  - This is because the innermost message is the most relevant one which
//    should be read first by users
//  - However, the parent can opt-in to being prepended instead by ending
//    with `:`, optionally followed by a newline.
// Each error message is on its own line, for clarity.
// Empty messages are ignored
//  - This is useful when wrapping an error properties, but not message
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
// The parent error's type has priority unless:
//  - It is Error|AggregateError, which allows wrapping an error message or
//    properties without changing its type
//  - Its constructor throws
// If both parent and child constructors throw, we default to Error.
// If both parent and child are Error|AggregateError, we privilege
// AggregateError if any is an instance, since the `errors` property should only
// be used on AggregateError.
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

// Keep `error.errors` when merging errors.
// If multiple errors have `errors`, the parent's errors are prepended.
// `error.errors[*].cause` are recursed.
// We do not merge `error.errors` into a single error:
// - Because:
//    - Unlike `error.cause`, those are separate errors, which should remain so
//    - Each error's message and stack trace should be kept as is, otherwise:
//       - Those could be very long if `error.errors` is large
//       - Those could lead to confusing stack traces
// - I.e. it is the responsibility of the consumers to recurse and handle
//   `error.errors`
const mergeAggregate = function (mergedError, parent, child) {
  const parentErrors = getAggregateErrors(parent)
  const childErrors = getAggregateErrors(child)

  if (parentErrors === undefined && childErrors === undefined) {
    return
  }

  const errors = getMergedErrors(parentErrors, childErrors)
  setErrorProperty(mergedError, 'errors', errors)
}

const getAggregateErrors = function (error) {
  return hasAggregateErrors(error) ? error.errors.map(mergeCause) : undefined
}

const hasAggregateErrors = function (error) {
  return (
    Array.isArray(error.errors) &&
    (error instanceof AggregateError || error.errors.some(isErrorInstance))
  )
}

const isErrorInstance = function (error) {
  return error instanceof Error
}

const getMergedErrors = function (parentErrors, childErrors) {
  if (parentErrors === undefined) {
    return childErrors
  }

  if (childErrors === undefined) {
    return parentErrors
  }

  return [...childErrors, ...parentErrors]
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
