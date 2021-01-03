import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

// Configuration validation helper functions
export const checkObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(`'${name}' value must be a plain object: ${value}`)
  }
}

export const normalizeOptionalArray = function (value, name) {
  if (typeof value === 'string') {
    checkDefinedString(value, name)
    return [value]
  }

  checkDefinedStringArray(value, name)
  return value
}

export const checkDefinedStringArray = function (value, name) {
  if (value === undefined) {
    return
  }

  if (!Array.isArray(value)) {
    throw new UserError(`'${name}' must be an array of strings: ${value}`)
  }

  value.forEach((item, key) => {
    checkDefinedString(item, `${name}[${key}]`)
  })
}

export const checkDefinedString = function (value, name) {
  if (!isDefinedString(value)) {
    throw new UserError(`'${name}' must be a non-empty string: ${value}`)
  }
}

const isDefinedString = function (value) {
  return typeof value === 'string' && value.trim() !== ''
}

export const checkJson = function (value, name) {
  if (!isJson(value)) {
    throw new UserError(
      `'${name}' must only contain strings, numbers, booleans, nulls, arrays or plain objects: ${value}`,
    )
  }
}

const isJson = function (value) {
  try {
    return isDeepStrictEqual(JSON.parse(JSON.stringify(value)), value)
  } catch {
    return false
  }
}

export const checkPositiveInteger = function (value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new UserError(`'${name}' must be a positive integer: ${value}`)
  }
}

export const checkSaveDuration = function (duration, save) {
  if (duration === 0 && save) {
    throw new UserError(
      `The "duration" configuration property must not be 0 when "save" is enabled.`,
    )
  }
}
