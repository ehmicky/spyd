import { createError } from './create.js'
import { setErrorProperty } from './set.js'
import { setFullStack, getStackHeader, fixStack } from './stack.js'

// Ensure we are using an Error instance
export const normalizeError = function (error, parents = []) {
  if (parents.includes(error)) {
    return
  }

  const parentsA = [...parents, error]
  const errorA = error instanceof Error ? error : createError(error)
  normalizeName(errorA)
  normalizeMessage(errorA)
  normalizeStack(errorA)
  normalizeCause(errorA, parentsA)
  normalizeAggregate(errorA, parentsA)
  return errorA
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
const normalizeCause = function (error, parents) {
  if (error.cause === undefined) {
    return
  }

  const cause = normalizeError(error.cause, parents)

  if (cause === undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.cause
  } else {
    setErrorProperty(error, 'cause', cause)
  }
}

// Recurse over `error.errors`.
// Also ensure `AggregateError` instance have an `errors` property.
const normalizeAggregate = function (error, parents) {
  if (Array.isArray(error.errors)) {
    const aggregateErrors = error.errors
      .map((aggregateError) => normalizeError(aggregateError, parents))
      .filter(Boolean)
    setErrorProperty(error, 'errors', aggregateErrors)
  } else if (error instanceof AggregateError) {
    setErrorProperty(error, 'errors', [])
  } else if (error.errors !== undefined) {
    // eslint-disable-next-line fp/no-delete
    delete error.errors
  }
}
