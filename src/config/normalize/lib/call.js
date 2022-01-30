import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

// Most definition methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
// Errors add the `value` as suffix.
export const callValueFunc = async function (userFunc, value, opts) {
  try {
    return await callUserFunc(userFunc.bind(undefined, value), opts)
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
  { validate = false, ...opts },
) {
  try {
    return await maybeFunction(userFunc, opts)
  } catch (error) {
    handleValidateError(error, validate)
    throw wrapError(error, `Configuration property "${opts.name}" `)
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
const handleValidateError = function (error, validate) {
  if (validate && isValidateError(error)) {
    error.validation = true
  }
}

const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}
