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
export const createError = function (parent, child, message) {
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
