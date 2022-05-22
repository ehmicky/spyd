import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { handleValidateError } from './validate.js'

// Most rule methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
export const callValueFunc = async function (userFunc, value, opts) {
  try {
    const boundUserFunc =
      typeof userFunc === 'function'
        ? userFunc.bind(undefined, value)
        : userFunc
    return await callUserFunc(boundUserFunc, opts)
  } catch (error) {
    const errorA = addCurrentValue(error, value)
    throw await addExampleValue(errorA, opts)
  }
}

// Add the current value as error suffix
const addCurrentValue = function (error, value) {
  const valueStr = serializeValue(value)
  return wrapError(error, `\nCurrent value:${valueStr}`)
}

// Retrieve a validation error including the example suffix
export const getValidateExampleError = async function (error, opts) {
  const errorA = handleValidateError(error, opts)
  return await addExampleValue(errorA, opts)
}

// Add an example value as error suffix, as provided by `example[(opts)]`
const addExampleValue = async function (error, opts) {
  if (opts.example === undefined || !error.validation) {
    return error
  }

  const exampleValue = await callUserFunc(opts.example, opts)
  const exampleValueStr = serializeValue(exampleValue)
  return wrapError(error, `\nExample value:${exampleValueStr}`)
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}

// Some methods do not pass any `value` as first argument.
// Errors add the property `name` as prefix.
export const callUserFunc = async function (userFunc, opts) {
  try {
    return await maybeFunction(userFunc, opts.funcOpts)
  } catch (error) {
    throw handleValidateError(error, opts)
  }
}
