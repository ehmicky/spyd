import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

// Configuration validation helper functions
export const checkObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(`'${name}' value must be a plain object: ${value}`)
  }
}

export const checkStringArray = function (value, name) {
  if (value !== undefined && !(Array.isArray(value) && value.every(isString))) {
    throw new UserError(`'${name}' must be an array of strings: ${value}`)
  }
}

export const checkDefinedString = function (value, name) {
  if (!isString(value) || value.trim() === '') {
    throw new UserError(`'${name}' must be a non-empty string: ${value}`)
  }
}

const isString = function (value) {
  return typeof value === 'string'
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
