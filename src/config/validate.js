import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

// Configuration validation helper functions
export const validateDeepObject = function (object, name) {
  Object.entries(object).forEach(([propName, value]) => {
    validateObject(value, `${name}.${propName}`)
  })
}

const validateObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(`'${name}' value must be a plain object: ${value}`)
  }
}

export const validateStringArray = function (value, name) {
  if (value !== undefined && !(Array.isArray(value) && value.every(isString))) {
    throw new UserError(`'${name}' must be an array of strings: ${value}`)
  }
}

const isString = function (value) {
  return typeof value === 'string'
}

export const validatePositiveInteger = function (value, name) {
  if (!Number.isInteger(value) || value < 0) {
    throw new UserError(`'${name}' must be a positive integer: ${value}`)
  }
}
