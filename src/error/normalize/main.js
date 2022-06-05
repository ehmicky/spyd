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

const createError = function (value) {
  try {
    const error = new Error(String(value))
    setFullStack(error)
    return error
  } catch (error_) {
    return error_
  }
}

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

const normalizeMessage = function (error) {
  if (!isDefinedString(error.message)) {
    error.message = ''
  }
}

const normalizeStack = function (error) {
  if (!isDefinedString(error.stack)) {
    setFullStack(error)
  }

  const header = getStackHeader(error)

  if (!error.stack.startsWith(header)) {
    fixStack(error, header)
  }
}

const setFullStack = function (error) {
  error.stack = `${getStackHeader(error)}\n${getStackTrace()}`
}

const getStackHeader = function (error) {
  return `${error.name}: ${error.message}`
}

const fixStack = function (error, header) {
  const lines = error.stack.split('\n')
  const index = lines.findIndex(isStackLine)
  const linesA = index === -1 ? [getStackTrace()] : lines.slice(index)
  error.stack = [header, ...linesA].join('\n')
}

const isStackLine = function (line) {
  return STACK_LINE_REGEXP.test(line)
}

const STACK_LINE_REGEXP = /^\s*at\s/u

const getStackTrace = function () {
  // eslint-disable-next-line unicorn/error-message
  const lines = new Error('').stack.split('\n')
  const index = findInternalIndex(lines)
  return lines.slice(index).join('\n')
}

// Remove stack lines due to this library itself.
// `index` should never be `-1`, but we include this as a failsafe.
// The stack trace might be truncated, e.g. due to `Error.stackTraceLimit` in
// Node.js, leading to the whole stack to be removed. In that case, we keep the
// last stack line.
const findInternalIndex = function (lines) {
  const index = findLastIndex(lines, isInternalStackLine)

  if (index === -1) {
    return 1
  }

  return lines.length - 1 === index ? index : index + 1
}

// TODO: use `Array.findLastIndex()` after dropping support for Node <18
const findLastIndex = function (array, condition) {
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = array.length - 1; index >= 0; index -= 1) {
    // eslint-disable-next-line max-depth
    if (condition(array[index])) {
      return index
    }
  }

  return -1
}

const isInternalStackLine = function (line) {
  return line.includes(`at ${normalizeError.name}`)
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value !== ''
}

const normalizeCause = function (error) {
  if (error.cause !== undefined) {
    error.cause = normalizeError(error.cause)
  }
}

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

const setErrorProperty = function (error, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'name', {
    value,
    writable: true,
    enumerable: false,
  })
}
