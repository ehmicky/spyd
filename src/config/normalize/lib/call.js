import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

// Most definition methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
// Errors add the `value` as suffix.
export const callValueFunc = async function (userFunc, value, opts) {
  const boundUserFunc =
    typeof userFunc === 'function' ? userFunc.bind(undefined, value) : userFunc

  try {
    return await callUserFunc(boundUserFunc, opts)
  } catch (error) {
    throw handleValueError(error, value)
  }
}

const handleValueError = function (error, value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  const message = `\nCurrent value:${separator}${valueStr}`
  return wrapError(error, message)
}

// Some methods do not pass any `value` as first argument.
// Errors add the property `name` as prefix.
export const callUserFunc = async function (
  userFunc,
  { validate, prefix, ...opts },
) {
  try {
    return await maybeFunction(userFunc, opts)
  } catch (error) {
    throw handleValidateError(error, { ...opts, validate, prefix })
  }
}

// Consumers can distinguish users errors from system bugs by checking
// the `error.validation` boolean property.
// User errors require both:
//  - Using `validate()`, not other definition methods
//  - Making the error message start with "must"
// We fail on the first error, as opposed to aggregating all errors
//  - Otherwise, a failed property might be used by another property, which
//    would also appear as failed, even if it has no issues
// We detect this using the error message instead of the error class because:
//  - It is simpler for users
//  - It works both on browsers and in Node.js
//  - It ensures the error message looks good
export const callValidateFunc = async function (validate, value, opts) {
  await callValueFunc(validate, value, { ...opts, validate: true })
}

// Throw a user validation error
export const throwValidateError = function (message, opts) {
  const error = new Error(message)
  setValidationProp(error)
  throw addPropPrefix(error, opts)
}

const handleValidateError = function (error, opts) {
  if (opts.validate && isValidateError(error)) {
    setValidationProp(error)
  }

  return addPropPrefix(error, opts)
}

const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}

const setValidationProp = function (error) {
  error.validation = true
}

const addPropPrefix = function (error, opts) {
  return wrapError(error, getPropName(opts))
}

export const DEFAULT_PREFIX = 'Configuration property'

const getPropName = function ({ prefix, name }) {
  const space = prefix.endsWith(' ') || prefix.endsWith('.') ? '' : ' '
  return `${prefix}${space}${name} `
}
