import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { handleValidateError } from './validate.js'

// Most definition methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
// Errors add as suffix:
//  - The current `value`
//  - `definition.example`, if provided
export const callValueFunc = async function (userFunc, value, opts) {
  try {
    return await callWithValueFunc(userFunc, value, opts)
  } catch (error) {
    throw await handleValueError(error, value, opts)
  }
}

const handleValueError = async function (error, value, opts) {
  const currentValueStr = getCurrentValue(value)
  const exampleValueStr = await getExampleValue(error, value, opts)
  const message = `${currentValueStr}${exampleValueStr}`
  return wrapError(error, message)
}

const getCurrentValue = function (value) {
  const valueStr = serializeValue(value)
  return `\nCurrent value:${valueStr}`
}

const getExampleValue = async function (error, value, opts) {
  if (opts.example === undefined || !error.validation) {
    return ''
  }

  const exampleValue = await callWithValueFunc(opts.example, value, opts)
  const exampleValueStr = serializeValue(exampleValue)
  return `\nExample value:${exampleValueStr}`
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
    throw await handleValidateError(error, opts)
  }
}
