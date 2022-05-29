import { inspect } from 'util'

import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

import { addPrefix } from './prefix.js'
import { handleValidateError } from './validate.js'

export const callFunc = async function ({ func, input, info, hasInput, test }) {
  if (hasInput) {
    return await callInputFunc(func, input, info)
  }

  if (test === undefined) {
    return await callNoInputFunc(func, info)
  }

  return await callConstraintFunc(func, info)
}

// Most rule methods follow the same patterns:
//  - Called with `input` and `info`
//  - Optionally async
export const callInputFunc = async function (userFunc, input, info) {
  try {
    return await callUserFunc(userFunc.bind(undefined, input), info)
  } catch (error) {
    const errorA = handleError(error, info)
    const errorB = addCurrentValue(errorA, input)
    throw addExampleValue(errorB, info)
  }
}

// Some methods are not called with any `input` but their logic requires knowing
// whether it is undefined
const callConstraintFunc = async function (userFunc, info) {
  try {
    return await callUserFunc(userFunc, info)
  } catch (error) {
    const errorA = handleError(error, info)
    throw addExampleValue(errorA, info)
  }
}

// Some methods are not called with any input
const callNoInputFunc = async function (userFunc, info) {
  try {
    return await callUserFunc(userFunc, info)
  } catch (error) {
    throw handleError(error, info)
  }
}

const handleError = function (error, info) {
  handleValidateError(error)
  return addPrefix(error, info)
}

// Add the current input value as error suffix
const addCurrentValue = function (error, input) {
  return error.validation
    ? wrapErrorValue(error, 'Current value', input)
    : error
}

const addExampleValue = function (error, { example }) {
  return error.validation && example !== undefined
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

// eslint-disable-next-line no-unused-vars
const callUserFunc = async function (userFunc, { example, prefix, ...info }) {
  return await maybeFunction(userFunc, info)
}
