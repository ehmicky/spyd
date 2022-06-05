import { normalizePath } from 'wild-wild-parser'

// Normalize string definition
export const normalizeString = function (definition) {
  if (typeof definition !== 'string') {
    throw new TypeError('must be a string.')
  }

  return definition.trim()
}

// Normalize boolean definition
export const normalizeBoolean = function (definition) {
  if (typeof definition !== 'boolean') {
    throw new TypeError('must be a boolean.')
  }

  return definition
}

// Normalize property path definition
export const normalizePropertyPath = function (definition) {
  try {
    return normalizePath(definition)
  } catch (cause) {
    throw new Error('must be a valid path:\n', { cause })
  }
}

// Validate input is a non-empty string
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
