// eslint-disable-next-line no-restricted-imports, node/no-restricted-import
import assert from 'assert'
import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'

import { mapValues } from '../../utils/map.js'

export const validateObjectProps = function (value, checker) {
  validateObject(value)
  return mapValues(value, checker)
}

export const validateBoolean = function (value) {
  assert(typeof value === 'boolean', 'must be true or false')
}

export const validateInteger = function (value) {
  assert(Number.isInteger(value), 'must be an integer')
}

export const validateString = function (value) {
  assert(typeof value === 'string', 'must be a string')
}

export const validateDefinedString = function (value) {
  validateString(value)
  assert(value.trim() !== '', 'must not be empty')
}

export const validateEmptyArray = function (value) {
  assert(
    !Array.isArray(value) || value.length !== 0,
    'must not be an empty array',
  )
}

export const validateObject = function (value) {
  assert(isPlainObj(value), 'must be a plain object')
}

export const validateJson = function (value) {
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
