import { isDeepStrictEqual } from 'util'

export const validateArray = function (value) {
  if (!Array.isArray(value)) {
    throw new TypeError('must be an array.')
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
