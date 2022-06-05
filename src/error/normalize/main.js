import { setFullStack, getStackHeader, fixStack } from './stack.js'

// Ensure we are using an Error instance
export const normalizeError = function (error) {
  if (!(error instanceof Error)) {
    return createError(error)
  }

  normalizeName(error)
  normalizeMessage(error)
  normalizeStack(error)
  normalizeCause(error)
  normalizeAggregate(error)
  return error
}

// If an exception is not an Error instance, create one.
// `String()` might throw due to `value.toString()`, so we handle it.
const createError = function (value) {
  try {
    const error = new Error(String(value))
    setFullStack(error)
    return error
  } catch (error_) {
    return error_
  }
}

// Ensure `error.name` is a string
const normalizeName = function (error) {
  if (!isDefinedString(error.name)) {
    setErrorProperty(
      error,
      'name',
      isDefinedString(error.constructor.name)
        ? error.constructor.name
        : 'Error',
    )
  }
}

// Ensure `error.message` is a string
const normalizeMessage = function (error) {
  if (!isDefinedString(error.message)) {
    error.message = ''
  }
}

// Ensure `error.stack` exists and looks normal
const normalizeStack = function (error) {
  if (!isDefinedString(error.stack)) {
    setFullStack(error)
  }

  const header = getStackHeader(error)

  if (!error.stack.startsWith(header)) {
    fixStack(error, header)
  }
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value !== ''
}

// Recurse over `error.cause`
const normalizeCause = function (error) {
  if (error.cause !== undefined) {
    error.cause = normalizeError(error.cause)
  }
}

// Recurse over `error.errors`
const normalizeAggregate = function (error) {
  if (hasAggregate(error)) {
    error.errors = error.errors.map(normalizeError)
  }
}

const hasAggregate = function (error) {
  return (
    Array.isArray(error.errors) &&
    (error instanceof AggregateError || error.errors.some(isErrorInstance))
  )
}

const isErrorInstance = function (error) {
  return error instanceof Error
}

// Error properties are non-enumerable
const setErrorProperty = function (error, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'name', {
    value,
    writable: true,
    enumerable: false,
  })
}
