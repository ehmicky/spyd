import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { handleValidateError } from './validate.js'

// Most rule methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
export const callValueFunc = async function (userFunc, value, opts) {
  try {
    return await callWithValueFunc(userFunc, value, opts)
  } catch (error) {
    const errorA = addCurrentValue(error, value)
    throw await addExampleValue(errorA, value, opts)
  }
}

// Add the current value as error suffix
const addCurrentValue = function (error, value) {
  const valueStr = serializeValue(value)
  return wrapError(error, `\nCurrent value:${valueStr}`)
}

// Retrieve a validation error including the example suffix
export const getValidateExampleError = async function (error, value, opts) {
  const errorA = handleValidateError(error, opts)
  return await addExampleValue(errorA, value, opts)
}

// Add an example value as error suffix, as provided by `example(value, opts)`
const addExampleValue = async function (error, value, opts) {
  if (opts.example === undefined || !error.validation) {
    return error
  }

  const exampleValue = await callWithValueFunc(opts.example, value, opts)
  const exampleValueStr = serializeValue(exampleValue)
  return wrapError(error, `\nExample value:${exampleValueStr}`)
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}

const callWithValueFunc = async function (userFunc, value, opts) {
  const boundUserFunc =
    typeof userFunc === 'function' ? userFunc.bind(undefined, value) : userFunc
  return await callUserFunc(boundUserFunc, opts)
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
