import { inspect } from 'util'

import { normalizeError } from '../../../error/main.js'
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
    throw await handleValidateError(error, { ...opts, validate, prefix })
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
export const throwValidateError = async function (message, opts) {
  const error = new Error(message)
  setValidationProp(error)
  throw await addPropPrefix(error, opts)
}

const handleValidateError = async function (error, opts) {
  if (opts.validate && isValidateError(error)) {
    setValidationProp(error)
  }

  return await addPropPrefix(error, opts)
}

const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}

const setValidationProp = function (error) {
  error.validation = true
}

const addPropPrefix = async function (error, opts) {
  const propName = await getPropName(opts)
  return wrapError(error, propName)
}

export const DEFAULT_PREFIX = 'Configuration property'

const getPropName = async function (opts) {
  const prefix = await callPrefix(opts)
  const space =
    prefix === '' || prefix.endsWith(' ') || prefix.endsWith('.') ? '' : ' '
  return `${prefix}${space}${opts.name} `
}

const callPrefix = async function (opts) {
  try {
    const prefix = await callUserFunc(opts.prefix, {
      ...opts,
      validate: false,
      prefix: '',
    })
    return String(prefix)
  } catch (error) {
    const { message } = normalizeError(error)
    return `${message}\n`
  }
}
