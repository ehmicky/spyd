import { isDeepStrictEqual, inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../../error/main.js'
import { mapValues } from '../../utils/map.js'

// A normalizing function transforms a value by returning.
// It can return `undefined` to leave the value as is.
export const runNormalizer = function (normalizer, value, ...args) {
  const newValue = normalizer(value, ...args)
  return newValue === undefined ? value : newValue
}

export const checkObjectProps = function (value, name, checker) {
  checkObject(value, name)
  return mapValues(value, (childValue, childName) => {
    checker(childValue, `${name}.${childName}`)
  })
}

export const checkBoolean = function (value, name) {
  if (typeof value !== 'boolean') {
    throw new UserError(`'${name}' must be true or false: ${inspect(value)}`)
  }
}

export const checkInteger = function (value, name) {
  if (!Number.isInteger(value)) {
    throw new UserError(`'${name}' must be an integer: ${inspect(value)}`)
  }
}

export const checkString = function (value, name) {
  if (typeof value !== 'string') {
    throw new UserError(`'${name}' must be a string: ${inspect(value)}`)
  }
}

export const checkDefinedString = function (value, name) {
  checkString(value, name)

  if (value.trim() === '') {
    throw new UserError(`'${name}' must not be empty.`)
  }
}

// Many array configuration properties can optionally a single element, for
// simplicity providing it is the most common use case.
// We also allow duplicate values but remove them.
export const normalizeOptionalArray = function (value = []) {
  return Array.isArray(value) ? [...new Set(value)] : [value]
}

export const checkArrayLength = function (value, name) {
  if (value.length === 0) {
    throw new UserError(`At least one '${name}' must be defined.`)
  }
}

export const checkObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(
      `'${name}' value must be a plain object: ${inspect(value)}`,
    )
  }
}

export const checkJson = function (value, name) {
  if (!isJson(value)) {
    throw new UserError(
      `'${name}' must only contain strings, numbers, booleans, nulls, arrays or plain objects: ${inspect(
        value,
      )}`,
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
