import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { addPrefix } from './prefix.js'
import { handleValidateError } from './validate.js'

// TODO: call logic should not check `typeof function` anymore
export const callFunc = async function ({
  func,
  input,
  opts,
  hasInput,
  undefinedInput,
}) {
  if (hasInput) {
    return await callInputFunc(func, input, opts)
  }

  if (undefinedInput === true) {
    return await callNoInputFunc(func, opts)
  }

  return await callConstraintFunc(func, opts)
}

// Most rule methods follow the same patterns:
//  - Called with `input` and `opts`
//  - Optionally async
const callInputFunc = async function (userFunc, input, opts) {
  try {
    return typeof userFunc === 'function'
      ? await callUserFunc(userFunc.bind(undefined, input), opts)
      : userFunc
  } catch (error) {
    const errorA = handleError(error, opts)
    const errorB = addCurrentValue(errorA, input)
    throw await addExampleValue(errorB, opts)
  }
}

// Some methods are not called with any `input` but their logic requires knowing
// whether it is undefined
const callConstraintFunc = async function (userFunc, opts) {
  try {
    return typeof userFunc === 'function'
      ? await callUserFunc(userFunc, opts)
      : userFunc
  } catch (error) {
    const errorA = handleError(error, opts)
    throw await addExampleValue(errorA, opts)
  }
}

// Some methods are not called with any input
export const callNoInputFunc = async function (userFunc, opts) {
  try {
    return typeof userFunc === 'function'
      ? await callUserFunc(userFunc, opts)
      : userFunc
  } catch (error) {
    throw handleError(error, opts)
  }
}

const handleError = function (error, opts) {
  handleValidateError(error)
  return addPrefix(error, opts)
}

// Add the current input value as error suffix
const addCurrentValue = function (error, input) {
  return error.validation
    ? wrapErrorValue(error, 'Current value', input)
    : error
}

// Add an example input value as error suffix, as provided by `example[(opts)]`
const addExampleValue = async function (error, opts) {
  if (opts.example === undefined || !error.validation) {
    return error
  }

  try {
    const exampleValue = await callNoInputFunc(opts.example, opts)
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

// eslint-disable-next-line no-unused-vars
const callUserFunc = async function (userFunc, { example, prefix, ...opts }) {
  return await maybeFunction(userFunc, opts)
}
