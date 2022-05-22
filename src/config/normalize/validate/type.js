import { isDeepStrictEqual } from 'util'

export const validateNumberString = function (value) {
  if (typeof value !== 'string' && !Number.isFinite(value)) {
    throw new TypeError('must be a string or a number.')
  }

  validateNonEmptyString(value)
}

export const validateDefinedString = function (value) {
  validateString(value)
  validateNonEmptyString(value)
}

const validateString = function (value) {
  if (typeof value !== 'string') {
    throw new TypeError('must be a string.')
  }
}

const validateNonEmptyString = function (value) {
  if (typeof value === 'string' && value.trim() === '') {
    throw new Error('must not be an empty string.')
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
