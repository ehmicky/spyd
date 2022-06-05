import { normalizeError } from '../normalize/main.js'
import { setErrorProperty } from '../normalize/set.js'

import { mergeMessage } from './message.js'
import { copyProps } from './props.js'
import { hasStack, fixStack } from './stack.js'

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
// The recursion is applied pair by pair, as opposed to all errors at once.
//  - This ensures the same result no matter how many times this function
//    applied along the stack trace
// `normalizeError()` is called again to ensure the new `name|message` is
// reflected in `error.stack`.
export const mergeErrorCause = function (error) {
  const hasChildStack = hasStack(error.cause)
  const parent = normalizeError(error)
  const parentErrors = getAggregateErrors(parent)

  if (parent.cause === undefined) {
    setAggregate(parent, parentErrors)
    return parent
  }

  return mergeCause(parent, parentErrors, hasChildStack)
}

const mergeCause = function (parent, parentErrors, hasChildStack) {
  const child = mergeErrorCause(parent.cause)
  const message = mergeMessage(parent.message, child.message)
  const mergedError = createError(parent, child, message)
  fixStack({ mergedError, parent, child, hasChildStack })
  mergeAggregate(mergedError, parentErrors, child)
  copyProps(mergedError, parent, child)
  return normalizeError(mergedError)
}

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
const setAggregate = function (parent, parentErrors) {
  if (parentErrors !== undefined) {
    setErrorProperty(parent, 'errors', parentErrors)
  }
}

const mergeAggregate = function (mergedError, parentErrors, child) {
  const childErrors = getAggregateErrors(child)

  if (parentErrors === undefined && childErrors === undefined) {
    return
  }

  const errors = getMergedErrors(parentErrors, childErrors)
  setErrorProperty(mergedError, 'errors', errors)
}

const getAggregateErrors = function (error) {
  return Array.isArray(error.errors)
    ? error.errors.map(mergeErrorCause)
    : undefined
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
