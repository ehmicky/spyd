import { isDeepStrictEqual } from 'util'

import isPlainObj from 'is-plain-obj'

export const validateArray = function (value) {
  if (!Array.isArray(value)) {
    throw new TypeError('must be an array.')
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

export const validateObjectOrString = function (value) {
  if (typeof value !== 'string' && !isPlainObj(value)) {
    throw new Error('must be a string or a plain object.')
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

export const validateFunction = function (value) {
  if (typeof value !== 'function') {
    throw new TypeError('must be a function.')
  }
}
