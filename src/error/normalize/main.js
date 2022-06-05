import { setErrorProperty } from './set.js'
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
    const name = isDefinedString(error.constructor.name)
      ? error.constructor.name
      : 'Error'
    setErrorProperty(error, 'name', name)
  }
}

// Ensure `error.message` is a string
const normalizeMessage = function (error) {
  if (!isDefinedString(error.message)) {
    setErrorProperty(error, 'message', '')
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
    setErrorProperty(error, 'cause', normalizeError(error.cause))
  }
}

// Recurse over `error.errors`.
// Also ensure `AggregateError` instance have an `errors` property.
const normalizeAggregate = function (error) {
  if (Array.isArray(error.errors)) {
    normalizeAggregateErrors(error)
  } else if (error instanceof AggregateError) {
    setErrorProperty(error, 'errors', [])
  }
}

const normalizeAggregateErrors = function (error) {
  if (error instanceof AggregateError || error.errors.some(isErrorInstance)) {
    setErrorProperty(error, 'errors', error.errors.map(normalizeError))
  }
}

const isErrorInstance = function (error) {
  return error instanceof Error
}
