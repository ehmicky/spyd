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
export const callUserFunc = async function (userFunc, opts) {
  try {
    return await maybeFunction(userFunc, opts)
  } catch (error) {
    throw wrapError(error, `Configuration property "${opts.name}":`)
  }
}
