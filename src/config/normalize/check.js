// eslint-disable-next-line no-restricted-imports, node/no-restricted-import
import assert from 'assert'
import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'

import { mapValues } from '../../utils/map.js'

export const checkObjectProps = function (value, checker) {
  checkObject(value)
  return mapValues(value, checker)
}

export const checkBoolean = function (value) {
  assert(typeof value === 'boolean', 'must be true or false')
}

export const checkInteger = function (value) {
  assert(Number.isInteger(value), 'must be an integer')
}

export const checkString = function (value) {
  assert(typeof value === 'string', 'must be a string')
}

export const checkDefinedString = function (value) {
  checkString(value)
  assert(value.trim() !== '', 'must not be empty')
}

// Many array configuration properties can optionally a single element, for
// simplicity providing it is the most common use case.
// We also allow duplicate values but remove them.
export const normalizeOptionalArray = function (value = []) {
  return Array.isArray(value) ? [...new Set(value)] : [value]
}

export const checkArrayLength = function (value) {
  assert(value.length !== 0, 'must not be an empty array')
}

export const checkObject = function (value) {
  assert(isPlainObj(value), 'must be a plain object')
}

export const checkJson = function (value) {
  assert(
    isJson(value),
    'must only contain strings, numbers, booleans, nulls, arrays or plain objects',
  )
}

const isJson = function (value) {
  try {
    return isDeepStrictEqual(JSON.parse(JSON.stringify(value)), value)
  } catch {
    return false
  }
}
