import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'

import { mapValues } from '../../utils/map.js'

export const validateObjectProps = function (value, checker) {
  validateObject(value)
  return mapValues(value, checker)
}

export const validateBoolean = function (value) {
  if (typeof value !== 'boolean') {
    throw new TypeError('must be true or false.')
  }
}

export const validateInteger = function (value) {
  if (!Number.isInteger(value)) {
    throw new TypeError('must be an integer.')
  }
}

export const validateDefinedString = function (value) {
  validateString(value)

  if (value.trim() === '') {
    throw new Error('must not be empty.')
  }
}

export const validateString = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}

export const validateEmptyArray = function (value) {
  if (Array.isArray(value) && value.length === 0) {
    throw new Error('must not be an empty array.')
  }
}

export const validateObject = function (value) {
  if (!isPlainObj(value)) {
    throw new Error('must be a plain object.')
  }
}

export const validateJson = function (value) {
  if (!isJson(value)) {
    throw new Error(
      'must only contain strings, numbers, booleans, nulls, arrays or plain objects.',
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
