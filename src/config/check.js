import { isDeepStrictEqual, inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { UserError } from '../error/main.js'

// Configuration validation helper functions
export const checkObject = function (value, name) {
  if (!isPlainObj(value)) {
    throw new UserError(
      `'${name}' value must be a plain object: ${inspect(value)}`,
    )
  }
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

export const checkDefinedStringArray = function (value, name) {
  value.forEach((item, index) => {
    checkString(value, name)
    checkDefinedString(item, getIndexName(index, name))
  })
}

export const checkStringArray = function (value, name) {
  value.forEach((item, index) => {
    checkString(item, getIndexName(index, name))
  })
}

// When `index` is `0`, it is possible that the value was arrified
const getIndexName = function (index, name) {
  return index === 0 ? name : `${name}[${index}]`
}

export const checkDefinedString = function (value, name) {
  if (value.trim() === '') {
    throw new UserError(`'${name}' must not be empty.`)
  }
}

export const checkString = function (value, name) {
  if (typeof value !== 'string') {
    throw new UserError(`'${name}' must be a string: ${inspect(value)}`)
  }
}

export const checkStringsObject = function (value, name) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkString(propValue, `${name}.${childName}`)
  })
}

export const checkJsonDeepObject = function (value, name) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkJsonObject(propValue, `${name}.${childName}`)
  })
}

export const checkJsonObject = function (value, name) {
  Object.entries(value).forEach(([childName, propValue]) => {
    checkJson(propValue, `${name}.${childName}`)
  })
}

const checkJson = function (value, name) {
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
