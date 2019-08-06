import { isPlainObject } from '../utils/main.js'

// Options validation helper functions
export const validateDeepObject = function(object, name) {
  Object.entries(object).forEach(([propName, value]) =>
    validateObject(value, `${name}.${propName}`),
  )
}

const validateObject = function(value, name) {
  if (!isPlainObject(value)) {
    throw new TypeError(`'${name}' value must be a plain object: ${value}`)
  }
}

export const validateStringArray = function(value, name) {
  if (value !== undefined && !(Array.isArray(value) && value.every(isString))) {
    throw new TypeError(`'${name}' must be an array of strings: ${value}`)
  }
}

const isString = function(value) {
  return typeof value === 'string'
}

export const validatePositiveNumber = function(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`'${name}' must be a positive number: ${value}`)
  }
}
