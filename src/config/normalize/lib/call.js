import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { addPrefix } from './prefix.js'
import { handleValidateError } from './validate.js'

// Most rule methods follow the same patterns:
//  - Called with `value` and `opts`
//  - Optionally async
export const callValueFunc = async function (userFunc, value, opts) {
  if (typeof userFunc !== 'function') {
    return userFunc
  }

  try {
    return await callUserFunc(userFunc.bind(undefined, value), opts)
  } catch (error) {
    handleValidateError(error)
    const errorA = addPrefix(error, opts)
    const errorB = addCurrentValue(errorA, value)
    throw await addExampleValue(errorB, opts)
  }
}

// Some methods are called with a `value` but it is always undefined
export const callUndefinedValueFunc = async function (userFunc, opts) {
  if (typeof userFunc !== 'function') {
    return userFunc
  }

  try {
    return await callUserFunc(userFunc, opts)
  } catch (error) {
    handleValidateError(error)
    const errorA = addPrefix(error, opts)
    throw await addExampleValue(errorA, opts)
  }
}

// Some methods are not called with any value
export const callNoValueFunc = async function (userFunc, opts) {
  if (typeof userFunc !== 'function') {
    return userFunc
  }

  try {
    return await callUserFunc(userFunc, opts)
  } catch (error) {
    handleValidateError(error)
    throw addPrefix(error, opts)
  }
}

// Add the current value as error suffix
const addCurrentValue = function (error, value) {
  return error.validation
    ? wrapErrorValue(error, 'Current value', value)
    : error
}

// Add an example value as error suffix, as provided by `example[(opts)]`
const addExampleValue = async function (error, opts) {
  if (opts.example === undefined || !error.validation) {
    return error
  }

  try {
    const exampleValue = await callNoValueFunc(opts.example, opts)
    return wrapErrorValue(error, 'Example value', exampleValue)
  } catch (error_) {
    return wrapError(error_, 'Invalid "example":')
  }
}

const wrapErrorValue = function (error, name, value) {
  return wrapError(error, `\n${name}:${serializeValue(value)}`)
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}

const callUserFunc = async function (userFunc, { funcOpts }) {
  return await maybeFunction(userFunc, funcOpts)
}
