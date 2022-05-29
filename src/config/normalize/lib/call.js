import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'

// Call a function from `test()`, `main()` or a definition.
// They are all:
//  - Optionally async
//  - Called with same arguments
//  - Error handled
export const callFunc = async function ({
  func,
  input,
  info: { originalName },
  info: { example, prefix, ...info },
  hasInput,
  test,
}) {
  try {
    return await (hasInput ? func(input, info) : func(info))
  } catch (error) {
    throw handleError({
      error,
      input,
      example,
      prefix,
      originalName,
      hasInput,
      test,
    })
  }
}

const handleError = function ({
  error,
  input,
  example,
  prefix,
  originalName,
  hasInput,
  test,
}) {
  const isValidation = isValidateError(error)
  const errorA = addPrefix({ error, prefix, originalName, isValidation })

  if (!isValidation) {
    return errorA
  }

  // eslint-disable-next-line fp/no-mutation
  errorA.validation = true
  const errorB = addCurrentValue(errorA, input, hasInput)
  const errorC = addExampleValue({ error: errorB, example, hasInput, test })
  return errorC
}

// Consumers can distinguish users errors from system bugs by checking
// the `error.validation` boolean property.
// User errors are distinguished by having error message starting with "must".
// We fail on the first error, as opposed to aggregating all errors
//  - Otherwise, a failed property might be used by another property, which
//    would also appear as failed, even if it has no issues
// We detect this using the error message instead of the error class because:
//  - It is simpler for users
//  - It works both on browsers and in Node.js
//  - It ensures the error message looks good
const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}

const addPrefix = function ({ error, prefix, originalName, isValidation }) {
  const prefixA = getPrefix(prefix, originalName)
  const prefixB = isValidation ? prefixA : `${prefixA}: `
  return wrapError(error, prefixB)
}

// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
export const getPrefix = function (prefix, originalName) {
  return `${prefix} "${originalName}"`
}

// Add the current input value as error suffix
const addCurrentValue = function (error, input, hasInput) {
  return hasInput ? wrapErrorValue(error, 'Current value', input) : error
}

// Add the example as error suffix
const addExampleValue = function ({ error, example, hasInput, test }) {
  return example !== undefined && (hasInput || test !== undefined)
    ? wrapErrorValue(error, 'Example value', example)
    : error
}

const wrapErrorValue = function (error, name, value) {
  return wrapError(error, `\n${name}:${serializeValue(value)}`)
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}
